import type { Metadata } from "next";
import { Inter, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { LayoutWrapper } from "@/components/layout-wrapper";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "@/components/ErrorBoundary";

// Primary font for body text - peaceful and readable
const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["300", "400", "500"]
});

// Secondary font for headings - calming and elegant
const sourceSans = Source_Sans_3({ 
  subsets: ["latin"],
  variable: "--font-source-sans",
  display: "swap",
  weight: ["300", "400", "500", "600"]
});

export const metadata: Metadata = {
  title: "Mindful Focus | Binaural Beats",
  description: "Find your center and cultivate peaceful awareness with calming binaural beat soundscapes designed for mindful productivity and deep focus",
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${sourceSans.variable} font-sans antialiased`}>
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