import React, { PropTypes } from 'react';
import CollapsibleSection from './CollapsibleSection';
import CourseCard from './CourseCard';
import i18n from "@cdo/locale";

const StudentRecentCourses = React.createClass({
  propTypes: {
    courses: PropTypes.arrayOf(
      PropTypes.shape({
        courseName: React.PropTypes.string.isRequired,
        description: React.PropTypes.string.isRequired,
        image: React.PropTypes.string.isRequired,
        assignedSections: React.PropTypes.array.isRequired
      })
    ),
    showAllCoursesLink: React.PropTypes.bool.isRequired
  },

  render() {
    const { courses, showAllCoursesLink } = this.props;

    return (
      <CollapsibleSection
        header={i18n.courses()}
        linkText={i18n.viewAllCourses()}
        link="/courses"
        showLink={showAllCoursesLink}
      >
        {courses.length > 0 ? (
          courses.map((course, index) =>
            <CourseCard
              key={index}
              courseName={course.courseName}
              description={course.description}
              image={course.image}
              link={course.link}
              assignedSections={course.assignedSections}
            />
          )
        ) : (
          <div>This is where there should be the course options for not signed in.</div>
        )}
      </CollapsibleSection>
    );
  }
});

export default StudentRecentCourses;
