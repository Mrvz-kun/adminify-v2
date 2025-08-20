import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import AddStock from '@/models/AddStock';

// PUT /api/addstock/:addStockId
export async function PUT(req, { params }) {
  await dbConnect();

  try {
    const { addStockId } = params;
    const body = await req.json();

    const updated = await AddStock.findOneAndUpdate({ addStockId }, body, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// DELETE /api/addstock/:addStockId
export async function DELETE(req, { params }) {
  await dbConnect();

  try {
    const { addStockId } = params;

    const deleted = await AddStock.findOneAndDelete({ addStockId });

    if (!deleted) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
