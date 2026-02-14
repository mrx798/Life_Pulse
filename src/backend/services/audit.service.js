const db = require('../models');

const log = async (userType, userId, action) => {
  await db.AuditLog.create({
    user_type: userType,
    user_id: userId,
    action,
  });
};

module.exports = {
  log,
};