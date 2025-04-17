import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Analytics } from '@vercel/analytics/next';
import { LoadingBarProvider } from "@/components/TopLoadingBar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Prompy - Your AI Prompt Manager",
  description: "Securely store, organize, and manage your AI prompts with Prompy Chrome extension",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LoadingBarProvider>
        <ThemeProvider>
          <Header />
          {children}
          <Analytics mode="production"/>
          <Footer />
        </ThemeProvider>
        </LoadingBarProvider>
      </body>
    </html>
  );
}
