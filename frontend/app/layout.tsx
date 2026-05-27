import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Thay đổi cách import bằng đường dẫn tương đối (relative path)
import Header from "./components/Header";
import Footer from "./components/Footer";
import { SearchProvider } from "./components/searchContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ElectroStore - Thế giới đồ điện tử chính hãng",
  description: "Mua sắm laptop, điện thoại, phụ kiện công nghệ giá rẻ nhất",
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
    >
      <body className="min-h-full flex flex-col bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-50">
        <SearchProvider>
          {/* HEADER */}
          <Header />

          {/* BODY (MAIN) - Full width page layout */}
          <main className="flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </main>

          {/* FOOTER */}
          <Footer />
        </SearchProvider>
      </body>
    </html>
  );
}
