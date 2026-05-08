"use client";

import { memo, useState } from "react";
import { useI18n } from "@/lib/i18n";

interface Props {
  url: string;
}

export default memo(function ShareButton({ url }: Props) {
  const [copied, setCopied] = useState(false);
  const { t } = useI18n();

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
    <button onClick={copy} aria-live="polite" className="btn-glass px-4 py-2 text-sm">
      {copied ? t("copied") : t("copyLink")}
    </button>
  );
});
