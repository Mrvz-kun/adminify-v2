import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  name: String,
  avatar: String, // e.g., '/avatars/marvz.png' or external URL
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
