// models/AFL.js
import mongoose from 'mongoose';
import { nanoid } from 'nanoid';

const AFLSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    dateReceived: { type: Date, required: true },
    typeOfLeave: { type: String, required: true },
    details: { type: String, required: true },
    inclusiveDate: { type: String, required: true },
    dateTransmitted: { type: String },
    rpmoReceiver: { type: String },
    remarks: { type: String, required: false, default: '' },
    verified: { type: Boolean, default: false },
    publicId: { type: String, unique: true },

    encodedBy: { type: String, required: false, default: 'Unknown' },
  },
  { timestamps: { createdAt: true, updatedAt: false } } // Adds createdAt
);

// Generate publicId: format AFL-xxxxxx
AFLSchema.pre('save', async function (next) {
  if (!this.publicId) {
    const PREFIX = 'afl-';
    const MAX_ATTEMPTS = 5;

    for (let i = 0; i < MAX_ATTEMPTS; i++) {
      const id = PREFIX + nanoid(6);
      const exists = await mongoose.models.AFL.findOne({ publicId: id });
      if (!exists) {
        this.publicId = id;
        return next();
      }
    }

    return next(new Error('Failed to generate a unique publicId after multiple attempts'));
  }

  next();
});

// Static method to query by publicId
AFLSchema.statics.findByPublicId = function (publicId) {
  return this.findOne({ publicId });
};

export default mongoose.models.AFL || mongoose.model('AFL', AFLSchema);
