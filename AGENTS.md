# AGENTS.md

> AI 编码规范 — 在此目录下生成代码时必须遵守。

## 1. 项目栈

- Next.js (App Router) + TypeScript
- Web3 相关库（wagmi / viem / ethers 等，按需引入）
- NVIDIA API
- 0G Storage（@0gfoundation/0g-storage-ts-sdk，用 SDK 默认配置）

## 2. API 限流

NVIDIA API 调用**每分钟不超过 30 次**。必须实现两种策略：

### 2.1 固定间隔
每次 API 请求后手动 `sleep(2100)`（>=2秒），确保安全。

### 2.2 滑动窗口
维护请求时间戳队列，请求前清理过期条目（>60s），超限则等待。

## 3. 代码原则

- **最小化**：只写必要代码，不预设未来功能
- **不画蛇添足**：用户没提的功能一律不加
- **简化**：能用标准库不用第三方库，能用简单方案不用复杂方案
- **正常注释**：关键逻辑写注释，错误路径写日志
- **KISS**：Keep it simple, stupid.

## 4. 命名规范

- **文件**：`kebab-case.ts` / `user-profile.tsx`
- **目录**：`kebab-case`
- **变量/函数**：`camelCase`
- **类型/接口**：`PascalCase`
- **组件**：`PascalCase`

## 5. Next.js 约定

- 遵循 App Router 结构（`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`）
- 客户端组件加 `"use client"` 指令
- 优先使用 Server Components
- API 路由放在 `app/api/` 下

## 6. 工具与环境

- **包管理器**：pnpm
- **CSS**：Tailwind CSS
- **开发命令**：
  - `pnpm dev` — 启动开发服务器
  - `pnpm build` — 生产构建
  - `pnpm lint` — 代码检查

## 7. 文件限制

- 上传文件最大 **10MB**
- 支持格式：PDF、PNG、JPG、DOCX（演示够了）

## 8. Agent 使用

- **禁止并行开多个 agent**，容易触发 API 429 报错
- 需要用 agent 时逐个调用，上一个完成后再开下一个

## 9. 0G 存储

- 使用 `@0gfoundation/0g-storage-ts-sdk` 默认配置，不需要额外环境变量
- 文件上传前客户端加密，增强安全性
- 元数据（标题、签署人、签名）用 localStorage，不存 0G