import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: {
    canonical: "/businesses",
  },
};

export default function BusinessesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
