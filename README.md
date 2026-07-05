# MyGrad

## 项目简介

MyGrad 是一个面向本科生的研究生申请决策平台，目标是帮助学生系统整理申请信息，降低信息差带来的申请难度。

## 项目目标

帮助学生完成背景评估、选校规划、学校专业了解、申请管理、文书准备、Offer 对比、签证租房和入学准备。

## 当前阶段

第 5 阶段：申请清单、DDL 和任务管理。

当前已完成用户注册登录、学生背景档案、学校与项目数据库、规则版选校推荐，以及初版申请管理系统。用户可以把项目加入申请清单，自动生成默认申请任务，管理任务完成状态、申请状态、备注和 DDL。

## 第 5 阶段新增功能

- `/applications`：查看自己的申请清单，支持状态筛选和按 DDL 排序
- `/applications/[id]`：查看单个申请项目详情，更新状态、备注、任务和删除申请
- `/tasks`：集中查看所有申请任务，按逾期、7 天内、30 天内、无截止日期、已完成分组
- `/calendar`：查看申请清单中的项目 DDL 列表
- `/programs/[slug]`：项目详情页支持加入申请清单
- `/matching/results`：推荐结果卡片支持加入申请清单
- `/dashboard`：显示申请数量、未完成任务、近期任务、近期 DDL 和申请状态分布

本阶段不接入 AI、不接入爬虫、不调用外部 API。

## 暂定技术栈

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase
- Vercel

## Supabase 环境变量

请在项目根目录自行创建 `.env.local`，不要提交到 GitHub。

```env
NEXT_PUBLIC_SUPABASE_URL=我的 Supabase Project URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=我的 Supabase Publishable Key
```

仓库中提供了 `.env.example` 和 `.env.local.example` 作为空模板，不包含真实密钥。

## 数据库 SQL 使用方式

请在 Supabase SQL Editor 中按顺序执行：

1. `supabase/migrations/001_create_student_profiles.sql`
2. `supabase/migrations/002_create_school_program_tables.sql`
3. `supabase/seed/001_seed_schools_programs.sql`
4. `supabase/migrations/003_create_application_tables.sql`

第 5 阶段新增的数据表：

- `applications`：保存用户加入的申请项目、状态、优先级和备注
- `application_tasks`：保存每个申请项目下的任务、截止日期和完成状态

两张表都开启了 Row Level Security，用户只能读取、创建、更新和删除自己的数据。

## 如何添加学校和项目数据

当前学校和项目数据来自 seed 示例文件：

- `supabase/seed/001_seed_schools_programs.sql`

后续可以在 Supabase 中继续维护 `schools`、`programs`、`program_deadlines` 三张表。当前数据仅作为 MVP 示例，DDL、申请要求、费用和材料请最终以学校官网为准。

## 本地开发

```bash
pnpm dev
```

常用检查命令：

```bash
pnpm lint
pnpm typecheck
pnpm build
```

## 第 5 阶段测试方式

1. 注册或登录账号。
2. 确认 `.env.local` 已配置 Supabase URL 和 Publishable Key。
3. 确认已在 Supabase SQL Editor 执行第 1 到第 4 个 SQL 文件。
4. 打开 `/programs`，进入任意项目详情页，点击“加入申请清单”。
5. 打开 `/matching/results`，也可以从推荐卡片加入申请清单。
6. 打开 `/applications`，查看申请清单、筛选状态、进入详情或删除申请。
7. 打开 `/applications/[id]`，更新申请状态、编辑备注、勾选任务、新增任务或删除任务。
8. 打开 `/tasks`，检查任务是否按逾期、7 天内、30 天内、无截止日期、已完成分组。
9. 打开 `/calendar`，检查 DDL 是否按日期升序展示。
10. 打开 `/dashboard`，检查申请数量、近期任务、近期 DDL 和状态分布。

## 当前限制

- DDL 数据来自 `program_deadlines` seed 或手动维护数据，最终请以学校官网为准。
- 默认任务是 MVP 模板，后续可以按国家、项目类型和申请轮次细化。
- 当前没有复杂日历组件，`/calendar` 第一版先展示 DDL 列表。
- 申请状态和任务状态只做基础管理，暂未加入提醒通知。

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

下一阶段建议进入：第 6 阶段，文书、简历和推荐信管理。