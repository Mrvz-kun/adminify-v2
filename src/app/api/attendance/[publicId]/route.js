import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import AFL from '@/models/AFL';
import Attendance from '@/models/Attendance';

// GET
export async function GET(req, context) {
  await dbConnect();

  const { publicId } = context.params;

  try {
    const record = await Attendance.findOne({ publicId });
    if (!record) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }
    return NextResponse.json(record);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT
export async function PUT(req, context) {
  await dbConnect();

  const { publicId } = context.params;

  try {
    const body = await req.json();
    const updated = await Attendance.findOneAndUpdate({ publicId }, body, { new: true });
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
  console.log("Params:", context.params);

  try {
    // 1. Delete the AFL
    const deleted = await Attendance.findOneAndDelete({ publicId });
    if (!deleted) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }

    // 2. Revert attendances linked to this AFL
    const result = await Attendance.updateMany(
      { AFLVerification: publicId },
      { $set: { AFLVerification: 'Pending' } }
    );

    console.log(`Reverted ${result.modifiedCount} attendance records`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete error:", error); // ✅ Log full error
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
