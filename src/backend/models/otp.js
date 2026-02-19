module.exports = (sequelize, DataTypes) => {
    const OTP = sequelize.define('OTP', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        otp_code: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        expires_at: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        attempts: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
    }, {
        timestamps: true,
        indexes: [
            {
                unique: false,
                fields: ['email']
            }
        ]
    });

    return OTP;
};
