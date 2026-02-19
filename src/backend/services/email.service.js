const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendEmail = async (to, subject, text, html) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        text,
        html
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`[EMAIL SENT] to ${to}`);
        return true;
    } catch (error) {
        console.error('[EMAIL ERROR] Failed to send email:', error);
        return false; // Return false to indicate failure without crashing
    }
};

module.exports = {
    sendEmail
};
