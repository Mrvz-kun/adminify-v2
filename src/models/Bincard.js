import mongoose from 'mongoose';
import { nanoid } from 'nanoid';

const BincardSchema = new mongoose.Schema({
  bincardId: {
  type: String,
  default: () => `bin-${nanoid(6)}`, // 👈 10-char unique ID
  unique: true,
  index: true,
  },
  dateReceived: { type: Date },
  risRef: { type: String }, // optional
  receiptQty: { type: Number, min: 0 },
  issuanceQty: { type: Number,  min: 0 },
  issuanceOffice: { type: String, },
  issuanceName: { type: String },
  bincardBalance: { type: Number, min: 0 },
  issuedBy: { type: String, default: 'Unknown' },
  stkRefId: { type: String,  ref: 'Stock' }

}, { timestamps: true });

export default mongoose.models.Bincard || mongoose.model('Bincard', BincardSchema);
