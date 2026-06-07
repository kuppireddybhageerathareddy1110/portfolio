import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Bhageeratha Reddy | AI Engineer & Data Scientist",
  description: "Portfolio of Kuppireddy Bhageeratha Reddy - AI Engineer, Data Scientist, and Full-Stack Developer building intelligent systems with Python, PyTorch, TensorFlow, Next.js, and more. Explore projects in AutoML, NLP, Computer Vision, and 3D interactive experiences.",
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
    <html lang="en" className="dark h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#0a0c10] text-[#e6edf3]">
        {children}
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}
