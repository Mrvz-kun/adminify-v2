import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import AddStock from '@/models/AddStock';

// GET /api/addstock
export async function GET() {
  await dbConnect();

  try {
    const records = await AddStock.find().sort({ createdAt: -1 });
    return NextResponse.json(records);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/addstock
export async function POST(req) {
  await dbConnect();

  try {
    const body = await req.json();
    const newRecord = await AddStock.create(body);
    return NextResponse.json(newRecord, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
