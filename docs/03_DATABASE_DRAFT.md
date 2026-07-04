# 数据库草案

## 1. 设计原则

- 优先支持 MVP 的学校、专业、用户档案和申请管理
- 所有学校和项目数据应保留来源链接和更新时间
- 用户隐私数据需要与公共数据分离
- 表结构先保持清晰可扩展，避免早期过度复杂

## 2. 用户与档案

### users

由 Supabase Auth 管理认证信息，业务表只引用用户 ID。

字段草案：

- id
- email
- role
- created_at
- updated_at

### student_profiles

字段草案：

- id
- user_id
- undergraduate_school
- undergraduate_major
- gpa
- gpa_scale
- language_test_type
- language_score
- standardized_test_type
- standardized_score
- research_experience
- internship_experience
- awards
- target_countries
- target_majors
- budget_preference
- enrollment_term
- created_at
- updated_at

## 3. 学校与项目

### schools

字段草案：

- id
- name
- country
- region
- city
- official_website
- ranking_info
- description
- source_url
- last_verified_at
- created_at
- updated_at

### programs

字段草案：

- id
- school_id
- name
- degree_type
- department
- field
- duration
- tuition
- language_requirement
- gpa_requirement
- application_requirements
- deadline
- application_url
- description
- source_url
- last_verified_at
- created_at
- updated_at

## 4. 申请管理

### applications

字段草案：

- id
- user_id
- program_id
- category
- status
- priority
- deadline
- notes
- created_at
- updated_at

category 可选值：lottery、reach、match、safety。

status 可选值：considering、preparing、submitted、interview、admitted、rejected、waitlisted、declined、enrolled。

### application_tasks

字段草案：

- id
- application_id
- title
- description
- due_date
- status
- task_type
- created_at
- updated_at

## 5. 材料管理

### documents

字段草案：

- id
- user_id
- application_id
- type
- title
- status
- version
- file_url
- notes
- created_at
- updated_at

type 可选值：personal_statement、statement_of_purpose、resume、cv、writing_sample、portfolio、other。

### recommendation_letters

字段草案：

- id
- user_id
- application_id
- recommender_name
- recommender_title
- recommender_email
- submission_method
- status
- due_date
- notes
- created_at
- updated_at

## 6. Offer 与生活信息

### offers

字段草案：

- id
- user_id
- program_id
- application_id
- scholarship
- tuition
- estimated_living_cost
- decision_deadline
- status
- notes
- created_at
- updated_at

### city_guides

字段草案：

- id
- country
- city
- housing_info
- transport_info
- safety_info
- living_cost_info
- food_info
- source_url
- last_verified_at
- created_at
- updated_at

## 7. 内容与社区

### resources

字段草案：

- id
- title
- category
- content
- external_url
- status
- created_by
- created_at
- updated_at

### community_posts

字段草案：

- id
- user_id
- title
- content
- category
- related_school_id
- related_program_id
- status
- created_at
- updated_at

## 8. 后续数据库重点

- 为学校和项目增加标签系统
- 为申请要求拆分结构化字段
- 增加数据审核和版本记录
- 增加 RLS 权限策略
- 增加搜索索引和筛选字段
