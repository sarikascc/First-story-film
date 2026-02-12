import type { Metadata } from "next";
import { Fira_Code, Nunito } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const firaCode = Fira_Code({
  subsets: ["latin"],
  variable: "--font-fira-code",
  weight: ["400", "500", "600", "700"],
});

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "First Story Films - Studio Management",
  description: "Professional job management and commission tracking system for First Story Films production studio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${firaCode.variable} ${nunito.variable} font-sans antialiased bg-[#f8fafc] text-[#0f172a] selection:bg-[#6366f1]/20`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
