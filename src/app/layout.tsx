import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "Emjay Brewery | ERP Management System",
  description: "Enterprise resource planning for craft brewery management, inventory tracking, and sales logistics.",
  keywords: ["brewery erp", "inventory management", "production tracking", "sales logistics"],
  authors: [{ name: "Emjay Brewery" }],
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body className="bg-slate-950 text-slate-200">
        <Toaster position="top-right" />
        {children}
      </body>
    </html>
  );
}
