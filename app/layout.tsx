import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Splitbill",
  description: "Calculate your split bill",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-whitecard">{children}</body>
    </html>
  );
}
