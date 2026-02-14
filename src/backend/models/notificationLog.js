module.exports = (sequelize, DataTypes) => {
  const NotificationLog = sequelize.define('NotificationLog', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    request_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    donor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    notified_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    response: {
      type: DataTypes.ENUM('ACCEPT', 'DECLINE'),
    },
    response_at: {
      type: DataTypes.DATE,
    },
  }, {
    timestamps: false,
  });

  return NotificationLog;
};