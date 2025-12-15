import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  try {
    const [rows] = await db.query(
      "SELECT name FROM expense_categories WHERE userId = ?",
      [userId]
    );
    const categories = rows.map((row) => row.name);
    return NextResponse.json(categories);
  } catch (err) {
    console.error("❌ Error fetching categories:", err);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(req) {
  const body = await req.json();
  const { name, userId } = body;

  console.log("📥 POST incoming:", { name, userId });

  // Basic validation
  if (!name || !userId) {
    return NextResponse.json({ error: "Missing data" }, { status: 400 });
  }

  if (isNaN(userId)) {
    return NextResponse.json({ error: "Invalid userId" }, { status: 400 });
  }

  const normalized = name.trim().toLowerCase();

  try {
    // Check for duplicate category
    const [existing] = await db.query(
      "SELECT * FROM expense_categories WHERE LOWER(name) = ? AND userId = ?",
      [normalized, userId]
    );

    if (existing.length > 0) {
      return NextResponse.json({ error: "Category already exists" }, { status: 409 });
    }

    // Insert category
    await db.query(
      "INSERT INTO expense_categories (name, userId) VALUES (?, ?)",
      [normalized, userId]
    );

    console.log("✅ Category added:", normalized);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ DB insert error:", err);
    return NextResponse.json({ error: "Failed to add category" }, { status: 500 });
  }
}

export async function DELETE(req) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name");
  const userId = searchParams.get("userId");

  console.log("📥 DELETE incoming:", { name, userId });

  // Basic validation
  if (!name || !userId) {
    return NextResponse.json({ error: "Missing data" }, { status: 400 });
  }

  if (isNaN(userId)) {
    return NextResponse.json({ error: "Invalid userId" }, { status: 400 });
  }

  const normalized = name.trim().toLowerCase();

  try {
    // Check if category exists
    const [existing] = await db.query(
      "SELECT * FROM expense_categories WHERE LOWER(name) = ? AND userId = ?",
      [normalized, userId]
    );

    if (existing.length === 0) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    // Delete category
    await db.query(
      "DELETE FROM expense_categories WHERE LOWER(name) = ? AND userId = ?",
      [normalized, userId]
    );

    console.log("✅ Category deleted:", normalized);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ DB delete error:", err);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
