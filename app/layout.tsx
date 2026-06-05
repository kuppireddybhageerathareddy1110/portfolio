import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Bhageeratha Reddy | AI Engineer & Data Scientist",
  description: "Portfolio of Kuppireddy Bhageeratha Reddy — AI Engineer, Data Scientist, and Full-Stack Developer building intelligent systems with Python, PyTorch, TensorFlow, Next.js, and more. Explore projects in AutoML, NLP, Computer Vision, and 3D interactive experiences.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${jetbrains.variable} dark h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#0a0c10] text-[#e6edf3]">
        {children}
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}
