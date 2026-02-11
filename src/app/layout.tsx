import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/BottomNav";
import { AuthProvider } from "@/components/AuthProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "고객터치 - 영업팀 일일업무보고",
  description: "영업사원을 위한 빠르고 간편한 업무보고 시스템",
  appleWebApp: {
    title: "고객터치",
    statusBarStyle: "default",
    capable: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full">
      <body className={`${inter.className} antialiased bg-background text-foreground h-full overflow-x-hidden pb-20`}>
        <AuthProvider>
          <main className="max-w-md mx-auto min-h-screen relative px-4 pt-6">
            {children}
          </main>
          <BottomNav />
        </AuthProvider>
      </body>
    </html>
  );
}
