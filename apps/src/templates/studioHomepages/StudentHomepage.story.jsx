import React from 'react';
import StudentHomepage from './StudentHomepage';

const sections = [
  {
    name: "Algebra Period 1",
    teacherName: "Ms. Frizzle",
    linkToProgress: "to Progress tab",
    assignedTitle: "CS in Algebra",
    linkToAssigned: "to Course",
    numberOfStudents: 14,
    linkToStudents: "to Manage Students tab",
    sectionCode: "ABCDEF"
  },
  {
    name: "Algebra Period 2",
    teacherName: "Ms. Frizzle",
    linkToProgress: "to Progress tab",
    assignedTitle: "CS in Algebra",
    linkToAssigned: "to Course",
    numberOfStudents: 19,
    linkToStudents: "to Manage Students tab",
    sectionCode: "EEB206"
  },
  {
    name: "Period 3",
    teacherName: "Ms. Frizzle",
    linkToProgress: "to Progress tab",
    assignedTitle: "Course 4",
    linkToAssigned: "to Course",
    numberOfStudents: 22,
    linkToStudents: "to Manage Students tab",
    sectionCode: "HPRWHG"
  },
];

const courses = [
  {
    name: "CSP Unit 2",
    description: "Explore how more complex digital information is represented and manipulated through computation and visualization",
    link: "https://curriculum.code.org/csp/unit2/",
  },
  {
    name: "CSP Unit 3",
    description: "Explore how more complex digital information is represented and manipulated through computation and visualization",
    link: "https://curriculum.code.org/csp/unit3/",
  },
  {
    name: "CSP Unit 4",
    description: "Explore how more complex digital information is represented and manipulated through computation and visualization",
    link: "https://curriculum.code.org/csp/unit4/",
  },
  {
    name: "CSP Unit 5",
    description: "Explore how more complex digital information is represented and manipulated through computation and visualization",
    link: "https://curriculum.code.org/csp/unit5/",
  },
  {
    name: "CSP Unit 6",
    description: "Explore how more complex digital information is represented and manipulated through computation and visualization",
    link: "https://curriculum.code.org/csp/unit6/",
  },
  {
    name: "CSP Unit 7",
    description: "Explore how more complex digital information is represented and manipulated through computation and visualization",
    link: "https://curriculum.code.org/csp/unit7/",
  },
];

const studentTopCourse = {
  isRtl: {false},
  assignableName: "Course 1",
  lessonName: "Lesson 3: Learn to drag and drop",
  linkToOverview: "http://localhost-studio.code.org:3000/s/course1",
  linkToLesson: "http://localhost-studio.code.org:3000/s/course1/stage/3/puzzle/1"
};

export default storybook => {
  return storybook
    .storiesOf('StudentHomepage', module)
    .addStoryTable([
      {
        name: 'Student Homepage - no courses, no sections',
        description: 'Student Homepage - student does not have course progress, nor are they part of a section yet.',
        story: () => (
          <StudentHomepage
            sections={[]}
            courses={[]}
            codeOrgUrlPrefix="http://localhost:3000/"
            isRtl={false}
            canLeave={false}
          />
        )
      },
      {
        name: 'Student Homepage - 1 course, sections',
        description: 'Student Homepage - student does not have course progress, nor are they part of a section yet.',
        story: () => (
          <StudentHomepage
            sections={sections}
            courses={[]}
            codeOrgUrlPrefix="http://localhost:3000/"
            isRtl={false}
            canLeave={false}
            studentTopCourse={studentTopCourse}
          />
        )
      },
      {
        name: 'Student Homepage - 3 courses, sections',
        description: 'Student Homepage - student does not have course progress, nor are they part of a section yet.',
        story: () => (
          <StudentHomepage
            sections={sections}
            courses={courses.slice(0,2)}
            codeOrgUrlPrefix="http://localhost:3000/"
            isRtl={false}
            canLeave={false}
            studentTopCourse={studentTopCourse}
          />
        )
      },
      {
        name: 'Student Homepage - 6 courses, sections',
        description: 'Student Homepage - student does not have course progress, nor are they part of a section yet.',
        story: () => (
          <StudentHomepage
            sections={sections}
            courses={courses}
            codeOrgUrlPrefix="http://localhost:3000/"
            isRtl={false}
            canLeave={false}
            studentTopCourse={studentTopCourse}
          />
        )
      },
      {
        name: 'Student Homepage - courses, can leave sections',
        description: 'Student Homepage - student does not have course progress, nor are they part of a section yet.',
        story: () => (
          <StudentHomepage
            sections={sections}
            courses={courses}
            codeOrgUrlPrefix="http://localhost:3000/"
            isRtl={false}
            canLeave={true}
            studentTopCourse={studentTopCourse}
          />
        )
      },
    ]);
};
