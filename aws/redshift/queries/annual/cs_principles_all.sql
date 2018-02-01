-- Distinct teacher-student combinations who started CSP in the first half of 2017-18 school year
drop table if exists #csp_first_half;
create temp table #csp_first_half as
select distinct se.user_id user_id_teacher, ul.user_id user_id_student
from user_levels ul
join dashboard_production.users u on u.id = ul.user_id
left join followers fo on fo.student_user_id = ul.user_id
left join sections se on se.id = fo.section_id
join scripts sc on sc.id = ul.script_id
where sc.name in ('csp1','csp2','csp3','csp3-research-mxghyt','csp4','csp5','csp-explore','csp-create')
and ul.created_at between '2017-08-01' and '2017-12-31' -- moved to august 1st for 2017-18 reporting for consistency with facebook reporting
and u.user_type = 'student'
group by 1,2;

-- Teacher-student-script: # of stages started in CSP over entire 2016-17 school year
drop table if exists #csp_2017;
create temp table #csp_2017 as
select se.user_id user_id_teacher, ul.user_id user_id_student, ul.script_id, count(distinct st.absolute_position) stages
from user_levels ul
join dashboard_production.levels_script_levels lsl on ul.level_id = lsl.level_id
join dashboard_production.script_levels sl on sl.id = lsl.script_level_id
join dashboard_production.stages st on st.id = sl.stage_id
join dashboard_production.users u on u.id = ul.user_id
left join followers fo on fo.student_user_id = ul.user_id
left join sections se on se.id = fo.section_id
where ul.script_id in (122,123,124,125,126,127)
and ul.created_at between '2016-07-01' and '2017-06-30'
and u.user_type = 'student'
group by 1,2,3;

-- Distinct students who completed CSP (4+ units of 5+ stages) over entire 2016-17 school year
drop table if exists #csp_completers_2017;
create temp table #csp_completers_2017 as
select user_id_student
from
(
select user_id_student, count(distinct script_id) scripts
from #csp_2017
where stages >= 5
group by user_id_student
)
where scripts >= 4;

-- Distinct teachers who completed CSP (5+ students meeting above definition) over entire 2016-17 school year
drop table if exists #csp_completers_2017_teachers;
create temp table #csp_completers_2017_teachers as
select user_id
from
(
-- count students by teacher who met bar for completing course this year
select se.user_id, count(distinct f.student_user_id) students
from sections se 
join followers f on f.section_id = se.id
where f.student_user_id in ( -- students who met bar for "completing" course this year
  select user_id_student from #csp_completers_2017
)
group by 1
)
where students >= 5;

-- Distinct PD'd teachers who completed CSP over entire 2016-17 school year
drop table if exists #csp_completers_2017_teachers_pd;
create temp table #csp_completers_2017_teachers_pd as
select distinct tp.studio_person_id 
from #csp_completers_2017_teachers tea
join users u on u.id = tea.user_id
join teacher_profiles tp on tp.studio_person_id = u.studio_person_id
where tp.studio_person_id not in (
select studio_person_id
from teacher_profiles
where (other_pd = 'nmsi' and pd is null)
);

-- Distinct students who completed one unit (5+ stages) but didn't complete course
drop table if exists #single_unit_students;
create temp table #single_unit_students as
select distinct user_id_student
from #csp_2017
where stages >= 5
and user_id_student not in (select * from #csp_completers_2017);

-- Distinct teachers who completed one unit (5+ students meeting above definition) but didn't complete course
drop table if exists #single_unit_teachers;
create temp table #single_unit_teachers as
select user_id
from
(
-- count students by teacher who met bar for completing course this year
select se.user_id, count(distinct f.student_user_id) students
from sections se 
join followers f on f.section_id = se.id
where f.student_user_id in ( -- students who met bar for "completing" course this year
  select distinct user_id_student
  from #csp_2017
  where stages >= 5
  and user_id_student not in (select * from #csp_completers_2017)
)
group by 1
)
where students >= 5
and user_id not in (select * from #csp_completers_2017_teachers);

select sum(case when pct_frl < 0.5 then 1 else 0 end)::float / sum(case when pct_frl is not null then 1 else 0 end) value
from
(
select tp.studio_person_id, scp.total, sf.totfrl, 
case when total in (-1,0) then null when totfrl = -1 then null else totfrl::float / total end pct_frl
from teacher_profiles tp
join public.bb_nces_matches_cleaned mc on mc.studio_person_id = tp.studio_person_id
join public.bb_school_population scp on scp.ncessch::bigint = mc.id::bigint
join public.bb_school_farm sf on sf.ncessch::bigint = mc.id::bigint
where pd in ('teachercon-slc', 'teachercon-chi', 'teachercon-atl')
)

union all

-- teachers who started
select count(*) value, 'Teachers who started' metric
from
(
select user_id_teacher, count(distinct user_id_student) students
from #csp_2017_first_half
group by 1
)
where students >= 5

union all

-- students who started
select count(distinct user_id_student) value, 'Students who started' metric
from #csp_2017_first_half

union all

-- pct female, students who started
select count(distinct case when u.gender = 'f' then user_id_student else null end)::float / 
count(distinct case when u.gender in ('m','f') then user_id_student else null end)::float value, 'Students who started, % female' metric 
from #csp_2017_first_half fh
join users u on u.id = fh.user_id_student

union all

-- pct urm, students who started
select count(distinct case when u.urm = 1 then user_id_student else null end)::float / 
count(distinct case when u.urm in (0,1) then user_id_student else null end)::float value, 'Students who started, % URM' metric
from #csp_2017_first_half fh
join users u on u.id = fh.user_id_student

union all

select avg(case when pct_farm is null then null when pct_farm >= 0.5 then 1 else 0 end::float) value, 'Students who started, % high needs' metric
from
(
select user_id_student, avg(case when total in (-1,0) then null when totfrl = -1 then null else totfrl::float / total end) pct_farm
from #csp_2017_first_half fh
join followers f on f.student_user_id = fh.user_id_student
join sections se on se.id = f.section_id
join users u on u.id = se.user_id
join school_infos si on si.id = u.school_info_id
JOIN public.bb_school_farm sf ON sf.ncessch = si.school_id
JOIN public.bb_school_population pop ON pop.ncessch = sf.ncessch
group by 1
)

union all

-- # of teachers completing
select count(*) value, 'Teachers who completed' metric 
from #csp_completers_2017_teachers

union all

-- # of students completing
select count(*) value, 'Students who completed' metric 
from #csp_completers_2017

union all

-- pct female
select count(distinct case when gender = 'f' then user_id_student else null end)::float / 
count(distinct case when gender in ('m','f') then user_id_student else null end)::float value, 'Students who completed, % female' metric
from #csp_completers_2017 comp
join users u on u.id = comp.user_id_student

union all

-- pct urm
select count(distinct case when urm = 1 then user_id_student else null end)::float / 
count(distinct case when urm in (0,1) then user_id_student else null end)::float value, 'Students who completed, % URM' metric
from #csp_completers_2017 comp
join users u on u.id = comp.user_id_student

union all

-- pct farm
select avg(case when pct_farm is null then null when pct_farm >= 0.5 then 1 else 0 end::float) value, 'Students who completed, % high needs' metric
from
(
select user_id_student, avg(case when total in (-1,0) then null when totfrl = -1 then null else totfrl::float / total end) pct_farm
from #csp_completers_2017 comp
join followers f on f.student_user_id = comp.user_id_student
join sections se on se.id = f.section_id
join users u on u.id = se.user_id
join school_infos si on si.id = u.school_info_id
JOIN public.bb_school_farm sf ON sf.ncessch = si.school_id
JOIN public.bb_school_population pop ON pop.ncessch = sf.ncessch
group by 1
)

union all

-- students completing one unit
select count(*) value, 'Students completing one unit but not the whole course' metric
from #single_unit_students

union all

select count(*) value, 'Teachers completing one unit but not the whole course' metric
from #single_unit_teachers

union all

-- PD'd teachers who began teaching
select count(*) value, 'PDd teachers who began teaching' metric
from
(
select tp.studio_person_id, count(distinct user_id_student) students
from #csp_2017_first_half fh
join users u on u.id = fh.user_id_teacher
join teacher_profiles tp on tp.studio_person_id = u.studio_person_id
where tp.studio_person_id not in (
select studio_person_id
from teacher_profiles
where (other_pd = 'nmsi' and pd is null)
)
group by 1
)
where students >= 5

union all

-- students who started with PD'd teacher (actual value in sheet was put in by hadi from unknown source)
select count(distinct user_id_student) value, 'Students with PDd teachers who started course' metric
from #csp_2017_first_half fh
join users u on u.id = fh.user_id_teacher
join teacher_profiles tp on tp.studio_person_id = u.studio_person_id
where tp.studio_person_id not in (
select studio_person_id
from teacher_profiles
where (other_pd = 'nmsi' and pd is null)
)

union all

select '% of students with PDd teachers who started at high needs schools' metric,
sum(case when pct_frl < 0.5 then 1 else 0 end)::float / sum(case when pct_frl is not null then 1 else 0 end) value
from
(
select user_id_student, case when total in (-1,0) then null when totfrl = -1 then null else totfrl::float / total end pct_frl
from #csp_2017_first_half fh
join users u on u.id = fh.user_id_teacher
join teacher_profiles tp on tp.studio_person_id = u.studio_person_id
join public.bb_nces_matches_cleaned mc on mc.studio_person_id = tp.studio_person_id
join public.bb_school_population scp on scp.ncessch::bigint = mc.id::bigint
join public.bb_school_farm sf on sf.ncessch::bigint = mc.id::bigint
where tp.studio_person_id not in (
select studio_person_id
from teacher_profiles
where (other_pd = 'nmsi' and pd is null)
)
)
group by 1

union all

-- PD'd teachers who completed the course
select count(*) value, 'PDd teachers who completed the course' metric
from #csp_completers_2017_teachers_pd

union all

-- # of students completing with trained teacher
select count(distinct fo.student_user_id) value, 'Students who completed with PDd teacher' metric
from sections se
join followers fo on fo.section_id = se.id
join users u on u.id = se.user_id
join teacher_profiles tp on tp.studio_person_id = u.studio_person_id
where fo.student_user_id in (select user_id_student from #csp_completers_2017)
and tp.studio_person_id not in (
select studio_person_id
from teacher_profiles
where (other_pd = 'nmsi' and pd is null)
)

union all

-- pct female, students completing with trained teacher
select count(distinct case when u_student.gender = 'f' then fo.student_user_id else null end)::float / 
count(distinct case when u_student.gender in ('m','f') then fo.student_user_id else null end)::float value, 
'Students who completed with PDd teacher, % female' metric
from sections se
join followers fo on fo.section_id = se.id
join users u on u.id = se.user_id
join teacher_profiles tp on tp.studio_person_id = u.studio_person_id
join users u_student on u_student.id = fo.student_user_id
where fo.student_user_id in (select user_id_student from #csp_completers_2017)
and tp.studio_person_id not in (
select studio_person_id
from teacher_profiles
where (other_pd = 'nmsi' and pd is null)
)

union all

-- pct urm, students completing with trained teacher
select count(distinct case when u_student.urm = 1 then fo.student_user_id else null end)::float / 
count(distinct case when u_student.urm in (0,1) then fo.student_user_id else null end)::float value,
'Students who completed with PDd teacher, % URM' metric
from sections se
join followers fo on fo.section_id = se.id
join users u on u.id = se.user_id
join teacher_profiles tp on tp.studio_person_id = u.studio_person_id
join users u_student on u_student.id = fo.student_user_id
where fo.student_user_id in (select user_id_student from #csp_completers_2017)
and tp.studio_person_id not in (
select studio_person_id
from teacher_profiles
where (other_pd = 'nmsi' and pd is null)
)

union all

select count(distinct sus.user_id_student) value, 'Students who took whole unit w/ trained teacher (but not whole course)' metric
from #single_unit_students sus
join followers f on f.student_user_id = sus.user_id_student
join sections se on se.id = f.section_id
join users u on u.id = se.user_id
join teacher_profiles tp on tp.studio_person_id = u.studio_person_id
where tp.studio_person_id not in (
select studio_person_id
from teacher_profiles
where (other_pd = 'nmsi' and pd is null)
)

union all

select count(distinct studio_person_id) value, 'Trained teachers who taught whole unit (but not whole course)' metric
from
(
select count(distinct sus.user_id_student) students, tp.studio_person_id
from #single_unit_students sus
join followers f on f.student_user_id = sus.user_id_student
join sections se on se.id = f.section_id
join users u on u.id = se.user_id
join teacher_profiles tp on tp.studio_person_id = u.studio_person_id
where tp.studio_person_id not in (
select studio_person_id
from teacher_profiles
where (other_pd = 'nmsi' and pd is null)
)
group by 2
)
where students >= 5
and studio_person_id not in (select * from #csp_completers_2017_teachers_pd);
