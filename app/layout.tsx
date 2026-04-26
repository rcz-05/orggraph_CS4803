import type { Metadata } from "next";
import { Inter, Caveat } from "next/font/google";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const caveat = Caveat({ variable: "--font-caveat", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OrgGraph — Make Invisible Work Visible",
  description:
    "AI-powered internal talent discovery platform that helps engineering organizations surface hidden expertise, enable fair promotions, and unlock internal mobility.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${caveat.variable}`}>
      <body
        className="min-h-screen antialiased bg-white text-[#0a0a0a]"
        style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}
      >
        {children}
      </body>
    </html>
  );
}
