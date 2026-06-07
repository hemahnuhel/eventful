import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { logger } from '../config/logger';

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
});

interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendMail = async (options: MailOptions) => {
  try {
    await transporter.sendMail({ from: env.EMAIL_FROM, ...options });
  } catch (err) {
    logger.error('Failed to send email', { to: options.to, err });
  }
};
