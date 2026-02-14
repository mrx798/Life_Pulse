module.exports = (sequelize, DataTypes) => {
  const Donor = sequelize.define('Donor', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    donor_code: {
      type: DataTypes.STRING,
      unique: true,
    },
    full_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password_hash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    blood_group: {
      type: DataTypes.ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
      allowNull: false,
    },
    area: {
      type: DataTypes.STRING,
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED'),
      defaultValue: 'PENDING',
    },
    is_available: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    consent_given: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    consent_at: {
      type: DataTypes.DATE,
    },
  }, {
    timestamps: true,
  });

  return Donor;
};