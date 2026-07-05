# MyGrad

## 项目简介

MyGrad 是一个面向本科生的研究生申请决策平台，旨在帮助学生系统整理研究生申请信息，降低信息差带来的申请难度。

## 项目目标

本项目希望帮助学生完成背景评估、选校规划、学校与专业了解、申请管理、文书准备、Offer 对比、签证租房和入学准备。

## 当前阶段

第 4 阶段：规则版选校推荐。

当前已完成基于规则的初版选校推荐系统。系统会读取当前登录用户的学生背景档案、学校库、项目库和 DDL 数据，按照可解释规则将项目分为彩票、冲刺、匹配、稳妥四类，并生成推荐理由、风险提示和补强建议。本阶段不接入 AI、不接入爬虫、不调用外部 API。

## 本阶段新增功能

- `/matching`：选校推荐入口页
- `/matching/results`：规则版推荐结果页
- 推荐分组：彩票、冲刺、匹配、稳妥
- 推荐理由、风险提示、补强建议
- 最近 DDL 展示
- 根据 GPA、语言成绩、目标方向、目标国家、经历、GRE/GMAT、先修课进行初步评分

## 推荐使用的数据

规则系统使用以下数据：

- `student_profiles`：GPA、GPA 满分制、语言成绩、GRE/GMAT、经历、目标国家、目标专业、未来目标
- `schools`：学校国家、城市、官网和来源信息
- `programs`：项目方向、项目名称、简介、GRE/GMAT 要求、先修课、官网
- `program_deadlines`：项目 DDL 和入学季信息

当前推荐结果仅供申请规划参考，不代表真实录取概率。最终申请要求、DDL、材料和费用请以学校官网为准。

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
- `/matching`：规则版选校推荐入口
- `/matching/results`：规则版推荐结果

## 本地测试流程

1. 确认 `.env.local` 已配置 Supabase URL 和 Publishable Key。
2. 确认 Supabase SQL Editor 已执行 student profile、school/program 表和 seed 数据 SQL。
3. 运行 `pnpm dev`。
4. 打开 `/register` 注册账号，或打开 `/login` 登录已有账号。
5. 打开 `/profile/edit` 填写 GPA、GPA 满分制、语言成绩、目标国家、目标专业和经历信息。
6. 打开 `/schools` 和 `/programs`，确认 seed 数据存在。
7. 打开 `/matching`，点击“生成选校推荐”。
8. 在 `/matching/results` 查看彩票、冲刺、匹配、稳妥四类推荐结果。

## 当前推荐限制

- 当前规则是 MVP 初版，不代表真实录取概率。
- 尚未加入项目难度、历史案例、学校偏好、申请季变化和人工审核。
- 项目信息来自 seed 示例数据或手动维护数据，最终请以学校官网为准。
- GPA 和语言成绩只做简单规则换算，不能替代专业申请评估。

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

下一阶段：第 5 阶段，申请清单、DDL 和任务管理。