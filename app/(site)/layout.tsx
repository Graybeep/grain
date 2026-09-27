import type { Metadata } from "next";
import "../../styles/globals.css";

export const metadata: Metadata = {
  title: "Grain — Every brand decision, argued for",
  description: "An adversarial AI brand studio that challenges, measures, and traces every decision.",
};

export default function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}

