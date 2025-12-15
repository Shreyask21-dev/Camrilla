import { NextResponse } from "next/server";
import db from "@/lib/db";
import ExcelJS from "exceljs";

export async function POST(req) {
  try {
    const { assignmentId } = await req.json();

    if (!assignmentId) {
      return NextResponse.json({ error: "Missing assignmentId" }, { status: 400 });
    }

    const [items] = await db.query(
      `SELECT ei.description, ei.amount, ei.category, ei.date
       FROM expense_items ei
       JOIN expenses e ON ei.expense_id = e.id
       WHERE e.assignment_id = ?
       ORDER BY ei.date ASC`,
      [assignmentId]
    );

    if (items.length === 0) {
      return NextResponse.json({ error: "No expenses found" }, { status: 404 });
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Previous Expenses");

    // Headers
    sheet.addRow(["Description", "Amount (₹)", "Category", "Date"]);

    // Rows
    items.forEach(item => {
      sheet.addRow([
        item.description || "-",
        item.amount,
        item.category || "-",
        new Date(item.date).toLocaleDateString(),
      ]);
    });

    sheet.columns.forEach(col => (col.width = 20));

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="Previous-Expenses-${assignmentId}.xlsx"`,
      },
    });
  } catch (err) {
    console.error("❌ Excel export failed:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
