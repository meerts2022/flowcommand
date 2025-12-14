import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { auth, signOut } from "@/lib/auth";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FlowCommand - N8N Fleet Management",
  description: "Mission Control for your N8N Fleet",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {session?.user && (
          <header className="border-b border-slate-800 bg-slate-950">
            <div className="flex justify-between items-center px-8 py-4">
              <div className="flex items-center gap-3">
                {session.user.image && (
                  <img
                    src={session.user.image}
                    alt={session.user.name || 'User'}
                    className="w-8 h-8 rounded-full border border-slate-700"
                  />
                )}
                <div>
                  <div className="text-sm font-medium text-slate-300">
                    {session.user.name}
                  </div>
                  <div className="text-xs text-slate-500">
                    {session.user.email}
                  </div>
                </div>
              </div>
              <form action={async () => {
                "use server"
                await signOut({ redirectTo: '/auth/signin' })
              }}>
                <button
                  type="submit"
                  className="text-sm text-slate-500 hover:text-red-400 transition-colors px-4 py-2 rounded hover:bg-slate-800/50"
                >
                  Sign Out
                </button>
              </form>
            </div>
          </header>
        )}
        {children}
      </body>
    </html>
  );
}
