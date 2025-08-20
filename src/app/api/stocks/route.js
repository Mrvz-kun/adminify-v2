import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Stock from '@/models/Stock';

// GET /api/stocks
export async function GET() {
  await dbConnect();

  try {
    const stocks = await Stock.find({ isDeleted: { $ne: true } }).sort({ createdAt: -1 });
    return NextResponse.json(stocks);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/stocks
export async function POST(req) {
  await dbConnect();

  try {
    const body = await req.json();
    const newStock = await Stock.create(body);
    return NextResponse.json(newStock, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
