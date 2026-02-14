const db = require('../models');

const notifyDonors = async (requestId, donorIds) => {
  const notifications = [];
  for (const donorId of donorIds) {
    const log = await db.NotificationLog.create({
      request_id: requestId,
      donor_id: donorId,
    });
    notifications.push(log);
  }
  return notifications;
};

module.exports = {
  notifyDonors,
};