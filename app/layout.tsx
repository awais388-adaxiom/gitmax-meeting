import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Head from "next/head";
import { AuthProvider } from './auth/AuthProvider'

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Meeting Scheduler",
  description: "Meeting Scheduler",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex items-center min-h-screen justify-center bg-cover bg-center repeat-0 bg-no-repeat	`}
        style={{
          backgroundImage:
            "url('https://adaxiomdemo.com/img.webp')",
        }}
      >
        {children}
      </body>
    </html>
    </AuthProvider>
  );
}
