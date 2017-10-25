import React, {Component, PropTypes} from 'react';
import CourseBlocksGradeBands from './CourseBlocksGradeBands';
import Responsive from '../../responsive';
import ContentContainer from '../ContentContainer';
import i18n from "@cdo/locale";

class CourseBlocksStudentGradeBands extends Component {
  static propTypes = {
    isRtl: PropTypes.bool.isRequired,
    responsive: PropTypes.instanceOf(Responsive).isRequired,
    showLink: PropTypes.bool.isRequired,
    showHeading: PropTypes.bool.isRequired,
    showDescription: PropTypes.bool.isRequired
  };

  cards = [
    {
      heading: i18n.courseBlocksGradeBandsK5(),
      description: i18n.courseBlocksGradeBandsK5Description(),
      path: '/student/elementary'
    },
    {
      heading: i18n.courseBlocksGradeBands612(),
      description: i18n.courseBlocksGradeBands612Description(),
      path: '/student/middle-high'
    },
    {
      heading: i18n.courseBlocksGradeBandsUniversity(),
      description: i18n.courseBlocksGradeBandsUniversityDescription(),
      path: '/student/university'
    }
  ];

  render() {
    const {showLink, showHeading, showDescription} = this.props;
    const link = showLink ? '/home/#recent-courses' : '';
    const heading = showHeading ? i18n.courseBlocksGradeBandsContainerHeading() : '';
    const description = showDescription ? i18n.courseBlocksGradeBandsContainerDescription() : '';
    return (
      <ContentContainer
        link={link}
        linkText={i18n.viewMyRecentCourses()}
        heading={heading}
        description={description}
        isRtl={this.props.isRtl}
        responsive={this.props.responsive}
      >
        <CourseBlocksGradeBands
          cards={this.cards}
          isRtl={this.props.isRtl}
          responsive={this.props.responsive}
        />
      </ContentContainer>
    );
  }
}

export default CourseBlocksStudentGradeBands;
