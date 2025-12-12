import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema(
  {
    action: { type: String, required: true },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    details: { type: String },
    entity: { type: String },
    entityId: { type: String }
  },
  { timestamps: true }
);

export default mongoose.model('ActivityLog', activityLogSchema);

