// app/api/attendance/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Attendance from '@/models/Attendance';

export async function GET(req) {
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const start = searchParams.get('start');
  const end = searchParams.get('end');

  let filter = {};
  if (start && end) {
    filter.createdAt = {
      $gte: new Date(start),
      $lte: new Date(end),
    };
  }

  const records = await Attendance.find(filter).sort({ createdAt: -1 });
  return NextResponse.json(records);
}

export async function POST(req) {
  await dbConnect();

  try {
    const body = await req.json();
    console.log('Received POST data:', body); // debug incoming data

    const newRecord = new Attendance(body);
    await newRecord.save();

    return NextResponse.json(newRecord, { status: 201 });
  } catch (error) {
    console.error('Save error:', error); // log full error
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

