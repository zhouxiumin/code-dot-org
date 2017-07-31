import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/configuredChai';
import Sections from '@cdo/apps/templates/studioHomepages/RecentCourses';
import ContentContainer from '@cdo/apps/templates/ContentContainer';
// import SectionsTable from '@cdo/apps/templates/studioHomepages/SectionsTable';
// import JoinSection from './JoinSection';
// import JoinSectionNotifications from './JoinSectionNotifications';
import {SectionsSetUpMessage} from '@cdo/apps/templates/studioHomepages/SectionsSetUpMessage';
//
// const sections = [
//   {
//     name: "Period 1",
//     teacherName: "Ms. Frizzle",
//     linkToProgress: "https://code.org/teacher-dashboard#/sections/111111/progress",
//     assignedTitle: "Course 1",
//     linkToAssigned: "https://studio.code.org/s/course1",
//     numberOfStudents: 1,
//     linkToStudents: "https://code.org/teacher-dashboard#/sections/111111/manage",
//     code: "ABCDEF"
//   },
//   {
//     name: "Period 2",
//     teacherName: "Ms. Frizzle",
//     linkToProgress: "https://code.org/teacher-dashboard#/sections/222222/progress",
//     assignedTitle: "Course 2",
//     linkToAssigned: "https://studio.code.org/s/course2",
//     numberOfStudents: 2,
//     linkToStudents: "https://code.org/teacher-dashboard#/sections/222222/manage",
//     code: "EEBSKR"
//   },
// ];

describe('Sections', () => {
  describe('as a teacher', () => {
    it('shows a SectionsSetUpMessage when there are no sections', () => {
      const wrapper = shallow(
        <Sections
          sections={[]}
          codeOrgUrlPrefix = "http://code.org/"
          isRtl={false}
          isTeacher
          canLeave={false}
        />
      );
      expect(wrapper).to.containMatchingElement(
        <div>
          <ContentContainer
            heading=""
            linkText=""
            link=""
            showLink={true}
            isRtl={false}
            description=""
          >
            <SectionsSetUpMessage
              codeOrgUrlPrefix=""
              isRtl={false}
            />
          </ContentContainer>
        </div>
      );
    });
  });
});
