import type { Metadata } from "next";
import { Space_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

const spaceMono = Space_Mono({ 
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono"
});

export const metadata: Metadata = {
  title: "MSIT Website Bug Hunt - Web Development Society",
  description: "Find it. Report it. Get recognized. Student-powered website QA and contributor recognition platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${spaceMono.variable}`}>
      <body className="bg-cyber-bg text-cyber-text font-mono min-h-screen flex flex-col relative grid-bg">
        {/* CRT Scanline Overlay */}
        <div className="scanlines"></div>
        
        {/* Navigation Header */}
        <Navbar />
        
        {/* Main Content Area */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
          {/* Subtle glowing ambient lighting */}
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-72 h-72 bg-amber-500/5 rounded-full blur-[120px] pointer-events-none"></div>
          {children}
        </main>
        
        {/* Footer */}
        <footer className="border-t border-cyber-darkborder bg-cyber-bg/90 py-6 text-center select-none text-[10px] sm:text-xs tracking-wider text-cyber-subtext">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <span className="font-bold text-cyber-text">&gt;_ ONE SOCIETY. COUNTLESS POSSIBILITIES. BE PART OF IT.</span>
            <span className="mx-2">|</span>
            <span>WEB DEVELOPMENT SOCIETY (WDS), MSIT © {new Date().getFullYear()}</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
