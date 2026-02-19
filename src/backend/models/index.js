const { Sequelize } = require('sequelize');
const config = require('../config');

const sequelize = new Sequelize(config.db.name, config.db.user, config.db.password, {
  host: config.db.host,
  port: config.db.port,
  dialect: 'mysql',
  logging: false,
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
db.Donor = require('./donor')(sequelize, Sequelize);
db.Hospital = require('./hospital')(sequelize, Sequelize);
db.BloodRequest = require('./bloodRequest')(sequelize, Sequelize);
db.NotificationLog = require('./notificationLog')(sequelize, Sequelize);
db.AuditLog = require('./auditLog')(sequelize, Sequelize);
db.OTP = require('./otp')(sequelize, Sequelize);

// Associations
db.Donor.hasMany(db.NotificationLog, { foreignKey: 'donor_id' });
db.NotificationLog.belongsTo(db.Donor, { foreignKey: 'donor_id' });

db.BloodRequest.hasMany(db.NotificationLog, { foreignKey: 'request_id' });
db.NotificationLog.belongsTo(db.BloodRequest, { foreignKey: 'request_id' });

db.Hospital.hasMany(db.BloodRequest, { foreignKey: 'hospital_id' });
db.BloodRequest.belongsTo(db.Hospital, { foreignKey: 'hospital_id' });

module.exports = db;