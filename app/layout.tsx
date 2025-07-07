import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { LayoutWrapper } from "@/components/layout-wrapper";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "@/components/ErrorBoundary";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Binaural Beats",
  description: "Boost your productivity with audio science",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ErrorBoundary>
          <TooltipProvider>
            <a href="#main-content" className="skip-to-content">
              Skip to content
            </a>
            <LayoutWrapper>
              {children}
            </LayoutWrapper>
            <Toaster />
          </TooltipProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}