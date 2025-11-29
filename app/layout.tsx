import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "./components/common/Header";
import Footer from "./components/common/Footer";
import { DarkModeProvider } from "./components/common/DarkModeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Blue Fire Wealth - Expert Wealth Management Services",
  description: "Professional wealth management services including investment planning, retirement planning, risk management, estate planning, and tax optimization. Secure your financial future with Blue Fire Wealth.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors`}
      >
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const saved = localStorage.getItem('darkMode');
                  const isDark = saved === 'true' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
                  const html = document.documentElement;
                  if (isDark) {
                    html.classList.add('dark');
                  } else {
                    html.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        <DarkModeProvider>
          <Header />
          <main>{children}</main>
          <Footer />
        </DarkModeProvider>
      </body>
    </html>
  );
}
