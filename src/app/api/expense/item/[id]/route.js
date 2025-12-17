import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function DELETE(request, context) {
  const params = await context.params; // ✅ FIX
  const idNum = Number(params.id);

  if (!Number.isInteger(idNum)) {
    return NextResponse.json({ error: "Invalid item ID" }, { status: 400 });
  }

  try {
    const [result] = await db.execute(
      "DELETE FROM expense_items WHERE id = ?",
      [idNum]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Item deleted successfully" });
  } catch (error) {
    console.error("Error deleting item:", error);
    return NextResponse.json(
      { error: "Failed to delete item" },
      { status: 500 }
    );
  }
}

export async function PUT(request, context) {
  const params = await context.params; // ✅ FIX
  const idNum = Number(params.id);
  const body = await request.json();

  const { description, amount, category, date } = body;

  if (
    !Number.isInteger(idNum) ||
    !description ||
    !amount ||
    !category ||
    !date
  ) {
    return NextResponse.json(
      { error: "Missing or invalid required fields" },
      { status: 400 }
    );
  }

  try {
    const [result] = await db.execute(
      `UPDATE expense_items
       SET description = ?, amount = ?, category = ?, date = ?
       WHERE id = ?`,
      [description, amount, category, date, idNum]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Item updated successfully" });
  } catch (error) {
    console.error("PUT error:", error);
    return NextResponse.json(
      { error: "Update failed" },
      { status: 500 }
    );
  }
}
