import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Base Wallet Analytics",
  description: "Base Mainnet wallet activity analytics dashboard",
  other: {
    "talentapp:project_verification":
      "08596042de0f98fb87548c1c21a12ba4e6bdebf6a26ef3dbd592a846ef03322a69966eb511a7d16e34d22b9afe87ff5b3e2651e3bb5043c006789613e32e5954",
    "base:app_id": "6a13c519643955c6d859b9a5"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="min-h-screen bg-[#0A2A66] text-slate-100 antialiased"
        style={{
          margin: 0,
          minHeight: "100vh",
          overflowX: "hidden",
          color: "#eaf2ff"
        }}
      >
        {children}
      </body>
    </html>
  );
}
