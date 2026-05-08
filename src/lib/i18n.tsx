"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

type Lang = "en" | "zh";

const translations = {
  en: {
    // Nav
    navCreate: "Create",
    navDocuments: "Documents",
    navVerify: "Verify",
    connectWallet: "Connect Wallet",
    connecting: "Connecting...",
    wrongNetwork: "Wrong network",
    switchTo: "Switch to",
    switching: "Switching...",
    // Home
    poweredBy: "Powered by 0G Storage",
    heroTitle1: "Sign documents,",
    heroTitle2: "not subscriptions",
    heroDesc: "Upload, sign, and verify documents with your wallet. Encrypted and stored permanently on 0G — no fees, no middlemen.",
    getStarted: "Get Started",
    verifySignature: "Verify Signature",
    feature1Title: "Encrypted Upload",
    feature1Desc: "AES-256 client-side encryption before upload. Only authorized parties can decrypt.",
    feature2Title: "Wallet Signing",
    feature2Desc: "EIP-712 typed data — zero gas, cryptographically verifiable signatures.",
    feature3Title: "Permanent Storage",
    feature3Desc: "Decentralized on 0G Network. No single point of failure, no subscriptions.",
    footerNote: "Built for Web3 teams. Open source. No monthly fees.",
    // Create
    createTitle: "Create Document",
    createDesc: "Upload a document, add signers, and create a signing request.",
    docTitle: "Document Title",
    docTitlePlaceholder: "e.g. Employment Agreement",
    docTitleRequired: "Title is required",
    description: "Description (optional)",
    descPlaceholder: "Brief description of the document...",
    docFile: "Document File",
    signers: "Signers (wallet addresses)",
    signerPlaceholder: "0x...",
    add: "Add",
    createBtn: "Create Signing Request",
    creating: "Creating...",
    connectToCreate: "Connect your wallet to create a document.",
    uploaded: "Uploaded:",
    storage: "Storage:",
    storage0g: "0G Storage (encrypted)",
    storageLocal: "Local fallback",
    encryption: "Encryption: AES-256 — key saved",
    dropHere: "Drop your document here",
    dropHint: "PDF, PNG, JPG, DOCX — max 10MB — AES-256 encrypted",
    loadingUploader: "Loading uploader...",
    // Documents
    documentsTitle: "Documents",
    toSign: "To Sign",
    createdByMe: "Created by Me",
    noDocuments: "No documents yet.",
    createFirst: "Create your first document",
    connectToView: "Connect your wallet to view documents.",
    signersLabel: "signer",
    signersLabelPlural: "signers",
    // Document Detail
    backToDocs: "Back to Documents",
    docNotFound: "Document not found.",
    created: "Created",
    root: "Root",
    storageLabel: "Storage:",
    local: "Local",
    copyLink: "Copy Link",
    copied: "Copied",
    download: "Download",
    exportProof: "Export Proof",
    loadFrom0g: "Load from 0G",
    loadingFrom0g: "Loading from 0G...",
    delete: "Delete",
    deleting: "Deleting...",
    connectToSign: "Connect your wallet to sign.",
    youHaveSigned: "You have signed this document.",
    signDocument: "Sign Document",
    signing: "Signing...",
    noSigners: "No signers.",
    deleteTitle: "Delete Document",
    deleteDesc: "The encryption key will be lost permanently. This action cannot be undone.",
    deleteConfirm: "Delete",
    encryptionKey: "Encryption Key (save this!)",
    show: "Show",
    hide: "Hide",
    copy: "Copy",
    copiedLabel: "Copied",
    keyWarning: "Required to decrypt. Lost key = unrecoverable data.",
    // Verify
    verifyTitle: "Verify Signature",
    verifyDesc: "Verify an EIP-712 signature off-chain.",
    rootHashLabel: "Root Hash",
    rootHashPlaceholder: "0x...",
    signerLabel: "Signer Address",
    signerPlaceholderVerify: "0x...",
    timestampLabel: "Timestamp (unix seconds)",
    timestampPlaceholder: "1700000000",
    signatureLabel: "Signature",
    signaturePlaceholder: "0x...",
    networkLabel: "Network",
    verifyBtn: "Verify Signature",
    verifying: "Verifying...",
    connectToVerify: "Connect your wallet to verify.",
    resultValid: "Signature is VALID.",
    resultInvalid: "Signature is INVALID.",
    recoveredAddr: "Recovered address",
    doesNotMatch: "does not match claimed signer.",
  },
  zh: {
    // Nav
    navCreate: "创建",
    navDocuments: "文档",
    navVerify: "验证",
    connectWallet: "连接钱包",
    connecting: "连接中...",
    wrongNetwork: "网络错误",
    switchTo: "切换到",
    switching: "切换中...",
    // Home
    poweredBy: "基于 0G Storage",
    heroTitle1: "签署文档，",
    heroTitle2: "无需订阅",
    heroDesc: "用钱包上传、签署和验证文档。加密存储在 0G 上，永久保存，无费用，无中间商。",
    getStarted: "开始使用",
    verifySignature: "验证签名",
    feature1Title: "加密上传",
    feature1Desc: "上传前使用 AES-256 客户端加密，只有授权方可以解密。",
    feature2Title: "钱包签名",
    feature2Desc: "EIP-712 类型化数据，零 Gas 费，密码学可验证签名。",
    feature3Title: "永久存储",
    feature3Desc: "去中心化存储在 0G 网络上，无单点故障，无订阅费。",
    footerNote: "为 Web3 团队打造，开源免费，无月费。",
    // Create
    createTitle: "创建文档",
    createDesc: "上传文档，添加签署人，创建签署请求。",
    docTitle: "文档标题",
    docTitlePlaceholder: "如：雇佣协议",
    docTitleRequired: "请输入标题",
    description: "描述（可选）",
    descPlaceholder: "简要描述文档内容...",
    docFile: "文档文件",
    signers: "签署人（钱包地址）",
    signerPlaceholder: "0x...",
    add: "添加",
    createBtn: "创建签署请求",
    creating: "创建中...",
    connectToCreate: "请先连接钱包以创建文档。",
    uploaded: "已上传：",
    storage: "存储方式：",
    storage0g: "0G Storage（已加密）",
    storageLocal: "本地存储",
    encryption: "加密方式：AES-256 — 密钥已保存",
    dropHere: "将文档拖放到此处",
    dropHint: "支持 PDF、PNG、JPG、DOCX — 最大 10MB — AES-256 加密",
    loadingUploader: "加载上传组件中...",
    // Documents
    documentsTitle: "文档",
    toSign: "待签署",
    createdByMe: "我创建的",
    noDocuments: "暂无文档。",
    createFirst: "创建您的第一个文档",
    connectToView: "请先连接钱包查看文档。",
    signersLabel: "签署人",
    signersLabelPlural: "签署人",
    // Document Detail
    backToDocs: "返回文档列表",
    docNotFound: "未找到文档。",
    created: "创建于",
    root: "根哈希",
    storageLabel: "存储：",
    local: "本地",
    copyLink: "复制链接",
    copied: "已复制",
    download: "下载",
    exportProof: "导出证明",
    loadFrom0g: "从 0G 加载",
    loadingFrom0g: "从 0G 加载中...",
    delete: "删除",
    deleting: "删除中...",
    connectToSign: "请先连接钱包进行签署。",
    youHaveSigned: "您已签署此文档。",
    signDocument: "签署文档",
    signing: "签署中...",
    noSigners: "暂无签署人。",
    deleteTitle: "删除文档",
    deleteDesc: "加密密钥将永久丢失，此操作不可撤销。",
    deleteConfirm: "删除",
    encryptionKey: "加密密钥（请保存！）",
    show: "显示",
    hide: "隐藏",
    copy: "复制",
    copiedLabel: "已复制",
    keyWarning: "解密必需，密钥丢失 = 数据无法恢复。",
    // Verify
    verifyTitle: "验证签名",
    verifyDesc: "链下验证 EIP-712 签名。",
    rootHashLabel: "根哈希",
    rootHashPlaceholder: "0x...",
    signerLabel: "签署人地址",
    signerPlaceholderVerify: "0x...",
    timestampLabel: "时间戳（unix 秒）",
    timestampPlaceholder: "1700000000",
    signatureLabel: "签名",
    signaturePlaceholder: "0x...",
    networkLabel: "网络",
    verifyBtn: "验证签名",
    verifying: "验证中...",
    connectToVerify: "请先连接钱包进行验证。",
    resultValid: "签名有效。",
    resultInvalid: "签名无效。",
    recoveredAddr: "恢复的地址",
    doesNotMatch: "与声称的签署人不匹配。",
  },
} as const;

type TranslationKey = keyof typeof translations.en;

interface I18nContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("og-sign-lang") as Lang | null;
      if (saved === "en" || saved === "zh") setLangState(saved);
    } catch { /* ignore */ }
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try { localStorage.setItem("og-sign-lang", l); } catch { /* ignore */ }
  }, []);

  const t = useCallback((key: TranslationKey): string => {
    return translations[lang][key] ?? translations.en[key] ?? key;
  }, [lang]);

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
