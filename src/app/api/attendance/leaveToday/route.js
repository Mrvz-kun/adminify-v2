import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Attendance from '@/models/Attendance';

export async function GET() {
  await dbConnect();

  // Get start and end of today
  const now = new Date();
  const startOfDay = new Date(now.setHours(0, 0, 0, 0));
  const endOfDay = new Date(now.setHours(23, 59, 59, 999));

  try {
    const onLeaveToday = await Attendance.find({
      activity: { $regex: /^on leave$/i },
      inclusiveDate: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    }).sort({ name: 1 });

    return NextResponse.json(onLeaveToday);
  } catch (error) {
    console.error('Error fetching inclusiveDate-based leave:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
