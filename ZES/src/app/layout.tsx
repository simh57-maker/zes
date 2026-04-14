import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ZES Editor — 3D Design Studio",
  description: "High-performance browser-based 3D design editor with real-time post-processing",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full overflow-hidden">{children}</body>
    </html>
  );
}
