import mongoose from 'mongoose';

const ActivityLogSchema = new mongoose.Schema({
  username: String,
  action: String,
  details: String,
  timestamp: {
    type: Date,
    default: Date.now,
    expires: '7d'  // ⏰ Automatically delete logs after 7 days
  }
});

export default mongoose.models.ActivityLog || mongoose.model('ActivityLog', ActivityLogSchema);
