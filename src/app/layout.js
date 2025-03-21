import { Geist, Geist_Mono } from "next/font/google";
import { Header, Footer } from "@/app/components";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Book Reader",
  description: "A simple PDF book reader application",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <div className="grid grid-rows-[auto_1fr_auto] min-h-screen p-4 gap-4 sm:p-6 sm:gap-6 md:p-8 md:gap-8">
          <Header />
          <main className="flex flex-col items-center justify-center w-full">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
