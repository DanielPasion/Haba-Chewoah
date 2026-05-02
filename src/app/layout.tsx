import "~/styles/globals.css";

import { type Metadata, type Viewport } from "next";
import { Bricolage_Grotesque, Inter, JetBrains_Mono } from "next/font/google";

import { ServiceWorkerRegister } from "~/components/sw-register";
import { ThemeBootScript, ThemeToggle } from "~/components/theme-toggle";
import { TRPCReactProvider } from "~/trpc/react";

export const metadata: Metadata = {
  title: {
    default: "Haba-Chewoah",
    template: "%s · Haba-Chewoah",
  },
  description:
    "Bet on yourself. Log your streak. Dare your friends. A habit-based social app.",
  applicationName: "Haba-Chewoah",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Haba-Chewoah",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F6F3EB" },
    { media: "(prefers-color-scheme: dark)", color: "#13111C" },
  ],
};

// Bricolage is only used at weight 800 for display headlines + LogoText.
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  weight: ["800"],
  display: "swap",
});

// Inter spans body text (400/500), buttons (700), and the occasional 600/800.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

// JetBrains Mono is used for small uppercase labels (500/600/700).
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  weight: ["500", "600", "700"],
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${inter.variable} ${jetbrains.variable}`}
      suppressHydrationWarning
    >
      <head>
        <ThemeBootScript />
      </head>
      <body className="bg-hc-bg text-hc-ink">
        <TRPCReactProvider>{children}</TRPCReactProvider>
        <ThemeToggle />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
