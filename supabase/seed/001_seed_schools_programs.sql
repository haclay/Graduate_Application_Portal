-- Purpose:
--   Seed MVP sample schools and graduate programs for MyGrad phase 3.
--
-- How to use:
--   1. Run supabase/migrations/002_create_school_program_tables.sql first.
--   2. Open Supabase SQL Editor.
--   3. Paste and run this whole file.
--
-- Notes:
--   - Seed data is for MVP demonstration only.
--   - Deadlines may be null when uncertain; always verify details on official websites.
--   - Do not use this data as final application advice.

with inserted_schools as (
  insert into public.schools (
    name,
    name_en,
    slug,
    country,
    region,
    city,
    description,
    website_url,
    ranking_summary,
    tuition_range,
    living_cost_range,
    strengths,
    source_url,
    last_verified_at
  )
  values
    (
      'University of California, Los Angeles',
      'UCLA',
      'ucla',
      'United States',
      'California',
      'Los Angeles',
      'UCLA 是位于洛杉矶的公立研究型大学，工程、计算机、数据相关方向资源丰富。',
      'https://www.ucla.edu/',
      '综合排名和学术声誉较强，具体排名请以最新榜单为准。',
      '请以项目官网为准',
      '洛杉矶生活成本较高，请结合个人预算评估。',
      array['Computer Science', 'Data Science', 'Engineering'],
      'https://www.ucla.edu/',
      '2026-07-05'
    ),
    (
      'University of Southern California',
      'USC',
      'usc',
      'United States',
      'California',
      'Los Angeles',
      'USC 是位于洛杉矶的私立研究型大学，工程学院和职业网络对申请者有吸引力。',
      'https://www.usc.edu/',
      '工程、计算机和商业相关项目选择较多。',
      '请以项目官网为准',
      '洛杉矶生活成本较高，请以实际租房和生活方式为准。',
      array['Computer Science', 'Engineering Management', 'Business Analytics'],
      'https://www.usc.edu/',
      '2026-07-05'
    ),
    (
      'University of California San Diego',
      'UCSD',
      'ucsd',
      'United States',
      'California',
      'San Diego',
      'UCSD 是加州大学系统的重要研究型大学，在计算机、工程和数据方向有较强研究基础。',
      'https://ucsd.edu/',
      'STEM 方向口碑较强，具体项目要求请以官网为准。',
      '请以项目官网为准',
      '圣地亚哥生活成本较高但通常低于湾区核心区域。',
      array['Computer Science', 'Data Science', 'Electrical Engineering'],
      'https://ucsd.edu/',
      '2026-07-05'
    ),
    (
      'Carnegie Mellon University',
      'CMU',
      'carnegie-mellon-university',
      'United States',
      'Pennsylvania',
      'Pittsburgh',
      'Carnegie Mellon University 在计算机科学、人工智能、软件工程和工程管理方面具有全球影响力。',
      'https://www.cmu.edu/',
      '计算机相关方向竞争激烈，申请要求请逐项目核对。',
      '请以项目官网为准',
      'Pittsburgh 生活成本通常低于美国东西海岸核心城市。',
      array['Computer Science', 'Software Engineering', 'Engineering Management'],
      'https://www.cmu.edu/',
      '2026-07-05'
    ),
    (
      'Columbia University',
      'Columbia University',
      'columbia-university',
      'United States',
      'New York',
      'New York',
      'Columbia University 位于纽约市，工程、数据、商业分析和跨学科资源丰富。',
      'https://www.columbia.edu/',
      '常见于综合排名前列，城市资源丰富。',
      '请以项目官网为准',
      '纽约生活成本高，需要提前规划预算。',
      array['Data Science', 'Computer Science', 'Business Analytics'],
      'https://www.columbia.edu/',
      '2026-07-05'
    ),
    (
      'New York University',
      'NYU',
      'new-york-university',
      'United States',
      'New York',
      'New York',
      'NYU 位于纽约市，数据科学、计算机和商业相关项目与城市产业资源联系紧密。',
      'https://www.nyu.edu/',
      '项目选择多，具体申请要求差异较大。',
      '请以项目官网为准',
      '纽约生活成本高，请以个人住宿和通勤安排估算。',
      array['Data Science', 'Computer Science', 'Business Analytics'],
      'https://www.nyu.edu/',
      '2026-07-05'
    ),
    (
      'Imperial College London',
      'Imperial College London',
      'imperial-college-london',
      'United Kingdom',
      'England',
      'London',
      'Imperial College London 以工程、计算机、科学和商科交叉方向见长。',
      'https://www.imperial.ac.uk/',
      '英国顶尖理工类大学之一，项目要求请以官网为准。',
      '请以项目官网为准',
      '伦敦生活成本高，请提前规划住宿和交通。',
      array['Engineering', 'Computing', 'Business Analytics'],
      'https://www.imperial.ac.uk/',
      '2026-07-05'
    ),
    (
      'University College London',
      'UCL',
      'ucl',
      'United Kingdom',
      'England',
      'London',
      'UCL 是位于伦敦的综合研究型大学，计算机、数据、工程和管理相关项目覆盖面广。',
      'https://www.ucl.ac.uk/',
      '综合实力强，学院和项目要求差异较大。',
      '请以项目官网为准',
      '伦敦生活成本高，请以实际住宿选择为准。',
      array['Computer Science', 'Data Science', 'Engineering Management'],
      'https://www.ucl.ac.uk/',
      '2026-07-05'
    ),
    (
      'National University of Singapore',
      'NUS',
      'national-university-of-singapore',
      'Singapore',
      'Singapore',
      'Singapore',
      'NUS 是新加坡旗舰研究型大学，在计算机、工程、数据和商业分析方向有强资源。',
      'https://nus.edu.sg/',
      '亚洲顶尖综合大学之一，项目竞争较强。',
      '请以项目官网为准',
      '新加坡生活成本中高，住宿成本需重点关注。',
      array['Computer Science', 'Data Science', 'Business Analytics'],
      'https://nus.edu.sg/',
      '2026-07-05'
    ),
    (
      'Nanyang Technological University',
      'NTU',
      'nanyang-technological-university',
      'Singapore',
      'Singapore',
      'Singapore',
      'NTU 是新加坡重要研究型大学，工程、计算机和数据方向具有较强优势。',
      'https://www.ntu.edu.sg/',
      '工程和技术方向口碑强，具体要求请以官网为准。',
      '请以项目官网为准',
      '新加坡生活成本中高，住宿成本需重点关注。',
      array['Electrical Engineering', 'Computer Science', 'Engineering Management'],
      'https://www.ntu.edu.sg/',
      '2026-07-05'
    )
  on conflict (slug) do update set
    name = excluded.name,
    name_en = excluded.name_en,
    country = excluded.country,
    region = excluded.region,
    city = excluded.city,
    description = excluded.description,
    website_url = excluded.website_url,
    ranking_summary = excluded.ranking_summary,
    tuition_range = excluded.tuition_range,
    living_cost_range = excluded.living_cost_range,
    strengths = excluded.strengths,
    source_url = excluded.source_url,
    last_verified_at = excluded.last_verified_at
  returning id, slug
),
all_schools as (
  select id, slug from inserted_schools
  union
  select id, slug from public.schools
  where slug in (
    'ucla',
    'usc',
    'ucsd',
    'carnegie-mellon-university',
    'columbia-university',
    'new-york-university',
    'imperial-college-london',
    'ucl',
    'national-university-of-singapore',
    'nanyang-technological-university'
  )
),
program_seed as (
  select
    s.id as school_id,
    p.name,
    p.slug,
    p.degree_type,
    p.faculty,
    p.duration,
    p.field,
    p.description,
    p.language_requirements,
    p.gre_gmat_requirements,
    p.gpa_preference,
    p.prerequisites,
    p.application_materials,
    p.recommendation_letters_count,
    p.tuition,
    p.scholarship_info,
    p.curriculum_summary,
    p.career_outcomes,
    p.suitable_for,
    p.not_suitable_for,
    p.official_url,
    p.source_url,
    p.last_verified_at
  from all_schools s
  join (
    values
      ('ucla', 'MS in Computer Science', 'ucla-ms-computer-science', 'MS', 'Computer Science Department', '约 2 年', 'Computer Science', '面向希望深入学习计算机系统、人工智能、软件和理论方向的学生。', '请以官网为准；通常需提交英语能力证明。', '请以官网为准。', '重视计算机、数学和工程基础。', '建议具备编程、数据结构、算法和数学基础。', array['成绩单', '简历', '目的陈述', '推荐信', '语言成绩'], 3, '请以官网为准', '请以官网为准', '覆盖系统、AI、理论、软件等方向课程。', '软件工程、研究、数据、AI 和技术岗位。', '有较强 CS 基础并希望进入研究型或技术型路径的学生。', '缺少编程和数学基础且不愿补课的学生。', 'https://www.cs.ucla.edu/graduate-admission/', 'https://www.cs.ucla.edu/graduate-admission/', '2026-07-05'::date),
      ('usc', 'MS in Computer Science', 'usc-ms-computer-science', 'MS', 'Viterbi School of Engineering', '约 1.5-2 年', 'Computer Science', 'USC Viterbi 下的计算机硕士项目，方向覆盖软件、AI、数据和系统。', '请以官网为准。', '请以官网为准。', '重视工程、数学和计算机课程背景。', '建议具备编程、数据结构和算法基础。', array['成绩单', '简历', '个人陈述', '推荐信', '语言成绩'], 2, '请以官网为准', '请以官网为准', '课程选择较多，可按方向组合。', '软件开发、数据工程、AI、产品技术岗位。', '希望在洛杉矶和工程职业网络中发展的学生。', '希望小班高度定制项目体验的学生需进一步核对项目规模。', 'https://viterbigradadmission.usc.edu/programs/masters/msprograms/computer-science/ms-computer-science/', 'https://viterbigradadmission.usc.edu/', '2026-07-05'::date),
      ('usc', 'MS in Engineering Management', 'usc-ms-engineering-management', 'MS', 'Viterbi School of Engineering', '约 1.5-2 年', 'Engineering Management', '面向希望结合工程技术、管理和商业决策的学生。', '请以官网为准。', '请以官网为准。', '偏好工程、理工或相关量化背景。', '建议具备工程、数学或技术项目经历。', array['成绩单', '简历', '目的陈述', '推荐信', '语言成绩'], 2, '请以官网为准', '请以官网为准', '覆盖项目管理、系统工程、数据和管理课程。', '项目管理、技术管理、咨询、产品运营。', '有工程背景并想转向技术管理的学生。', '希望纯研究型工程方向的学生。', 'https://viterbigradadmission.usc.edu/', 'https://viterbigradadmission.usc.edu/', '2026-07-05'::date),
      ('ucsd', 'MS in Electrical and Computer Engineering', 'ucsd-ms-electrical-computer-engineering', 'MS', 'Jacobs School of Engineering', '约 2 年', 'ECE', '覆盖电子、通信、计算机工程、机器学习和信号处理等方向。', '请以官网为准。', '请以官网为准。', '重视工程、数学和相关专业课程。', '建议具备电路、信号、编程或计算机工程基础。', array['成绩单', '简历', '目的陈述', '推荐信', '语言成绩'], 3, '请以官网为准', '请以官网为准', '方向可围绕通信、系统、硬件、机器学习等展开。', '硬件、通信、嵌入式、机器学习和工程研发岗位。', '电子、计算机工程或相关背景学生。', '完全没有工程和数学基础的学生。', 'https://ece.ucsd.edu/graduate', 'https://ece.ucsd.edu/graduate', '2026-07-05'::date),
      ('carnegie-mellon-university', 'Master of Software Engineering', 'cmu-master-software-engineering', 'MS', 'School of Computer Science', '约 16 个月', 'Software Engineering', '偏工程实践和大型软件系统能力培养的硕士项目。', '请以官网为准。', '请以官网为准。', '重视软件开发、系统设计和团队项目能力。', '建议具备较强编程和软件工程经历。', array['成绩单', '简历', '目的陈述', '推荐信', '语言成绩'], 3, '请以官网为准', '请以官网为准', '强调软件架构、工程方法、团队项目和实践。', '软件工程、技术负责人、平台和系统开发岗位。', '有工程实践经历并想强化软件系统能力的学生。', '更想做纯理论研究的学生。', 'https://mse.isri.cmu.edu/', 'https://mse.isri.cmu.edu/', '2026-07-05'::date),
      ('columbia-university', 'MS in Data Science', 'columbia-ms-data-science', 'MS', 'Data Science Institute', '约 1.5 年', 'Data Science', '跨统计、机器学习、数据系统和应用领域的数据科学项目。', '请以官网为准。', '请以官网为准。', '重视数学、统计、编程和数据分析基础。', '建议具备微积分、线代、概率统计和编程能力。', array['成绩单', '简历', '个人陈述', '推荐信', '语言成绩'], 3, '请以官网为准', '请以官网为准', '覆盖机器学习、数据系统、统计和应用方向。', '数据科学、机器学习、分析、金融科技和咨询岗位。', '希望在纽约利用数据和产业资源的学生。', '缺少数学统计基础且不愿补充的学生。', 'https://datascience.columbia.edu/education/programs/m-s-in-data-science/', 'https://datascience.columbia.edu/', '2026-07-05'::date),
      ('new-york-university', 'MS in Data Science', 'nyu-ms-data-science', 'MS', 'Center for Data Science', '约 2 年', 'Data Science', 'NYU 数据科学硕士覆盖统计、机器学习、数据系统和应用。', '请以官网为准。', '请以官网为准。', '偏好数学、统计和编程基础。', '建议具备概率统计、线性代数和 Python 编程能力。', array['成绩单', '简历', '目的陈述', '推荐信', '语言成绩'], 3, '请以官网为准', '请以官网为准', '课程覆盖机器学习、数据管理、统计和选修应用。', '数据科学、机器学习、分析和技术岗位。', '希望在纽约学习数据科学并连接产业资源的学生。', '不喜欢量化和编程训练的学生。', 'https://cds.nyu.edu/masters-program/', 'https://cds.nyu.edu/masters-program/', '2026-07-05'::date),
      ('imperial-college-london', 'MSc Business Analytics', 'imperial-msc-business-analytics', 'MSc', 'Imperial College Business School', '约 1 年', 'Business Analytics', '结合商业问题、数据分析、建模和决策的硕士项目。', '请以官网为准。', '请以官网为准。', '偏好量化、商业、工程、计算机或相关背景。', '建议具备数学、统计或编程基础。', array['成绩单', '简历', '个人陈述', '推荐信', '语言成绩'], 2, '请以官网为准', '请以官网为准', '覆盖数据分析、机器学习、优化和商业应用。', '商业分析、咨询、产品分析、数据分析岗位。', '希望连接商业和数据分析的学生。', '只想做底层系统或纯 CS 研究的学生。', 'https://www.imperial.ac.uk/business-school/masters/business-analytics/', 'https://www.imperial.ac.uk/business-school/masters/business-analytics/', '2026-07-05'::date),
      ('ucl', 'MSc Computer Science', 'ucl-msc-computer-science', 'MSc', 'Department of Computer Science', '约 1 年', 'Computer Science', '面向希望系统学习计算机基础和应用方向的硕士项目。', '请以官网为准。', '请以官网为准。', '项目具体背景要求请以官网为准。', '建议核对是否适合转专业或已有 CS 背景申请者。', array['成绩单', '简历', '个人陈述', '推荐信', '语言成绩'], 2, '请以官网为准', '请以官网为准', '覆盖编程、系统、数据和计算机基础课程。', '软件开发、数据、技术咨询和产品技术岗位。', '希望在伦敦学习计算机方向的学生。', '不愿承担一年制高强度学习节奏的学生。', 'https://www.ucl.ac.uk/prospective-students/graduate/taught-degrees', 'https://www.ucl.ac.uk/prospective-students/graduate/taught-degrees', '2026-07-05'::date),
      ('national-university-of-singapore', 'Master of Computing', 'nus-master-of-computing', 'Master', 'School of Computing', '约 1.5-2 年', 'Computer Science', 'NUS School of Computing 下的研究生项目，方向覆盖计算机、信息系统和 AI 相关领域。', '请以官网为准。', '请以官网为准。', '重视计算机、数学和相关技术背景。', '建议具备编程、算法和数学基础。', array['成绩单', '简历', '目的陈述', '推荐信', '语言成绩'], 2, '请以官网为准', '请以官网为准', '可根据方向选择计算机系统、AI、数据等课程。', '软件、AI、数据、金融科技和区域技术岗位。', '希望在亚洲技术生态发展的学生。', '缺少 CS 基础且不愿补充的学生。', 'https://www.comp.nus.edu.sg/programmes/pg/', 'https://www.comp.nus.edu.sg/programmes/pg/', '2026-07-05'::date),
      ('national-university-of-singapore', 'MSc Business Analytics', 'nus-msc-business-analytics', 'MSc', 'NUS Business Analytics Centre', '约 1 年', 'Business Analytics', '结合商业、数据分析、优化和机器学习的商业分析硕士。', '请以官网为准。', '请以官网为准。', '偏好量化、商业、工程或计算机相关背景。', '建议具备数学、统计和编程基础。', array['成绩单', '简历', '申请文书', '推荐信', '语言成绩'], 2, '请以官网为准', '请以官网为准', '覆盖分析建模、商业决策、机器学习和行业项目。', '商业分析、数据分析、咨询和产品分析。', '希望在新加坡或亚洲市场做数据商业方向的学生。', '只想做纯软件工程或硬件研发的学生。', 'https://msba.nus.edu.sg/', 'https://msba.nus.edu.sg/', '2026-07-05'::date),
      ('nanyang-technological-university', 'MSc in Signal Processing and Machine Learning', 'ntu-msc-signal-processing-machine-learning', 'MSc', 'School of Electrical and Electronic Engineering', '约 1 年', 'ECE', '面向信号处理、机器学习和电子工程交叉方向的硕士项目。', '请以官网为准。', '请以官网为准。', '偏好电子工程、计算机、数学或相关工程背景。', '建议具备信号处理、数学、编程或机器学习基础。', array['成绩单', '简历', '申请陈述', '推荐信', '语言成绩'], 2, '请以官网为准', '请以官网为准', '覆盖信号处理、机器学习、通信和工程应用。', '机器学习工程、通信、算法、研发岗位。', '有 ECE、CS 或数学背景的学生。', '没有工程数学基础的学生。', 'https://www.ntu.edu.sg/education/graduate-programme', 'https://www.ntu.edu.sg/education/graduate-programme', '2026-07-05'::date)
  ) as p(
    school_slug,
    name,
    slug,
    degree_type,
    faculty,
    duration,
    field,
    description,
    language_requirements,
    gre_gmat_requirements,
    gpa_preference,
    prerequisites,
    application_materials,
    recommendation_letters_count,
    tuition,
    scholarship_info,
    curriculum_summary,
    career_outcomes,
    suitable_for,
    not_suitable_for,
    official_url,
    source_url,
    last_verified_at
  ) on p.school_slug = s.slug
),
inserted_programs as (
  insert into public.programs (
    school_id,
    name,
    slug,
    degree_type,
    faculty,
    duration,
    field,
    description,
    language_requirements,
    gre_gmat_requirements,
    gpa_preference,
    prerequisites,
    application_materials,
    recommendation_letters_count,
    tuition,
    scholarship_info,
    curriculum_summary,
    career_outcomes,
    suitable_for,
    not_suitable_for,
    official_url,
    source_url,
    last_verified_at
  )
  select
    school_id,
    name,
    slug,
    degree_type,
    faculty,
    duration,
    field,
    description,
    language_requirements,
    gre_gmat_requirements,
    gpa_preference,
    prerequisites,
    application_materials,
    recommendation_letters_count,
    tuition,
    scholarship_info,
    curriculum_summary,
    career_outcomes,
    suitable_for,
    not_suitable_for,
    official_url,
    source_url,
    last_verified_at
  from program_seed
  on conflict (slug) do update set
    school_id = excluded.school_id,
    name = excluded.name,
    degree_type = excluded.degree_type,
    faculty = excluded.faculty,
    duration = excluded.duration,
    field = excluded.field,
    description = excluded.description,
    language_requirements = excluded.language_requirements,
    gre_gmat_requirements = excluded.gre_gmat_requirements,
    gpa_preference = excluded.gpa_preference,
    prerequisites = excluded.prerequisites,
    application_materials = excluded.application_materials,
    recommendation_letters_count = excluded.recommendation_letters_count,
    tuition = excluded.tuition,
    scholarship_info = excluded.scholarship_info,
    curriculum_summary = excluded.curriculum_summary,
    career_outcomes = excluded.career_outcomes,
    suitable_for = excluded.suitable_for,
    not_suitable_for = excluded.not_suitable_for,
    official_url = excluded.official_url,
    source_url = excluded.source_url,
    last_verified_at = excluded.last_verified_at
  returning id, slug, source_url, last_verified_at
)
insert into public.program_deadlines (
  program_id,
  round_name,
  deadline_date,
  intake_term,
  notes,
  source_url,
  last_verified_at
)
select
  id,
  'Main Round',
  null,
  'Fall / Autumn',
  '示例数据未确认具体 DDL，请以官网为准。',
  source_url,
  last_verified_at
from inserted_programs
on conflict do nothing;
