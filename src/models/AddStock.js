import mongoose from 'mongoose';
import { nanoid } from 'nanoid';

const AddStockSchema = new mongoose.Schema(
  {
    addStockId: {
      type: String,
      default: () => `addstk-${nanoid(6)}`, // e.g., addstk-K12aX3
      unique: true,
      index: true,
    },

    // Reference to the main Stock
    stockRefId: {
      type: String, // You can change to Schema.Types.ObjectId if your Stock._id is being used
      required: true,
    },

    // Stock-related info (duplicated for snapshot)
    stockNo: { type: String, required: true, trim: true },

    // New stock-in details
    dateReceived: { type: Date, required: true },
    risNo: { type: String, required: true, trim: true },
    addQty: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
      validate: {
        validator: Number.isInteger,
        message: '{VALUE} is not an integer value',
      },
    },

    remarks: { type: String },

    createdBy: {
      type: String,
      required: true,
      default: 'User not identified',
    },
  },
  { timestamps: true }
);

export default mongoose.models.AddStock || mongoose.model('AddStock', AddStockSchema);
