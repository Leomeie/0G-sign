"use client";

import { useState } from "react";

interface Props {
  url: string;
}

export default function ShareButton({ url }: Props) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const el = document.createElement("textarea");
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button onClick={copy} className="btn-glass px-4 py-2 text-sm">
      {copied ? "Copied" : "Copy Link"}
    </button>
  );
}
