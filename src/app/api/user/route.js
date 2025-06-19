import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Attendance from '@/models/Attendance';
import AFL from '@/models/AFL';
import User from '@/models/User';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');

  if (!username) {
    return NextResponse.json({ error: 'Username is required' }, { status: 400 });
  }

  await dbConnect();
  const normalizedUsername = username.toLowerCase().trim();

  try {
    // Count attendance
    const attendanceCount = await Attendance.countDocuments({
      encodedBy: { $regex: `^${normalizedUsername}$`, $options: 'i' },
    });

    // Count AFL
    const aflCount = await AFL.countDocuments({
      encodedBy: { $regex: `^${normalizedUsername}$`, $options: 'i' },
    });

    // Find user avatar
    const user = await User.findOne({
      username: { $regex: `^${normalizedUsername}$`, $options: 'i' },
    }).lean();

    return NextResponse.json({
      attendanceCount,
      aflCount,
      avatar: user?.avatar || null,
    });
  } catch (err) {
    console.error('Error fetching user stats:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
