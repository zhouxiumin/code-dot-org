import React, { PropTypes, Component } from 'react';
import CourseBlocksStudentGradeBands from './studioHomepages/CourseBlocksStudentGradeBands';
import { LocalClassActionBlock } from './studioHomepages/TwoColumnActionBlock';
import Responsive from '../responsive';

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
