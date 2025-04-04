import "./globals.css";
import { Suspense } from "react";
import type { Metadata } from "next";
import { Providers } from "./providers";
import { Toaster } from "sonner";
import { Poppins } from "next/font/google";
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export const metadata: Metadata = {
  title: "TaxMate",
  description: "TaxMate is a platform for portfolio management and tax reporting",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className={`${poppins.className} h-full antialiased`}>
        <Providers>
          {children}
          <Suspense>
            <Toaster richColors position="top-right" />
          </Suspense>
        </Providers>
      </body>
    </html>
  );
}
