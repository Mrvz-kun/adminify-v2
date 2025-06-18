// models/Attendance.js
import mongoose from 'mongoose';
import { nanoid } from 'nanoid';

const AttendanceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    inclusiveDate: { type: Date, required: true },
    activity: { type: String, required: true },
    details: { type: String, required: true },
    remarks: { type: String, required: false, default: '' },
    AFLVerification: { type: String,  default: 'Pending' },
    publicId: { type: String, required: false, unique: true },

    encodedBy: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } } // Adds createdAt
);

// Generate publicId: format ATT-xxxxxx
AttendanceSchema.pre('save', async function (next) {
  if (!this.publicId) {
    const PREFIX = 'att-';
    const MAX_ATTEMPTS = 5;

    for (let i = 0; i < MAX_ATTEMPTS; i++) {
      const id = PREFIX + nanoid(6);
      const exists = await mongoose.models.Attendance.findOne({ publicId: id });
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
AttendanceSchema.statics.findByPublicId = function (publicId) {
  return this.findOne({ publicId });
};

export default mongoose.models.Attendance || mongoose.model('Attendance', AttendanceSchema);
