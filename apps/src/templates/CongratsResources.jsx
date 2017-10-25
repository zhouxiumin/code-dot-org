import React, { PropTypes, Component } from 'react';
import CourseBlocksStudentGradeBands from './studioHomepages/CourseBlocksStudentGradeBands';
import HalfImageCard from './HalfImageCard';
import ContentContainer from './ContentContainer';
import { LocalClassActionBlock } from './studioHomepages/TwoColumnActionBlock';
import Responsive from '../responsive';
import i18n from "@cdo/locale";
import {pegasus} from '@cdo/apps/lib/util/urlHelpers';
import styleConstants from '../styleConstants';

const contentWidth = styleConstants['content-width'];

const styles = {
  container: {
    width: contentWidth,
    display: "flex",
    justifyContent: "space-between",
    flexWrap: 'wrap'
  },
};

export default class CongratsResources extends Component {
  constructor(props) {
    super(props);
    this.responsive = new Responsive();
  }

  static propTypes = {
    isRtl: PropTypes.bool,
    tutorialType: PropTypes.oneOf(['oldMinecraft', 'newMinecraft', 'applab'])
  };

  render() {

    return (
      <div>
        <h1>Students: Continue Learning Beyond an Hour</h1>
        <HalfImageCard
          title="CS Fundamentals Express"
          description={i18n.professionalLearningDescription()}
          image="professional-learning"
          buttonText={i18n.learnMore()}
          link="/my-professional-learning"
          isRtl={false}
        />
        <HalfImageCard
          title="AppLab Tutorial"
          description={i18n.professionalLearningDescription()}
          image="professional-learning"
          buttonText={i18n.learnMore()}
          link="/my-professional-learning"
          isRtl={false}
        />
        <CourseBlocksStudentGradeBands
          isRtl={false}
          responsive={this.responsive}
          showLink={false}
          showHeading={false}
          showDescription={false}
        />
        <LocalClassActionBlock
          isRtl={false}
          responsive={this.responsive}
          showHeading={false}
        />
        <h1>Teachers: Bring Computer Science to Your Classroom</h1>
      </div>
    );
  }
}
