import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ActivityLog from '@/models/ActivityLog';

export async function GET() {
  await dbConnect();
  const logs = await ActivityLog.find().sort({ timestamp: -1 }).limit(100);
  return NextResponse.json(logs);
}

export async function POST(req) {
  await dbConnect();
  const data = await req.json();

  const log = await ActivityLog.create({
    ...data,
    timestamp: new Date()
  });

  return NextResponse.json(log, { status: 201 });
}
