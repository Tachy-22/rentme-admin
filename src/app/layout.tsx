import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/layout/Navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RentMe - Admin ",
  description:
    "Transform your rental experience with RentMe. Connect with homeowners, find your perfect home, and manage your rental journey seamlessly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="max-h-screen overflow-y-hidden h-screen">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased  scrollbar-thumb-primary-300 scrollbar-track-gray-100 max-h-screen h-screen overflow-y-hidden`}
      >
        <Navigation />
        {children}
      </body>
    </html>
  );
}
