import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create",
  description:
    "Upload a document, add signers, and create a decentralized signing request on 0G Storage.",
};

export default function CreateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
