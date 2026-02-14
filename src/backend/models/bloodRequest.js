module.exports = (sequelize, DataTypes) => {
  const BloodRequest = sequelize.define('BloodRequest', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    request_code: {
      type: DataTypes.STRING,
      unique: true,
    },
    hospital_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    blood_group_needed: {
      type: DataTypes.ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
      allowNull: false,
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
    },
    radius_km: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 5.00,
    },
    status: {
      type: DataTypes.ENUM('ACTIVE', 'CLOSED'),
      defaultValue: 'ACTIVE',
    },
  }, {
    timestamps: true,
  });

  return BloodRequest;
};