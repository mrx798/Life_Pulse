const db = require('./src/backend/models');
const bcrypt = require('bcrypt');

const getOTP = async () => {
    try {
        const otpRecord = await db.OTP.findOne({
            where: { email: 'www.selflessperson13@gmail.com' },
            order: [['createdAt', 'DESC']]
        });

        const newOtp = '123456';
        const hashedOTP = await bcrypt.hash(newOtp, 10);
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins from now

        if (otpRecord) {
            console.log(`Found OTP record for ${otpRecord.email}. Updating...`);
            await otpRecord.update({
                otp_code: hashedOTP,
                expires_at: expiresAt,
                attempts: 0
            });
            console.log(`UPDATED OTP to: ${newOtp}`);
        } else {
            console.log('No OTP record found. Creating new one...');
            await db.OTP.create({
                email: 'www.selflessperson13@gmail.com',
                otp_code: hashedOTP,
                expires_at: expiresAt,
                attempts: 0
            });
            console.log(`CREATED OTP: ${newOtp}`);
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await db.sequelize.close();
    }
};

getOTP();
