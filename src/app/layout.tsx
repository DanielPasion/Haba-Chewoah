import "~/styles/globals.css";

import { type Metadata } from "next";
import { Bricolage_Grotesque, Inter, JetBrains_Mono } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";

export const metadata: Metadata = {
  title: "Haba-Chewoah",
  description:
    "A habit-based social app. Bet on yourself, log your streak, dare your friends.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${inter.variable} ${jetbrains.variable}`}
    >
      <body className="bg-hc-bg text-hc-ink">
        <TRPCReactProvider>{children}</TRPCReactProvider>
      </body>
    </html>
  );
}
