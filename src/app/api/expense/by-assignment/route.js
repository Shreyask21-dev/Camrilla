import { NextResponse } from 'next/server';
import db from '@/lib/db';
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const assignmentId = searchParams.get('id');

  if (!assignmentId) {
    return NextResponse.json({ error: 'Missing assignment ID' }, { status: 400 });
  }

  try {
    // Fetch all expenses for this assignment
    const [expenses] = await db.execute(
      'SELECT * FROM expenses WHERE assignment_id = ? ORDER BY created_at DESC',
      [assignmentId]
    );

    if (expenses.length === 0) {
      return NextResponse.json({ message: 'No expenses found', expenses: [], items: {} });
    }

    // Fetch all items grouped by expense_id
    const expenseIds = expenses.map(e => e.id);
    const [items] = await db.execute(
      `SELECT * FROM expense_items WHERE expense_id IN (${expenseIds.map(() => '?').join(',')})`,
      expenseIds
    );

    // Group items by expense_id
    const itemMap = {};
    for (const item of items) {
      if (!itemMap[item.expense_id]) itemMap[item.expense_id] = [];
      itemMap[item.expense_id].push(item);
    }

    return NextResponse.json({ expenses, items: itemMap });
  } catch (err) {
    console.error('Expense fetch error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
