const db = require('../models');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

const generateOTP = async (email) => {
    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash OTP for storage
    const hashedOTP = await bcrypt.hash(otp, 10);

    // Set expiration (10 minutes)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Invalidate previous OTPs
    await db.OTP.destroy({ where: { email } });

    // Store new OTP
    await db.OTP.create({
        email,
        otp_code: hashedOTP,
        expires_at: expiresAt,
    });

    const emailService = require('./email.service');

    const subject = 'LifePulse: Verify Your Email';
    const text = `Your One-Time Password (OTP) for LifePulse registration is: ${otp}\n\nThis code is valid for 10 minutes.\n\nThank you for saving lives!`;
    const html = `<div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #e63946;">LifePulse Verification</h2>
            <p>Your One-Time Password (OTP) is:</p>
            <h1 style="letter-spacing: 5px; background: #eee; padding: 10px; display: inline-block;">${otp}</h1>
            <p>This code is valid for 10 minutes.</p>
            <p>If you did not request this, please ignore this email.</p>
        </div>`;

    await emailService.sendEmail(email, subject, text, html);

    return otp; // Return plain OTP to be sent via email
};

const verifyOTP = async (email, otp) => {
    const record = await db.OTP.findOne({ where: { email } });

    if (!record) {
        throw new Error('Invalid or expired OTP');
    }

    if (record.attempts >= 3) {
        throw new Error('Too many failed attempts. Please request a new OTP.');
    }

    if (new Date() > record.expires_at) {
        await record.destroy();
        throw new Error('OTP expired');
    }

    const isValid = await bcrypt.compare(otp, record.otp_code);
    if (!isValid) {
        await record.increment('attempts');
        throw new Error('Invalid OTP');
    }

    // OTP valid, cleanup
    await record.destroy();
    return true;
};

module.exports = {
    generateOTP,
    verifyOTP,
};
