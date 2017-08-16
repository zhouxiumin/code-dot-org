import React, {Component, PropTypes} from 'react';
import Radium from 'radium';
import Button from '../Button';
import color from "../../util/color";

// If you want to include an image, you're probably looking for a ResourceCard.

const styles = {
  card: {
    overflow: 'hidden',
    position: 'relative',
    height: 250,
    width: 310,
    float: 'left',
    marginBottom: 20,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: color.border_gray,
    background: color.teal
  },
  title: {
    paddingLeft: 20,
    paddingRight: 10,
    paddingTop: 10,
    paddingBottom: 5,
    marginTop: 15,
    fontSize: 18,
    fontFamily:'"Gotham 4r", sans-serif',
    zIndex: 2,
    position: 'absolute',
    color: color.white,
    fontWeight: 'bold'
  },
  description: {
    paddingLeft: 20,
    paddingRight: 10,
    paddingTop: 10,
    paddingBottom: 5,
    marginTop: 50,
    fontSize: 14,
    lineHeight: "21px",
    fontFamily: '"Gotham 4r", sans-serif',
    position: 'absolute',
    zIndex: 2,
    width: 270,
    color: color.white
  },
  button: {
    marginLeft: 20,
    bottom: 20,
    position: 'absolute',
    zIndex: 2,
  },
  ltr: {
    float: 'left',
  },
  rtl: {
    float: 'right',
  },
};

class ToolCard extends Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    buttonText: PropTypes.string.isRequired,
    link: PropTypes.string.isRequired,
    isRtl: PropTypes.bool.isRequired
  };

  render() {

    const { title, description, buttonText, link, isRtl } = this.props;
    const localeStyle = isRtl ? styles.rtl : styles.ltr;

    return (
      <div style={[styles.card, localeStyle]}>
        <div style={[styles.title, localeStyle]}>
          {title}
        </div>
        <div style={[styles.description, localeStyle]}>
          {description}
        </div>
        <br/>
        <Button
          href={link}
          color={Button.ButtonColor.gray}
          text={buttonText}
          style={[styles.button]}
        />
      </div>
    );
  }
}

export default Radium(ToolCard);
