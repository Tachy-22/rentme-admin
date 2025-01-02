"use server";

import { EmailData, type SmtpConfig } from "react-send-letter";
import { sendNewsletterServer } from "react-send-letter/server";

export async function sendNewsletter(data: EmailData) {
  const smtpConfig: SmtpConfig = {
    host: process.env.SMTP_HOST!,
    port: Number(process.env.SMTP_PORT),
    secure: true,
    user: process.env.SMTP_USER!,
    password: process.env.SMTP_PASSWORD!,
    from: process.env.SMTP_FROM!,
  };

  const res = await sendNewsletterServer(data, smtpConfig as SmtpConfig);
  return res;
}
