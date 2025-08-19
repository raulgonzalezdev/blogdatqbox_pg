import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "datqbox — Blog",
  description: "Blog con Next.js + Bun + Prisma + TanStack + Postgres"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <Providers>
          <SiteHeader />
          <div className="container">{children}</div>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
