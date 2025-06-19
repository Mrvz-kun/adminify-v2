import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import AFL from '@/models/AFL';

export async function GET() {
  await dbConnect();

  const today = new Date().toISOString().split('T')[0];

  try {
    // Only fetch AFLs that are NOT marked as "Cancelled"
    const aflRecords = await AFL.find({
      remarks: { $ne: 'Cancelled' }
    });

    const onLeaveToday = aflRecords.filter((record) => {
      const dates = Array.isArray(record.inclusiveDate)
        ? record.inclusiveDate
        : [record.inclusiveDate];

      return dates.some((d) => {
        if (!d) return false;
        const dateOnly = new Date(d).toISOString().split('T')[0];
        return dateOnly === today;
      });
    });

    const names = onLeaveToday.map((r) => ({
      name: r.name,
      typeOfLeave: r.typeOfLeave || 'Leave',
    }));

    return NextResponse.json({ count: names.length, names });
  } catch (error) {
    console.error('Leave check error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
