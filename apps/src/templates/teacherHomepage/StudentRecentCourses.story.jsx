import React from 'react';
import StudentRecentCourses from './StudentRecentCourses';

export default storybook => {
  return storybook
    .storiesOf('StudentRecentCourses', module)
    .addStoryTable([
      {
        name: "Recent Courses - no courses yet",
        description: "If the student does not have any recent courses, they should see options of courses to try similar to the options presented to users who don't have accounts yet..",
        story: () => (
          <StudentRecentCourses
            courses={[]}
            showAllCoursesLink={true}
          />
        )
      },
      {
        name: 'Recent Courses - 1 course ',
        description: `Collapsible section that holds Recent Courses when the student has tried or is assigned only 1 course.`,
        story: () => (
          <StudentRecentCourses
            courses= {[{
              courseName: "Play Lab",
              description: "Create a story or make a game with Play Lab!",
              link: "https://code.org/playlab",
              image:"photo source",
              assignedSections: ["Section 1"]
            }]}
            showAllCoursesLink={true}
          />
        )
      },
    ]);
};
