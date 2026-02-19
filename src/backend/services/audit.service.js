const db = require('../models');

const log = async (userType, userId, action, meta = null, entityType = null, entityId = null) => {
  await db.AuditLog.create({
    user_type: userType,
    user_id: userId,
    action,
    meta_json: meta,
    entity_type: entityType,
    entity_id: entityId,
  });
};

module.exports = {
  log,
};