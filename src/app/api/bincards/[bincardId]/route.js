import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Bincard from "@/models/Bincard";
import Stock from "@/models/Stock";

export async function PUT(req, { params }) {
  await dbConnect();
  const { bincardId } = params;
  const body = await req.json();

  try {
    const targetEntry = await Bincard.findOne({ bincardId });

    if (!targetEntry) {
      return NextResponse.json({ error: "Bincard entry not found" }, { status: 404 });
    }

    if (targetEntry.issuedBy === "Jefferson N. Casugay") {
      return NextResponse.json(
        { error: "Editing is restricted for this entry." },
        { status: 403 }
      );
    }

    // Fetch ALL bincards for the same stock, sorted chronologically
    const allEntries = await Bincard.find({ stkRefId: targetEntry.stkRefId }).sort({
      dateReceived: 1,
      createdAt: 1,
    });

    // Identify the index of the target entry
    const index = allEntries.findIndex(entry => entry.bincardId === bincardId);

    if (index === -1) {
      return NextResponse.json({ error: "Entry not found in list" }, { status: 404 });
    }

    // Previous balance before the edited entry
    const previousBalance = index > 0 ? allEntries[index - 1].bincardBalance || 0 : 0;

    // Replace the target entry with the new data temporarily
    allEntries[index] = {
      ...allEntries[index]._doc,
      ...body, // Updated receiptQty / issuanceQty / etc.
    };

    // Recompute balances from the edited entry onward
    for (let i = index; i < allEntries.length; i++) {
      const prevBal = i === 0 ? 0 : allEntries[i - 1].bincardBalance || 0;

      const receipt = Number(allEntries[i].receiptQty || 0);
      const issuance = Number(allEntries[i].issuanceQty || 0);

      allEntries[i].bincardBalance = prevBal + receipt - issuance;

      // Persist changes in DB
      await Bincard.findOneAndUpdate(
        { bincardId: allEntries[i].bincardId },
        {
          ...allEntries[i],
          bincardBalance: allEntries[i].bincardBalance,
        }
      );
    }

    // Update Stock record with latest balance
    const latestBalance = allEntries[allEntries.length - 1].bincardBalance;

    await Stock.findOneAndUpdate(
      { stockId: targetEntry.stkRefId },
      { stockBalance: latestBalance }
    );

    console.log("✅ Recalculated future balances. Stock synced to:", latestBalance);

    return NextResponse.json(allEntries[index], { status: 200 });

  } catch (err) {
    console.error("🔥 Error in Bincard PUT handler:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
