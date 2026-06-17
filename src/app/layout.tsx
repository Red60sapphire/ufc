import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ToastProvider } from "@/lib/toast";
import AnnouncementPopup from "@/components/AnnouncementPopup";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "UFC.SOLUTIONS - Free UFC Streams & Fight Coverage",
  description: "Watch free UFC live streams, check upcoming events, fighter profiles, rankings, and news.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");
  let user: { id: number; username: string; is_admin: number } | null = null;
  if (sessionCookie?.value) {
    try {
      user = JSON.parse(Buffer.from(sessionCookie.value, "base64").toString("utf-8"));
    } catch {}
  }

  return (
    <html lang="en" className="h-full">
      <head>
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-82BZ6YWQ2R" />
        <script dangerouslySetInnerHTML={{
          __html: `window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', 'G-82BZ6YWQ2R');`,
        }} />
      </head>
      <body className="min-h-full flex flex-col bg-[#0a0a0a] text-white antialiased">
        <ToastProvider>
          <Navbar user={user} />
          <main className="flex-1">{children}</main>
          <Footer />
          <AnnouncementPopup />
        </ToastProvider>
      </body>
    </html>
  );
}
