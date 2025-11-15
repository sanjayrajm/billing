// backend/email.js
const nodemailer = require('nodemailer');

// Configure transporter using environment variables
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.example.com',
  port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || ''
  }
});

async function sendInvoiceEmail(to, subject, htmlContent, attachments=[]) {
  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM || '"Muthuganesan Textiles" <no-reply@example.com>',
    to,
    subject,
    html: htmlContent,
    attachments
  });
  return info;
}

module.exports = { sendInvoiceEmail };
