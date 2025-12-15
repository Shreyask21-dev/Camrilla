// src/app/api/expense/from-camrilla/route.js
import { NextResponse } from "next/server";
import db from "@/lib/db"; // keep your alias if configured; otherwise adjust path

export async function POST(request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { assignmentId, expenseData } = body;
    if (!assignmentId || !expenseData) {
      return NextResponse.json(
        { error: "Missing assignmentId or expenseData" },
        { status: 400 }
      );
    }

    const { userId, note = "", total = 0, items = [] } = expenseData;

    if (!userId) {
      return NextResponse.json({ error: "Missing userId in expenseData" }, { status: 400 });
    }
    if (!Array.isArray(items)) {
      return NextResponse.json({ error: "expenseData.items must be an array" }, { status: 400 });
    }

    // Get a dedicated connection for transaction
    const conn = await db.getConnection();

    try {
      await conn.beginTransaction();

      // Insert summary row (make sure 'total' and 'userId' columns exist in expenses table)
      const [expenseResult] = await conn.execute(
        `INSERT INTO expenses (assignment_id, userId, note, total, created_at)
         VALUES (?, ?, ?, ?, NOW())`,
        [assignmentId, userId, note, parseFloat(total) || 0]
      );

      const expenseId = expenseResult.insertId;

      // Insert items (if any)
      for (const item of items) {
        const description = item.description || "";
        const amount = parseFloat(item.amount) || 0;
        const category = item.category || null;
        const date = item.date || null; // expects 'YYYY-MM-DD' or null

        await conn.execute(
          `INSERT INTO expense_items (expense_id, description, amount, category, date, created_at)
           VALUES (?, ?, ?, ?, ?, NOW())`,
          [expenseId, description, amount, category, date]
        );
      }

      await conn.commit();
      conn.release();

      return NextResponse.json({ success: true, expenseId }, { status: 201 });
    } catch (dbErr) {
      await conn.rollback().catch(() => {});
      conn.release();
      console.error("DB error saving expense:", dbErr);
      // return DB error message to help debugging (remove or sanitize in prod)
      return NextResponse.json(
        { error: "Database error", detail: dbErr.message || String(dbErr) },
        { status: 500 }
      );
    }
  } catch (err) {
    console.error("Route error:", err);
    return NextResponse.json(
      { error: "Internal Server Error", detail: err.message || String(err) },
      { status: 500 }
    );
  }
}
