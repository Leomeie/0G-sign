import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Documents",
  description:
    "View and manage your decentralized document signing requests.",
};

export default function DocumentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
