import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "@/providers/WalletProvider";
import { Toaster } from "@/components/ui/sonner";
import { QueryClientProvider } from "@/providers/QueryClientProvider";
import { Navigation } from "@/components/navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Shelby Breakpoint",
  description: "Shelby Breakpoint demo dapp",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background`}
      >
        <QueryClientProvider>
          <WalletProvider>
            <div className="flex h-screen w-screen overflow-hidden">
              <Navigation />
              <main className="flex-1 flex flex-col overflow-hidden">
                {children}
              </main>
            </div>
          </WalletProvider>
        </QueryClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
