import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import AFL from '@/models/AFL';
import Attendance from '@/models/Attendance';

export async function GET(req, context) {
  await dbConnect();

  const { publicId } = context.params;

  try {
    const record = await AFL.findOne({ publicId });
    if (!record) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }
    return NextResponse.json(record);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req, context) {
  await dbConnect();

  const { publicId } = context.params;

  try {
    const body = await req.json();
    const updated = await AFL.findOneAndUpdate({ publicId }, body, { new: true });
    if (!updated) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req, context) {
  await dbConnect();

  const { publicId } = context.params;

  if (!publicId) {
    return NextResponse.json({ error: 'Missing publicId' }, { status: 400 });
  }

  try {
    // 1. Delete AFL record
    const deleted = await AFL.findOneAndDelete({ publicId });
    if (!deleted) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }

    // 2. Revert attendance linked to this AFL
    await Attendance.updateMany(
      { AFLVerification: publicId },
      { $set: { AFLVerification: 'Pending' } }
    );

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Delete AFL error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
