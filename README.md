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
5. `supabase/migrations/004_add_onboarding_fields.sql`
6. `supabase/migrations/005_add_data_expansion_metadata.sql`

第 5 阶段新增的数据表：

- `applications`：保存用户加入的申请项目、状态、优先级和备注
- `application_tasks`：保存每个申请项目下的任务、截止日期和完成状态

两张表都开启了 Row Level Security，用户只能读取、创建、更新和删除自己的数据。

## 第 5.5A 阶段：数据扩容元数据

本阶段为后续 API 导入、CSV 导入和人工核对建立基础数据结构，不接入 AI、不接入爬虫、不调用外部 API。

新增 migration：

- `supabase/migrations/005_add_data_expansion_metadata.sql`

数据质量和来源字段用途：

- `external_source`：记录未来数据来源，例如 CSV、学校官网整理或其他导入渠道。
- `external_id`：记录外部来源中的原始 ID，便于去重和后续同步。
- `verification_status`：记录数据核对状态，默认为 `unverified`。
- `data_quality_score`：记录数据完整度或质量分，当前限制为 0-100。
- `imported_at`：记录学校或项目数据被导入的时间。
- `notes`：记录数据导入、核对或人工备注。
- `import_jobs`：记录导入任务的来源、状态、成功数、错误数和错误信息。当前 RLS 仅允许登录用户读取自己创建的导入记录。
## 第 5.5B 阶段：学校基础数据导入

本阶段新增开发期学校基础数据导入能力，仅导入 `schools` 表的基础学校信息，不导入 `programs`、DDL、语言要求、GRE、学费或其他项目申请要求。

新增页面和 API：

- `/admin/import/universities`：登录用户可访问的开发期导入页面，正式上线前需要接入管理员权限控制。
- `/api/import/universities`：服务端 API route，由服务端请求 Hipo Labs University Domains List API，前端不直接调用外部 API。

导入策略：

- 按 `slug` / `name` / `website_url` 去重。
- 不删除已有学校数据。
- 不覆盖任何已有学校记录，因此不会覆盖 `verification_status = verified` 的人工核对数据。
- 新增学校的 `external_source` 为 `hipo_university_domains`，`verification_status` 为 `unverified`，`data_quality_score` 为 40。
- 导入任务结果会记录到 `import_jobs`。

注意：因为 `schools` 表保持 RLS 写入关闭，导入 API 需要在服务端配置 `SUPABASE_SERVICE_ROLE_KEY`。请不要把 service role key 写入前端代码，也不要使用 `NEXT_PUBLIC_` 前缀。

## 第 5.5E 阶段：QS 2027 Top 500 学校库筛选

本阶段新增 QS World University Rankings 2027 Top 500 CSV 导入与学校库过滤流程。系统不会删除已有 schools 数据，而是通过 `is_qs_top_500` 和 `is_active` 标记控制普通用户前端展示范围。

需要先在 Supabase SQL Editor 运行：

```sql
supabase/migrations/006_add_qs_ranking_fields_to_schools.sql
```

新增 schools 字段包括：`qs_rank_2027`、`qs_rank_display`、`ranking_year`、`ranking_source`、`ranking_source_url`、`is_qs_top_500`、`is_active`、`aliases`。

CSV 模板位置：

- `docs/templates/qs_2027_top500_template.csv`

CSV 字段说明：

- `qs_rank_2027`：数字排名，例如 `1`。
- `rank_display`：展示排名，例如 `=2`。
- `name` / `name_en`：学校名称。
- `country` / `city`：学校所在国家和城市。
- `website_url`：学校官网。
- `qs_url`：QS 来源页面。
- `aliases`：别名，用英文分号分隔，例如 `UCL;University College London`。

导入入口：

- `/admin/import/qs-top500`

导入规则：

- 先将所有学校的 `is_qs_top_500` 标记为 `false`。
- CSV 中匹配到的学校会更新 QS 排名字段，并设置 `is_qs_top_500 = true`、`is_active = true`。
- CSV 中无法匹配的 Top 500 学校会新增到 `schools` 表。
- 同步完成后，非 Top 500 学校会标记为 `is_active = false`，不会被物理删除。
- 本阶段不直接删除非 Top 500，是为了避免破坏已有项目、申请清单、任务和历史数据引用。

Supabase 检查方式：在 Table Editor 打开 `schools` 表，确认 QS 字段存在，并筛选 `is_qs_top_500 = true`、`is_active = true` 查看当前前端展示范围。
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

## 账户设置与支持页面

本轮新增和优化：

- `/settings`：账户设置页，仅登录用户可访问，包含账户概览、基本信息、偏好设置、帮助与支持、数据与隐私和危险区域。
- `/guide`：申请指南页，说明从背景评估、选校定位、项目了解、申请清单、DDL、文书材料到 Offer 和入学准备的流程。
- `/help`：帮助与联系页，引导用户前往反馈页面报告问题或提出建议。
- `/about`、`/feedback`、`/guide`、`/help` 使用登录态感知导航：未登录显示 public navbar；已登录显示“总览、学校库、项目库、About、Feedback”和右上角用户姓名头像菜单。
- 右上角用户菜单中的“账户设置 / 申请指南 / 帮助与联系 / 反馈问题”分别指向 `/settings`、`/guide`、`/help`、`/feedback`。

删除账户按钮当前只实现 UI、二次确认弹窗和联系管理员提示，不会真实删除 Supabase Auth 用户或数据库数据。后续如果实现真实删除，需要通过服务端 API 或 Server Action 使用 `SUPABASE_SERVICE_ROLE_KEY`，且不能把 service role key 放入任何 `NEXT_PUBLIC_` 环境变量。

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