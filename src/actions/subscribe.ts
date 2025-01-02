
"use server"

import { addDocument } from "./addDocument";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function subscribeToNewsletter(email: string) {
  try {
    // Add subscriber to database
    await addDocument("subscribers", {
      email,
      status: "active",
      subscribedAt: new Date().toISOString()
    }, "/");

    // Send confirmation email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Welcome to Our Newsletter!",
      html: `
        <h2>Thank you for subscribing!</h2>
        <p>You've been successfully added to our newsletter list.</p>
      `
    });

    return { success: true };
  } catch (error) {
    console.error("Subscription error:", error);
    throw new Error("Failed to subscribe");
  }
}