"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";

export default function HomePage() {
  const { t, lang } = useI18n();

  return (
    <div className="relative flex flex-col items-center justify-center py-16 text-center overflow-hidden">
      {/* ─── Hero Section ─── */}
      <div className="relative flex flex-col items-center justify-center py-12">
        {/* Animated background orbs */}
        <div className="bg-orb w-[500px] h-[500px] -top-60 -left-60 bg-blue-600" />
        <div className="bg-orb w-80 h-80 -bottom-40 -right-40 bg-violet-600" style={{ animationDelay: "-4s" }} />
        <div className="bg-orb w-64 h-64 top-1/3 right-1/4 bg-cyan-600" style={{ animationDelay: "-8s" }} />

        {/* Badge */}
        <div className="animate-fade-in mb-6 tech-badge">
          <span className="pulse-dot" />
          {t("poweredBy")}
        </div>

        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl animate-fade-in bg-gradient-to-b from-white via-white/90 to-white/60 bg-clip-text text-transparent animate-gradient leading-tight">
          {t("heroTitle1")}
          <br />
          {t("heroTitle2")}
        </h1>

        <p className="mt-5 max-w-lg text-base text-zinc-400 animate-fade-in stagger-2 leading-relaxed">
          {t("heroDesc")}
        </p>

        <div className="mt-8 flex gap-3 animate-fade-in stagger-3">
          <Link href="/create" className="btn-gradient px-7 py-2.5 text-sm">
            {t("getStarted")}
          </Link>
          <Link href="/verify" className="btn-glass px-7 py-2.5 text-sm">
            {t("verifySignature")}
          </Link>
        </div>
      </div>

      {/* ─── Feature Cards ─── */}
      <div className="mt-16 grid gap-5 sm:grid-cols-3 text-left max-w-3xl w-full px-4">
        <FeatureCard
          icon={
            <svg aria-hidden="true" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          }
          color="blue"
          title={t("feature1Title")}
          desc={t("feature1Desc")}
          stagger="1"
        />
        <FeatureCard
          icon={
            <svg aria-hidden="true" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.864 4.243A7.5 7.5 0 0119.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 004.5 10.5a7.464 7.464 0 01-1.15 3.993m1.986 2.048A7.464 7.464 0 004.5 10.5a7.464 7.464 0 01.83 3.87M12 12a3 3 0 100-6 3 3 0 000 6zm0 0v7.5m0-7.5a3 3 0 013 3v4.5m-3-4.5a3 3 0 00-3 3v4.5" />
            </svg>
          }
          color="violet"
          title={t("feature2Title")}
          desc={t("feature2Desc")}
          stagger="2"
        />
        <FeatureCard
          icon={
            <svg aria-hidden="true" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
            </svg>
          }
          color="cyan"
          title={t("feature3Title")}
          desc={t("feature3Desc")}
          stagger="3"
        />
      </div>

      {/* ─── How It Works ─── */}
      <div className="mt-24 w-full max-w-3xl px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-zinc-100 animate-fade-in">
            {lang === "zh" ? "操作指南" : "How It Works"}
          </h2>
          <p className="mt-2 text-sm text-zinc-500 animate-fade-in stagger-1">
            {lang === "zh" ? "三步完成去中心化文档签署" : "Decentralized document signing in 3 steps"}
          </p>
        </div>

        <div className="space-y-4">
          {/* Step 1 */}
          <div className="glass-card p-6 animate-fade-in stagger-2">
            <div className="flex gap-4">
              <div className="step-number">1</div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-zinc-100">
                  {lang === "zh" ? "创建签署请求" : "Create Signing Request"}
                </h3>
                <p className="mt-1.5 text-sm text-zinc-400 leading-relaxed">
                  {lang === "zh" ? (
                    <>
                      填写文档标题，上传文件（PDF/PNG/JPG/DOCX），在 <span className="text-blue-400">Signers</span> 栏输入对方的钱包地址，点击 <span className="text-blue-400">Add</span>，然后点击 <span className="text-blue-400">Create</span>。
                    </>
                  ) : (
                    <>
                      Fill in the document title, upload a file (PDF/PNG/JPG/DOCX), enter the signer&apos;s wallet address in the <span className="text-blue-400">Signers</span> field, click <span className="text-blue-400">Add</span>, then click <span className="text-blue-400">Create</span>.
                    </>
                  )}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="tech-badge text-[11px]">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>
                    {lang === "zh" ? "加密上传" : "Encrypted Upload"}
                  </span>
                  <span className="tech-badge text-[11px]">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" /></svg>
                    AES-256
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="step-connector" />

          {/* Step 2 */}
          <div className="glass-card p-6 animate-fade-in stagger-4">
            <div className="flex gap-4">
              <div className="step-number">2</div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-zinc-100">
                  {lang === "zh" ? "分享签署链接" : "Share the Signing Link"}
                </h3>
                <p className="mt-1.5 text-sm text-zinc-400 leading-relaxed">
                  {lang === "zh" ? (
                    <>
                      创建成功后跳转到文档详情页，点击 <span className="text-blue-400">Copy Link</span> 把链接发给对方。链接格式：<span className="font-mono text-xs text-zinc-500">0gsign.netlify.app/documents/xxx</span>
                    </>
                  ) : (
                    <>
                      After creation you&apos;ll be redirected to the document detail page. Click <span className="text-blue-400">Copy Link</span> and send it to the signer.
                    </>
                  )}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="tech-badge text-[11px]">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" /></svg>
                    {lang === "zh" ? "可分享链接" : "Shareable Link"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="step-connector" />

          {/* Step 3 */}
          <div className="glass-card p-6 animate-fade-in stagger-6">
            <div className="flex gap-4">
              <div className="step-number">3</div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-zinc-100">
                  {lang === "zh" ? "对方签署" : "Counterparty Signs"}
                </h3>
                <p className="mt-1.5 text-sm text-zinc-400 leading-relaxed">
                  {lang === "zh" ? (
                    <>
                      对方打开链接 → 连接 MetaMask → 点击 <span className="text-blue-400">Sign Document</span> → 钱包弹窗确认签名。签署完成后状态自动更新。
                    </>
                  ) : (
                    <>
                      The signer opens the link, connects MetaMask, clicks <span className="text-blue-400">Sign Document</span>, and confirms the signature in the wallet popup. Status updates automatically.
                    </>
                  )}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="tech-badge text-[11px]">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
                    EIP-712
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Warning */}
        <div className="mt-6 warning-card animate-fade-in stagger-8">
          <div className="flex gap-3 pl-2">
            <svg className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-amber-300">
                {lang === "zh" ? "重要提示" : "Important"}
              </p>
              <p className="mt-1 text-sm text-amber-200/70 leading-relaxed">
                {lang === "zh" ? (
                  <>对方必须在 MetaMask 里切换到 <span className="font-semibold text-amber-300">0G 网络</span>（测试网 Chain ID: <span className="font-mono text-amber-300">16602</span>），否则签名会失败。同时确保钱包有足够的测试网代币支付 Gas。</>
                ) : (
                  <>The signer must switch MetaMask to the <span className="font-semibold text-amber-300">0G network</span> (Testnet Chain ID: <span className="font-mono text-amber-300">16602</span>), otherwise signing will fail. Ensure the wallet has testnet tokens for gas fees.</>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Footer ─── */}
      <p className="mt-20 text-xs text-zinc-600 animate-fade-in stagger-8">
        {t("footerNote")}
      </p>
    </div>
  );
}

/* ─── Feature Card Component ─── */
function FeatureCard({
  icon,
  color,
  title,
  desc,
  stagger,
}: {
  icon: React.ReactNode;
  color: "blue" | "violet" | "cyan";
  title: string;
  desc: string;
  stagger: string;
}) {
  const colorMap = {
    blue: {
      bg: "bg-blue-500/10 group-hover:bg-blue-500/15",
      text: "text-blue-400",
      glow: "group-hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]",
    },
    violet: {
      bg: "bg-violet-500/10 group-hover:bg-violet-500/15",
      text: "text-violet-400",
      glow: "group-hover:shadow-[0_0_20px_rgba(139,92,246,0.15)]",
    },
    cyan: {
      bg: "bg-cyan-500/10 group-hover:bg-cyan-500/15",
      text: "text-cyan-400",
      glow: "group-hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]",
    },
  };
  const c = colorMap[color];

  return (
    <div className={`glass-card p-5 animate-fade-in-up stagger-${stagger} group ${c.glow}`}>
      <div className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg ${c.bg} ${c.text} transition-colors`}>
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-zinc-100">{title}</h3>
      <p className="mt-1.5 text-sm text-zinc-500 leading-relaxed">
        {desc}
      </p>
    </div>
  );
}
