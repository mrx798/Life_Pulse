module.exports = (sequelize, DataTypes) => {
  const AuditLog = sequelize.define('AuditLog', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_type: {
      type: DataTypes.STRING, // e.g., 'DONOR', 'HOSPITAL', 'SYSTEM'
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER, // ID of the user performing the action (if applicable)
      allowNull: true,
    },
    entity_type: {
      type: DataTypes.STRING, // e.g., 'DONOR', 'REQUEST'
      allowNull: true,
    },
    entity_id: {
      type: DataTypes.INTEGER, // ID of the entity being acted upon
      allowNull: true,
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    meta_json: {
      type: DataTypes.JSON, // For storing extra details like reason, changes, etc.
      allowNull: true,
    },
  }, {
    timestamps: true,
  });

  return AuditLog;
};