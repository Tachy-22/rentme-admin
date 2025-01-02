"use server";

import nodemailer from "nodemailer";
import { addDocument } from "./addDocument";

interface NewsletterData {
  subject: string;
  content: string;
  recipients: string[];
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.ADMIN_EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function sendNewsletter({ subject, content, recipients }: NewsletterData) {
  try {
    await transporter.sendMail({
      from: process.env.ADMIN_EMAIL,
      bcc: recipients,
      subject: subject,
      html: `
        <div style="background-color: #f6f9fc; padding: 20px; font-family: Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <img src="https://your-logo-url.com/logo.png" alt="RentMe Logo" style="max-width: 150px;">
            </div>
            <h2 style="color: #2563eb; text-align: center; margin-bottom: 30px; font-size: 28px;">${subject}</h2>
            <div style="background: linear-gradient(135deg, #2563eb11 0%, #2563eb22 100%); border-radius: 10px; padding: 20px; margin-bottom: 30px;">
              <div style="color: #334155; font-size: 16px; line-height: 1.6;">
                ${content}
              </div>
            </div>
            <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e2e8f0;">
              <p style="color: #2563eb; font-weight: bold; font-size: 18px;">The RentMe Team</p>
              <div style="margin-top: 20px;">
                <a href="https://twitter.com/rentme" style="color: #2563eb; margin: 0 10px; text-decoration: none;">Twitter</a>
                <a href="https://facebook.com/rentme" style="color: #2563eb; margin: 0 10px; text-decoration: none;">Facebook</a>
                <a href="https://instagram.com/rentme" style="color: #2563eb; margin: 0 10px; text-decoration: none;">Instagram</a>
              </div>
             
            </div>
          </div>
        </div>
      `,
    });
    
    // Store newsletter in Firestore
    await addDocument("newsletters", {
      subject,
      content,
      recipientCount: recipients.length,
      sentAt: new Date().toISOString(),
    }, "/admin/newsLetter");
    
    return { success: true };
  } catch (error) {
    console.error("Failed to send newsletter:", error);
    throw new Error("Failed to send newsletter");
  }
}

export async function sendWaitlistEmail(data: { name: string; email: string; company: string }) {
  const mailOptions = {
    from: process.env.ADMIN_EMAIL,
    to: process.env.ADMIN_EMAIL,
    subject: 'New Waitlist Registration',
    html: `
      <h2>New Waitlist Registration</h2>
      <p><strong>Name:</strong> ${data.name}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Company:</strong> ${data.company}</p>
    `,
  };

  return transporter.sendMail(mailOptions);
}

export async function sendWaitlistNotification(data: {
  name: string;
  email: string;
  userType: string;

}) {
  try {
    // Send email to admin
    await transporter.sendMail({
      from: process.env.ADMIN_EMAIL,
      to: process.env.ADMIN_EMAIL,
      subject: 'New Waitlist Registration',
      html: `
        <div style="background-color: #f6f9fc; padding: 20px; font-family: Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; padding: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #2563eb; text-align: center; margin-bottom: 30px; font-size: 24px;">🎉 New Waitlist Registration</h2>
            <div style="background-color: #f8fafc; border-left: 4px solid #2563eb; padding: 15px; margin-bottom: 20px;">
              <p style="margin: 10px 0;"><span style="color: #64748b; font-weight: bold;">Name:</span> <span style="color: #334155;">${data.name}</span></p>
              <p style="margin: 10px 0;"><span style="color: #64748b; font-weight: bold;">Email:</span> <span style="color: #334155;">${data.email}</span></p>
             
              <p style="margin: 10px 0;"><span style="color: #64748b; font-weight: bold;">User Type:</span> <span style="background-color: #2563eb; color: white; padding: 3px 8px; border-radius: 12px; font-size: 14px;">${data.userType}</span></p>
             
            </div>
            <p style="color: #64748b; text-align: center; font-size: 14px;">This registration was received on ${new Date().toLocaleString()}</p>
          </div>
        </div>
      `,
    });

    // Send confirmation email to user
    await transporter.sendMail({
      from: process.env.ADMIN_EMAIL,
      to: data.email,
      subject: 'Welcome to RentMe Waitlist',
      html: `
        <div style="background-color: #f6f9fc; padding: 0px; font-family: Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; padding: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <img src="https://your-logo-url.com/logo.png" alt="RentMe Logo" style="max-width: 150px;">
            </div>
            <h2 style="color: #2563eb; text-align: center; margin-bottom: 30px; font-size: 28px;">Welcome to RentMe! 🎉</h2>
            <div style="background: linear-gradient(135deg, #2563eb11 0%, #2563eb22 100%); border-radius: 10px; padding: 20px; margin-bottom: 30px;">
              <p style="color: #334155; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">Dear ${data.name},</p>
              <p style="color: #334155; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">Thank you for joining our waitlist! We're thrilled to have you as one of our early supporters.</p>
              <p style="color: #334155; font-size: 16px; line-height: 1.6;">You've joined as a: <span style="background-color: #2563eb; color: white; padding: 3px 8px; border-radius: 12px; font-size: 14px;">${data.userType}</span></p>
            </div>
            <div style="background-color: #f8fafc; border-radius: 10px; padding: 20px; margin-bottom: 30px;">
              <h3 style="color: #2563eb; margin-bottom: 15px; font-size: 18px;">What's Next?</h3>
              <ul style="color: #334155; list-style-type: none; padding: 0;">
                <li style="margin-bottom: 10px; padding-left: 15px; position: relative;">✨ We'll keep you updated about our launch</li>
                <li style="margin-bottom: 10px; padding-left: 15px; position: relative;">🎯 You'll get early access to our platform</li>
                <li style="margin-bottom: 10px; padding-left: 15px; position: relative;">💫 Exclusive features and benefits await</li>
              </ul>
            </div>
            <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; margin-bottom: 10px;">Best regards,</p>
              <p style="color: #2563eb; font-weight: bold; font-size: 18px;">The RentMe Team</p>
             
            </div>
          </div>
        </div>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to send waitlist notifications:", error);
    throw new Error("Failed to send waitlist notifications");
  }
}

export async function sendBookingEmail(data: {
  name: string;
  email: string;
  phone: string;
  preferredDate: string;
}) {
  const mailOptions = {
    from: process.env.ADMIN_EMAIL,
    to: process.env.ADMIN_EMAIL,
    subject: 'New Consultation Booking Request',
    html: `
      <h2>New Consultation Booking Request</h2>
      <p><strong>Name:</strong> ${data.name}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Phone:</strong> ${data.phone}</p>
      <p><strong>Preferred Date:</strong> ${new Date(data.preferredDate).toLocaleString()}</p>
    `,
  };

  return transporter.sendMail(mailOptions);
}