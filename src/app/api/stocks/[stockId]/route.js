import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Stock from '@/models/Stock';

// GET /api/stocks/[stockId]
export async function GET(req, { params }) {
  await dbConnect();

  const { stockId } = params;

  try {
    const stock = await Stock.findOne({ stockId });
    if (!stock) {
      return NextResponse.json({ error: 'Stock not found' }, { status: 404 });
    }
    return NextResponse.json(stock);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT /api/stocks/[stockId]
export async function PUT(req, { params }) {
  await dbConnect();

  const { stockId } = params;

  try {
    const body = await req.json();
    const updated = await Stock.findOneAndUpdate({ stockId }, body, { new: true });
    if (!updated) {
      return NextResponse.json({ error: 'Stock not found' }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/stocks/[stockId]
export async function DELETE(req, { params }) {
  await dbConnect();
  const { stockId } = params;

  try {
    const stock = await Stock.findOne({ stockId });

    if (!stock) {
      return NextResponse.json({ error: "Stock not found" }, { status: 404 });
    }

    // Soft delete the stock
    await Stock.updateOne({ stockId }, { isDeleted: true });

    // Also optionally soft-delete related records (optional)
    // await Bincard.updateMany({ stkRefId: stockId }, { isDeleted: true });
    // await AddStock.updateMany({ stockRefId: stockId }, { isDeleted: true });

    return NextResponse.json({ message: "Stock soft-deleted" }, { status: 200 });

  } catch (err) {
    console.error("Soft delete failed:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}


// PATCH /api/stocks/[stockId]
export async function PATCH(req, { params }) {
  await dbConnect();

  const { stockId } = params;

  try {
    const { addQty } = await req.json();

    if (typeof addQty !== 'number' || isNaN(addQty)) {
      return NextResponse.json({ error: 'Invalid quantity' }, { status: 400 });
    }

    const stock = await Stock.findOne({ stockId });
    if (!stock) {
      return NextResponse.json({ error: 'Stock not found' }, { status: 404 });
    }

    const updated = await Stock.findOneAndUpdate(
      { stockId },
      { $set: { stockBalance: (stock.stockBalance || 0) + addQty } },
      { new: true }
    );

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
