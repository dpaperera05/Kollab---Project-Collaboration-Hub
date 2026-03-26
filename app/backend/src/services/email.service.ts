import nodemailer from "nodemailer";

const smtpHost = process.env.SMTP_HOST;
const smtpPort = Number(process.env.SMTP_PORT || 587);
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const fromEmail = process.env.SMTP_FROM || smtpUser;

const transporter = smtpHost && smtpUser && smtpPass
  ? nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: { user: smtpUser, pass: smtpPass },
    })
  : null;

export const sendEmail = async (to: string, subject: string, text: string, html?: string) => {
  if (!smtpHost || !smtpUser || !smtpPass || !fromEmail || !transporter) {
    throw new Error("SMTP configuration is missing or invalid. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM.");
  }

  await transporter.sendMail({
    from: fromEmail,
    to,
    subject,
    text,
    html,
  });
};
