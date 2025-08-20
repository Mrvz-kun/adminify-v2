import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Bincard from '@/models/Bincard';
import Stock from '@/models/Stock'; // Renamed from Supply to Stock

// POST: Create new Bincard entry and update related Stock
export async function POST(req) {
  await dbConnect();
  const body = await req.json();

  try {
    console.log('📦 Incoming Bincard Body:', body);

    if (!body.stkRefId) throw new Error("Missing stkRefId");

    // ✅ Ensure valid date
    if (body.dateReceived && !isNaN(Date.parse(body.dateReceived))) {
      body.dateReceived = new Date(body.dateReceived);
    } else {
      throw new Error('❌ Invalid or missing dateReceived');
    }

    // ✅ Fetch all bincard entries for this stock
    const allEntries = await Bincard.find({ stkRefId: body.stkRefId }).sort({
      dateReceived: 1,
      createdAt: 1,
    });

    // ✅ Determine insertion point
    const insertIndex = allEntries.findIndex(
      (entry) =>
        new Date(entry.dateReceived).getTime() > new Date(body.dateReceived).getTime()
    );
    const prevBalance =
      insertIndex > 0
        ? allEntries[insertIndex - 1].bincardBalance
        : allEntries.length > 0
        ? 0
        : 0;

    // ✅ Calculate current balance
    const newBalance =
      Number(prevBalance) +
      Number(body.receiptQty || 0) -
      Number(body.issuanceQty || 0);

    if (newBalance < 0) {
      return NextResponse.json(
        { error: "Issuance quantity exceeds available stock." },
        { status: 400 }
      );
    }

    // ✅ Create the entry with correct balance
    const newEntry = await Bincard.create({
      ...body,
      bincardBalance: newBalance,
    });

    // ✅ Re-fetch all entries and recompute balances forward
    const updatedEntries = await Bincard.find({ stkRefId: body.stkRefId }).sort({
      dateReceived: 1,
      createdAt: 1,
    });

    let runningBalance = 0;
    for (let entry of updatedEntries) {
      runningBalance =
        runningBalance + Number(entry.receiptQty || 0) - Number(entry.issuanceQty || 0);
      entry.bincardBalance = runningBalance;
      await entry.save();
    }

    // ✅ Update stock table with latest balance
    const latestBalance =
      updatedEntries[updatedEntries.length - 1]?.bincardBalance ?? 0;
    await Stock.findOneAndUpdate(
      { stockId: body.stkRefId },
      { stockBalance: latestBalance }
    );

    return NextResponse.json(newEntry, { status: 201 });
  } catch (err) {
    console.error("🔥 Error saving Bincard entry:", err);
    return NextResponse.json(
      { error: err.message || "Failed to save Bincard entry." },
      { status: 500 }
    );
  }
}

// GET: Fetch all or filtered Bincard entries by stkRefId
export async function GET(req) {
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const stkRefId = searchParams.get('stkRefId')?.trim();

  try {
    const query = stkRefId ? { stkRefId } : {};
    console.log('🔎 Fetching Bincard with query:', query);

    const entries = await Bincard.find(query).sort({ dateReceived: -1 });
    console.log('✅ Entries found:', entries.length);

    return NextResponse.json(entries);
  } catch (err) {
    console.error('❌ Error fetching Bincard entries:', err);
    return NextResponse.json({ error: 'Failed to fetch entries' }, { status: 500 });
  }
}
