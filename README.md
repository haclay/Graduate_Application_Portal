# MyGrad

## 项目简介

MyGrad 是一个面向本科生的研究生申请决策平台，旨在帮助学生系统整理研究生申请信息，降低信息差带来的申请难度。

## 项目目标

本项目希望帮助学生完成背景评估、选校规划、学校与专业了解、申请管理、文书准备、Offer 对比、签证租房和入学准备。

## 当前阶段

第 3 阶段：学校与专业数据库。

当前已完成学校库、研究生项目库、学校详情页、项目详情页、基础搜索筛选、学校/项目/DDL 数据表 SQL，以及 MVP seed 示例数据。当前数据仅用于开发演示，最终信息请以学校官网为准。

## 本阶段新增功能

- 学校列表页和学校详情页
- 项目列表页和项目详情页
- 学校关键词、国家、城市筛选
- 项目关键词、国家、专业方向、学位类型筛选
- 学校与项目页面统一展示来源链接和最后核对日期
- Supabase 数据表：`schools`、`programs`、`program_deadlines`
- MVP seed 示例数据：10 所学校、若干 CS / ECE / Data Science / Business Analytics / Engineering Management 项目

## Supabase 环境变量

请在项目根目录自行创建 `.env.local`，不要提交到 GitHub。

```env
NEXT_PUBLIC_SUPABASE_URL=我的 Supabase Project URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=我的 Supabase Publishable Key
```

仓库中提供了 `.env.example` 和 `.env.local.example` 作为示例，不包含真实密钥。

## 数据库 SQL 使用方式

请在 Supabase SQL Editor 中按顺序执行：

1. `supabase/migrations/001_create_student_profiles.sql`
2. `supabase/migrations/002_create_school_program_tables.sql`
3. `supabase/seed/001_seed_schools_programs.sql`

第 2 个文件会创建学校、项目和 DDL 表，并开启 RLS。第 3 个文件会插入 MVP 示例学校和项目数据。

## 如何添加新的学校和项目数据

当前阶段建议直接在 Supabase Table Editor 或 SQL Editor 中维护数据：

- 新学校写入 `schools`
- 新项目写入 `programs`，并关联对应 `school_id`
- 项目截止日期写入 `program_deadlines`，并关联对应 `program_id`

每条数据建议填写 `source_url` 和 `last_verified_at`。如果 DDL 或费用不确定，请留空或写明“请以官网为准”。

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
- `/schools`：学校列表
- `/schools/[slug]`：学校详情
- `/programs`：项目列表
- `/programs/[slug]`：项目详情

## 本地测试流程

1. 创建 `.env.local` 并填入 Supabase URL 和 Publishable Key。
2. 在 Supabase SQL Editor 按顺序执行 migration 和 seed SQL。
3. 运行 `pnpm dev`。
4. 打开 `/schools`，确认能看到学校列表，并测试关键词、国家、城市筛选。
5. 打开 `/programs`，确认能看到项目列表，并测试关键词、国家、专业方向、学位类型筛选。
6. 点击学校或项目详情，确认官网链接、来源链接、最后核对日期和“以官网为准”提示正常显示。
7. 回归测试 `/register`、`/login`、`/dashboard`、`/profile`。

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

下一阶段：第 4 阶段，规则版选校推荐。