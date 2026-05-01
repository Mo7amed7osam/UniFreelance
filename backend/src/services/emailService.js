const nodemailer = require('nodemailer');

// Email service for sending notifications
class EmailService {
    constructor() {
        // Configure the email transporter using SMTP
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }

    // Function to send an email notification
    async sendEmail(to, subject, text) {
        if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
            console.log(`Email skipped (SMTP not configured). Intended for ${to}: ${subject}`);
            return;
        }
        const mailOptions = {
            from: process.env.SMTP_FROM, // sender address
            to, // list of receivers
            subject, // Subject line
            text, // plain text body
        };

        try {
            await this.transporter.sendMail(mailOptions);
            console.log(`Email sent to ${to}`);
        } catch (error) {
            console.error(`Error sending email to ${to}:`, error);
        }
    }
}

module.exports = new EmailService();
