import { NextResponse } from "next/server";
import crypto from "crypto";
import db from "@/lib/db";

const SUCCESS_STATUSES = new Set(["SUCCESS", "PURCHASED", "RESTORED"]);
const JWT_HMAC_ALGORITHMS = {
  HS256: "sha256",
  HS384: "sha384",
  HS512: "sha512",
};

function base64UrlDecode(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(
    normalized.length + ((4 - (normalized.length % 4)) % 4),
    "="
  );
  return Buffer.from(padded, "base64");
}

function base64UrlEncode(value) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function getUserFromRequest(req) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.slice("Bearer ".length).trim();
  const [encodedHeader, encodedPayload, signature] = token.split(".");

  if (
    !encodedHeader ||
    !encodedPayload ||
    !signature ||
    !process.env.JWT_SECRET
  ) {
    return null;
  }

  try {
    const header = JSON.parse(base64UrlDecode(encodedHeader).toString("utf8"));

    const digestAlgorithm = JWT_HMAC_ALGORITHMS[header.alg];
    if (!digestAlgorithm) {
      return null;
    }

    const expectedSignature = base64UrlEncode(
      crypto
        .createHmac(digestAlgorithm, process.env.JWT_SECRET)
        .update(`${encodedHeader}.${encodedPayload}`)
        .digest()
    );

    const signatureBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (
      signatureBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
    ) {
      return null;
    }

    const payload = JSON.parse(base64UrlDecode(encodedPayload).toString("utf8"));
    const nowInSeconds = Math.floor(Date.now() / 1000);

    if (payload.exp && Number(payload.exp) < nowInSeconds) {
      return null;
    }

    return payload;
  } catch (err) {
    console.error("Apple payment JWT auth error:", err.message);
    return null;
  }
}

function asNullableString(value) {
  if (value === undefined || value === null) return null;
  const text = String(value).trim();
  return text.length > 0 ? text : null;
}

function asNumber(value) {
  if (value === undefined || value === null || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function asInteger(value) {
  const number = asNumber(value);
  return number === null ? null : Math.trunc(number);
}

function paymentDateToMillis(value) {
  if (value === undefined || value === null || value === "") {
    return Date.now();
  }

  const numericDate = Number(value);
  if (Number.isFinite(numericDate)) {
    return Math.trunc(numericDate);
  }

  const parsedDate = Date.parse(value);
  return Number.isNaN(parsedDate) ? Date.now() : parsedDate;
}

function resolveUserId(authUser, bodyUserId) {
  return (
    asInteger(authUser?.id) ??
    asInteger(authUser?.userId) ??
    asInteger(authUser?.user_id) ??
    asInteger(bodyUserId)
  );
}

function resolveUserEmail(authUser) {
  return asNullableString(authUser?.email ?? authUser?.sub);
}

export async function POST(req) {
  const authUser = getUserFromRequest(req);

  if (!authUser) {
    return NextResponse.json(
      { code: 1, message: "Unauthorized" },
      { status: 401 }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { code: 1, message: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const orderId = asNullableString(body.orderId ?? body.order_id);
  const bodyPlanId = asInteger(body.planId ?? body.plan_id);
  const authUserId = resolveUserId(authUser, null);
  const bodyUserId = asInteger(body.userId ?? body.user_id);
  const amount = asNumber(body.amount);
  const currency = asNullableString(body.currency) ?? "INR";
  const appleTransactionId = asNullableString(
    body.transactionId ??
      body.appleTransactionId ??
      body.purchaseId ??
      body.paymentGwRefNumber ??
      body.payment_gw_ref_number
  );
  const appleOriginalTransactionId = asNullableString(
    body.originalTransactionId ?? body.appleOriginalTransactionId
  );
  const productId = asNullableString(body.productId ?? body.productID);
  const paymentStatus = (
    asNullableString(body.paymentStatus ?? body.status) ?? "SUCCESS"
  ).toUpperCase();
  const paymentDate = paymentDateToMillis(
    body.paymentDate ?? body.payment_date ?? body.transactionDate
  );
  const paymentCompletionDate = paymentDateToMillis(
    body.paymentCompletionDate ?? body.payment_completion_date
  );
  const paymentMethod = "Apple App Store";
  const paymentNotes = [
    paymentMethod,
    productId ? `productId=${productId}` : null,
    appleOriginalTransactionId
      ? `originalTransactionId=${appleOriginalTransactionId}`
      : null,
  ]
    .filter(Boolean)
    .join("; ");

  if (!orderId) {
    return NextResponse.json(
      { code: 1, message: "orderId is required" },
      { status: 400 }
    );
  }

  if (amount === null) {
    return NextResponse.json(
      { code: 1, message: "amount is required" },
      { status: 400 }
    );
  }

  if (!SUCCESS_STATUSES.has(paymentStatus)) {
    return NextResponse.json(
      { code: 1, message: "Only successful Apple payments can be recorded" },
      { status: 400 }
    );
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [existingRows] = await connection.execute(
      "SELECT id, user_id, plan_id FROM user_payment WHERE order_id = ? LIMIT 1",
      [orderId]
    );
    const existingPayment = existingRows[0] ?? null;
    const existingUserId = asInteger(existingPayment?.user_id);
    const existingPlanId = asInteger(existingPayment?.plan_id);
    let authenticatedUserId = authUserId;

    if (!authenticatedUserId) {
      const authEmail = resolveUserEmail(authUser);
      if (authEmail) {
        const [userRows] = await connection.execute(
          "SELECT id FROM `user` WHERE email = ? LIMIT 1",
          [authEmail]
        );
        authenticatedUserId = asInteger(userRows[0]?.id);
      }
    }

    const userId = authenticatedUserId ?? existingUserId ?? bodyUserId;
    const planId = existingPlanId ?? bodyPlanId;

    if (!userId) {
      await connection.rollback();
      return NextResponse.json(
        { code: 1, message: "userId is required" },
        { status: 400 }
      );
    }

    if (!planId) {
      await connection.rollback();
      return NextResponse.json(
        { code: 1, message: "planId is required" },
        { status: 400 }
      );
    }

    if (
      authenticatedUserId &&
      existingPayment?.user_id &&
      authenticatedUserId !== asInteger(existingPayment.user_id)
    ) {
      await connection.rollback();
      return NextResponse.json(
        { code: 1, message: "Payment order does not belong to this user" },
        { status: 403 }
      );
    }

    const [updateResult] = await connection.execute(
      `UPDATE user_payment
       SET payment_status = ?,
           payment_date = ?,
           currency = ?,
           amount = ?,
           payment_gw_ref_number = ?,
           payment_notes = ?,
           payment_mode = ?,
           payment_completion_date = ?,
           user_id = ?,
           plan_id = ?
       WHERE order_id = ?`,
      [
        "SUCCESS",
        paymentDate,
        currency,
        amount,
        appleTransactionId,
        paymentNotes,
        paymentMethod,
        paymentCompletionDate,
        userId,
        planId,
        orderId,
      ]
    );

    let paymentId = null;
    let action = "updated";

    if (updateResult.affectedRows === 0) {
      const [insertResult] = await connection.execute(
        `INSERT INTO user_payment (
          payment_date,
          payment_status,
          currency,
          amount,
          order_id,
          payment_gw_ref_number,
          payment_notes,
          payment_mode,
          user_id,
          plan_id,
          payment_completion_date
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          paymentDate,
          "SUCCESS",
          currency,
          amount,
          orderId,
          appleTransactionId,
          paymentNotes,
          paymentMethod,
          userId,
          planId,
          paymentCompletionDate,
        ]
      );

      paymentId = insertResult.insertId;
      action = "inserted";
    } else {
      paymentId = existingPayment?.id ?? null;
    }

    await connection.commit();

    return NextResponse.json({
      code: 0,
      message: "Apple payment recorded successfully",
      data: {
        action,
        paymentId,
        orderId,
        paymentStatus: "SUCCESS",
        paymentMethod,
      },
    });
  } catch (err) {
    await connection.rollback();
    console.error("Apple payment response error:", err);

    return NextResponse.json(
      { code: 1, message: "Failed to record Apple payment" },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}
