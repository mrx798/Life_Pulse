const fs = require('fs');
require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmail() {
    console.log('Testing email configuration...');
    console.log(`User: ${process.env.EMAIL_USER}`);
    console.log(`Pass Length: ${process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 0}`);

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER, // Send to self
            subject: 'Test Email from LifePulse',
            text: 'If you receive this, your email configuration is working!'
        });
        console.log('Email sent successfully:', info.response);
        fs.writeFileSync('email_status.txt', 'SUCCESS: ' + info.response);
    } catch (error) {
        console.error('Email failed:', error);
        fs.writeFileSync('email_status.txt', 'FAIL: ' + error.message);
    }
}

testEmail();
