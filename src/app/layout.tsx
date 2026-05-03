import "~/styles/globals.css";

import { type Metadata, type Viewport } from "next";
import { Bricolage_Grotesque, Inter, JetBrains_Mono } from "next/font/google";

import { ServiceWorkerRegister } from "~/components/sw-register";
import { ThemeBootScript, ThemeToggle } from "~/components/theme-toggle";

export const metadata: Metadata = {
  title: {
    default: "Haba-Chewoah",
    template: "%s · Haba-Chewoah",
  },
  description:
    "Track your habits. Share your streaks. A habit-based social app.",
  applicationName: "Haba-Chewoah",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Haba-Chewoah",
    statusBarStyle: "black-translucent",
  },
  // Next.js 15 only emits the modern unprefixed `mobile-web-app-capable` from
  // appleWebApp.capable, but iOS < 17 still needs the apple-prefixed tag to
  // hide Safari chrome when launched from the home screen. Emit both.
  other: {
    "apple-mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  // viewport-fit=cover lets the page extend behind the iPhone notch and home
  // indicator; pair with env(safe-area-inset-*) padding on the landing chrome
  // so the header and footer aren't covered by system UI.
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F6F3EB" },
    { media: "(prefers-color-scheme: dark)", color: "#13111C" },
  ],
};

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  weight: ["800"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

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
        {children}
        <ThemeToggle />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
