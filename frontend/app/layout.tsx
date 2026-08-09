import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import OnboardingGuard from "@/components/OnboardingGuard";
import Navigation from "@/components/Navigation";

const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-outfit",
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

export default function RootLayout({ children }: LayoutProps) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-screen flex flex-col md:flex-row bg-white dark:bg-[#0a0f1d] text-gray-900 dark:text-slate-100 transition-colors duration-150">
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
          <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-[#0a0f1d] transition-colors duration-150">
            {children}
          </div>
        </OnboardingGuard>
      </body>
    </html>
  );
}
