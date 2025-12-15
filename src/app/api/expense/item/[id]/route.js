import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function DELETE(_, context) {
  const { id } = context.params;

  if (!id) {
    return NextResponse.json({ error: 'Missing item ID' }, { status: 400 });
  }

  try {
    await db.execute(`DELETE FROM expense_items WHERE id = ?`, [id]);
    return NextResponse.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting item:', error);
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
 const { id } = await params;// ✅ No await needed
  const body = await request.json();
  const { description, amount, category, date } = body;

  if (!id || !description || !amount || !category || !date) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    await db.execute(
      `UPDATE expense_items SET description = ?, amount = ?, category = ?, date = ? WHERE id = ?`,
      [description, amount, category, date, id]
    );

    return NextResponse.json({ message: 'Item updated successfully' });
  } catch (err) {
    console.error('PUT error:', err);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
