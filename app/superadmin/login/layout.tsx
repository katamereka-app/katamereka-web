import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Super Admin — Katamereka",
  robots: {
    index: false,
    follow: false,
  },
};

export default function SuperAdminLoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
