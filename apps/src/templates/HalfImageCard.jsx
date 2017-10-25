import React, {Component, PropTypes} from 'react';
import Radium from 'radium';
import color from '../util/color';

const styles = {
  card: {
    overflow: 'hidden',
    position: 'relative',
    width: 310,
    float: 'left',
    marginBottom: 10,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: color.border_gray,
    background: color.white,
    display: 'flex',
    flexFlow: 'wrap',
    ':hover': {
      background: color('#0074d9').lighten(0.2).hexString()
    }
  },
  image: {
    // position: 'absolute',
    width: 308,
    height: 200,
    backgroundColor: color.teal,
  },
  textbox: {
    // position: 'absolute',
    width: 310,
    height: 150,
    paddingTop: 20,
    paddingLeft: 20,
    paddingBottom: 20
  },
  title: {
    fontSize: 24,
    paddingBottom: 10,
    fontFamily:'"Gotham 4r", sans-serif',
    color: color.charcoal,
  },
  description: {
    fontSize: 14,
    lineHeight: "21px",
    fontFamily: '"Gotham 4r", sans-serif',
    color: color.charcoal,
    height: 80
  },
  ltr: {
    float: 'left',
  },
  rtl: {
    float: 'right',
  },
  rtlMargin: {
    marginRight: 160
  },
  ltrMargin: {
    marginRight: 0
  }
};

class HalfImageCard extends Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    linkText: PropTypes.string.isRequired,
    link: PropTypes.string.isRequired,
    image: PropTypes.string.isRequired,
    isRtl: PropTypes.bool.isRequired
  };

  render() {

    const { title, description, linkText, link, image, isRtl } = this.props;
    const localeStyle = isRtl ? styles.rtl : styles.ltr;
    const uncoverImage = isRtl ? styles.rtlMargin : styles.ltrMargin;

    const filenameToImgUrl = {
      "hourofcode": require('@cdo/static/resource_cards/hourofcode.png'),
      "hourofcode2": require('@cdo/static/resource_cards/hourofcode2.png'),
    };
    const imgSrc = filenameToImgUrl[image];

    return (
      <div style={[styles.card, localeStyle]}>
        <div style={[styles.textbox, localeStyle, uncoverImage]}>
          <div style={styles.title}>
            {title}
          </div>
          <div style={styles.description}>
            {description}
          </div>
          <br/>
        </div>
        <div style={styles.image}>
          .
          <img src={imgSrc}/>
        </div>
      </div>
    );
  }
}

export default Radium(HalfImageCard);
