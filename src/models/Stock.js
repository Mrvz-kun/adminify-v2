import mongoose from 'mongoose';
import { nanoid } from 'nanoid';

const StockSchema = new mongoose.Schema(
  {
    stockId: {
      type: String,
      default: () => `stk-${nanoid(6)}`, // ✅ Custom ID format like stock-K12aX3
      unique: true,
      index: true,
    },
    stockNo: { type: String, required: true, unique: true, trim: true },
    article: { type: String, required: true },
    description: { type: String },
    unitMeasure: { type: String },
    stockBalance: {
      type: Number,
      default: null,              // ✅ allows null
      min: [0, 'Balance cannot be negative'],
      validate: {
        validator: function (val) {
          return val === null || Number.isInteger(val); // ✅ allow null OR integer
        },
        message: '{VALUE} is not an integer or null',
      },
    },
    remarks: { type: String },
    createdBy: {
      type: String,
      required: true,
      default: 'User is not Available',
    },
    isDeleted: { type: Boolean, default: false }, 
  },
  { timestamps: true },
  
);

export default mongoose.models.Stock || mongoose.model('Stock', StockSchema);
