import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sahayak Health — AI Health Companion",
  description:
    "Sahayak Health is a free, multilingual AI health companion that helps you understand your symptoms in English, Hindi, and Gujarati. Not a substitute for professional medical advice.",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: "/favicon.svg",
  },
  openGraph: {
    title: "Sahayak Health — AI Health Companion",
    description: "Multilingual AI health guidance in English, हिंदी & ગુજરાતી",
    type: "website",
  },
};

interface LayoutProps {
  children: React.ReactNode;
}

import OnboardingGuard from "@/components/OnboardingGuard";
import Navigation from "@/components/Navigation";

export default function RootLayout({ children }: LayoutProps) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="h-full flex flex-col md:flex-row bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-slate-100 transition-colors md:overflow-hidden">
        <Script
          id="sahayak-theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var theme = localStorage.getItem('sahayak_theme');
                if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            `,
          }}
        />
        <OnboardingGuard>
          <Navigation />
          <div className="flex-1 flex flex-col min-w-0 bg-gray-50 dark:bg-slate-950 md:h-screen md:overflow-y-auto pb-16 md:pb-0">
            {children}
          </div>
        </OnboardingGuard>
      </body>
    </html>
  );
}
