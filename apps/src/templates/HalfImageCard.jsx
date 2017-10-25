import React, {Component, PropTypes} from 'react';
import Radium from 'radium';
import color from '../util/color';

const styles = {
  card: {
    overflow: 'hidden',
    position: 'relative',
    height: 250,
    width: '48%',
    float: 'left',
    marginBottom: 20,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: color.border_gray,
    background: color.white,
    marginBottom: 20,
    display: 'flex',
    flexFlow: 'wrap',
  },
  image: {
    position: 'absolute',
  },
  textbox: {
    // position: 'absolute',
    width: '50%',
    padding: 20
  },
  title: {
    fontSize: 24,
    paddingBottom: 10,
    fontFamily:'"Gotham 4r", sans-serif',
    color: color.charcoal,
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden'
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
        <div style={styles.image}>
          <img src={imgSrc}/>
        </div>
        <div style={[styles.textbox, localeStyle, uncoverImage]}>
          <div style={styles.title}>
            {title}
          </div>
          <div style={styles.description}>
            {description}
          </div>
          <br/>
        </div>
      </div>
    );
  }
}

export default Radium(HalfImageCard);
