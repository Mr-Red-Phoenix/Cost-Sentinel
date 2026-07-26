import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./hooks/useTheme";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cost Sentinel Dashboard",
  description: "Autonomous Cost Leak Detection & Remediation Engine",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-white dark:bg-[#090d16] text-slate-900 dark:text-white relative transition-colors duration-500">
        <ThemeProvider>
          {/* Light mode grid */}
          <div className="fixed inset-0 z-[-1] bg-grid-pattern-light dark:hidden pointer-events-none opacity-100" />
          
          {/* Dark mode grid */}
          <div className="fixed inset-0 z-[-1] bg-grid-pattern dark:block hidden pointer-events-none opacity-60" />
          
          <div className="fixed inset-0 z-[-1] pointer-events-none bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(6,182,212,0.05),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(6,182,212,0.15),rgba(255,255,255,0))]" />
          
          <div className="relative z-0 flex flex-col flex-1">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
