import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Base Wallet Analytics",
  description: "Base Mainnet wallet activity analytics dashboard"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="min-h-screen bg-[#020817] text-slate-100 antialiased"
        style={{
          margin: 0,
          minHeight: "100vh",
          overflowX: "hidden",
          background: "#020817",
          color: "#eaf2ff"
        }}
      >
        {children}
      </body>
    </html>
  );
}
