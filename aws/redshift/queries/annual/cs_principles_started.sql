-- Distinct teacher-student combinations who started CSP in the first half of 2017-18 school year
drop table if exists #csp_first_half;
create temp table #csp_first_half as
select distinct se.user_id user_id_teacher, us.user_id user_id_student
from user_scripts us
join dashboard_production.users u on u.id = us.user_id
left join followers fo on fo.student_user_id = us.user_id
left join sections se on se.id = fo.section_id
join scripts sc on sc.id = us.script_id
where sc.name in ('csp1','csp2','csp3','csp3-research-mxghyt','csp4','csp5','csp-explore','csp-create')
and (u.deleted_at is null or u.deleted_at::date >= '2018-01-01') -- added for consistency with facebook reporting
and us.started_at between '2017-08-01' and '2017-12-31' -- moved to august 1st for 2017-18 reporting for consistency with facebook reporting
and u.user_type = 'student'
group by 1,2;

-- teachers who started
select count(*) value, 'Teachers who started' metric
from
(
select user_id_teacher, count(distinct user_id_student) students
from #csp_first_half
group by 1
)
where students >= 5

union all

-- Extrapolates the # of schools Code.org is being taught in
-- by dividing the number of teachers teaching
-- by the ratio of the number of teachers who provided school information (count(school_id))
-- to the number of distinct schools of those teachers (count(distinct school_id))
select count(distinct user_id_teacher)::float / (count(school_id)::float / count(distinct school_id)) value,
'# of schools, extrapolated' metric
from
(
select user_id_teacher, u.school_info_id, si.school_id, count(distinct user_id_student) students
from #csp_first_half fh
join users u on u.id = fh.user_id_teacher
left join school_infos si on si.id = u.school_info_id
group by 1,2,3
)
where students >= 5

union all

-- students who started
select count(distinct user_id_student) value, 'Students who started' metric
from #csp_first_half

union all

-- pct female, students who started
select count(distinct case when u.gender = 'f' then user_id_student else null end)::float / 
count(distinct case when u.gender in ('m','f') then user_id_student else null end)::float value, 'Students who started, % female' metric 
from #csp_first_half fh
join users u on u.id = fh.user_id_student

union all

-- pct urm, students who started
select count(distinct case when u.urm = 1 then user_id_student else null end)::float / 
count(distinct case when u.urm in (0,1) then user_id_student else null end)::float value, 'Students who started, % URM' metric
from #csp_first_half fh
join users u on u.id = fh.user_id_student;
