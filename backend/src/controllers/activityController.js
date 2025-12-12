import ActivityLog from '../models/ActivityLog.js';

export const listActivity = async (_req, res) => {
  const logs = await ActivityLog.find().populate('actor').sort({ createdAt: -1 }).limit(200);
  res.json(logs);
};

