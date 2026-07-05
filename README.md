# MyGrad

## 项目简介

MyGrad 是一个面向本科生的研究生申请决策平台，旨在帮助学生系统整理研究生申请信息，降低信息差带来的申请难度。

## 项目目标

本项目希望帮助学生完成背景评估、选校规划、学校与专业了解、申请管理、文书准备、Offer 对比、签证租房和入学准备。

## 当前阶段

第 2 阶段：用户系统与学生背景档案。

当前已完成 Supabase Auth 接入、注册、登录、退出、受保护页面、学生背景档案填写/读取/编辑，以及 Dashboard 登录状态和背景完成度展示。选校推荐、申请清单和学校数据库仍是后续阶段功能。

## 本阶段新增功能

- Supabase Auth 邮箱密码注册与登录
- 用户退出登录
- 受保护页面：`/dashboard`、`/profile`、`/profile/edit`
- 学生背景档案创建、读取和编辑
- Dashboard 显示当前登录邮箱与背景完成度
- Supabase PostgreSQL migration 草案：`supabase/migrations/001_create_student_profiles.sql`

## Supabase 环境变量

请在项目根目录自行创建 `.env.local`，不要提交到 GitHub。

```env
NEXT_PUBLIC_SUPABASE_URL=我的 Supabase Project URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=我的 Supabase Publishable Key
```

仓库中提供了 `.env.example` 和 `.env.local.example` 作为示例，不包含真实密钥。

## 数据库 SQL 使用方式

1. 打开 Supabase Project Dashboard。
2. 进入 SQL Editor。
3. 打开并复制 `supabase/migrations/001_create_student_profiles.sql` 的全部内容。
4. 在 SQL Editor 中运行。
5. 确认 `public.student_profiles` 已创建，并且 Row Level Security 已开启。

该 SQL 会创建 `student_profiles` 表、RLS policies，并添加 `updated_at` 自动更新时间 trigger。

## 本地开发

```bash
pnpm install
pnpm dev
```

常用检查：

```bash
pnpm lint
pnpm typecheck
pnpm build
```

如果本机命令行没有全局 Node.js，请使用 Codex 工作区内置运行时，或安装 Node.js 后再执行。

## 页面路径

- `/`：首页
- `/register`：注册
- `/login`：登录
- `/dashboard`：学生工作台
- `/profile`：学生背景档案展示
- `/profile/edit`：学生背景档案填写与编辑

## 本地测试流程

1. 创建 `.env.local` 并填入 Supabase URL 和 Publishable Key。
2. 在 Supabase SQL Editor 执行 `supabase/migrations/001_create_student_profiles.sql`。
3. 运行 `pnpm dev`。
4. 打开 `/register` 注册账号。
5. 如果 Supabase 开启了邮箱验证，请先完成邮箱验证。
6. 打开 `/login` 登录。
7. 登录后进入 `/dashboard`，确认能看到用户邮箱和背景完成度。
8. 打开 `/profile/edit` 填写并保存背景档案。
9. 打开 `/profile` 确认档案可以读取和展示。
10. 在 Dashboard 点击退出登录，确认退出后回到 `/login`。

## 规划文档

- [00_PRD.md](docs/00_PRD.md)：产品需求文档
- [01_SITE_MODULES.md](docs/01_SITE_MODULES.md)：网站模块规划
- [02_PAGE_MAP.md](docs/02_PAGE_MAP.md)：页面地图
- [03_DATABASE_DRAFT.md](docs/03_DATABASE_DRAFT.md)：数据库草案
- [04_MVP_ROADMAP.md](docs/04_MVP_ROADMAP.md)：MVP 路线图
- [05_CODEX_TASKS.md](docs/05_CODEX_TASKS.md)：后续 Codex 开发任务拆分

## 暂定技术栈

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase
- Vercel

## 后续开发阶段

- 第 0 阶段：项目规划文档
- 第 1 阶段：网站基础框架
- 第 2 阶段：用户系统与学生背景档案
- 第 3 阶段：学校与专业数据库
- 第 4 阶段：规则版选校推荐
- 第 5 阶段：申请清单、DDL 和任务管理
- 第 6 阶段：文书、简历和推荐信
- 第 7 阶段：学长学姐社区
- 第 8 阶段：Offer 对比和生活指南
- 第 9 阶段：后台管理系统
- 第 10 阶段：AI 功能增强
- 第 11 阶段：测试、部署和上线

下一阶段：第 3 阶段，学校与专业数据库。