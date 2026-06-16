import type { Metadata } from "next";
import { Jost } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/app-shell";

const jost = Jost({
  subsets: ["latin"],
  variable: "--font-jost",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "KYR Metrics | Weidert Group",
  description:
    "Know Your Role — performance metrics dashboard for Weidert Group",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://use.typekit.net/qzt6lzo.css" />
      </head>
      <body
        className={`${jost.variable} antialiased`}
        suppressHydrationWarning
      >
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
