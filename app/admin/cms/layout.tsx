import { CmsAccessGate } from "@/components/cms/cms-access-gate"

export default function CmsLayout({ children }: { children: React.ReactNode }) {
  return <CmsAccessGate>{children}</CmsAccessGate>
}
