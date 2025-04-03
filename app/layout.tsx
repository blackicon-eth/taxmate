import "./globals.css";
import { Suspense } from "react";
import type { Metadata } from "next";
import { Providers } from "./providers";
import { Toaster } from "sonner";
import { Montserrat } from "next/font/google";

const montserrat = Montserrat({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "", // TODO Add title
  description: "", // TODO Add description
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${montserrat.className} size-full min-h-screen antialiased`}>
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
