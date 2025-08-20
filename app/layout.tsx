import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";
import DialogProvider from "@/components/DialogProvider";

export const metadata: Metadata = {
  title: "datqbox — Blog",
  description: "Blog con Next.js + Bun + Prisma + TanStack + Postgres"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <Providers>
          <DialogProvider>
            <SiteHeader />
            <div className="container">{children}</div>
            <Footer />
          </DialogProvider>
        </Providers>
      </body>
    </html>
  );
}
