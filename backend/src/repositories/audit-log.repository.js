import { AuditLog } from "../models/audit-log.model.js";

export const auditLogRepository = {
  async create(payload) {
    const entry = await AuditLog.create(payload);
    return entry.toObject();
  },

  async recent(limit = 6) {
    return AuditLog.find().sort({ createdAt: -1 }).limit(limit).lean();
  },

  async recentVisibleTo(actor, limit = 6) {
    const query = actor.role === "admin" ? {} : { actorId: actor.sub };
    return AuditLog.find(query).sort({ createdAt: -1 }).limit(limit).lean();
  },
};
