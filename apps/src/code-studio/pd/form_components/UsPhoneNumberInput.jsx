import React, {PropTypes} from 'react';
import FieldGroup from './FieldGroup';

const PHONE_NUMBER_REGEX = /(\()?(\(?\d{1,3})?(\) ?)?(\d{1,3})?(-| )?(\d{1,4})?/;

export default class UsPhoneNumberInput extends React.Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    value: PropTypes.string,
    validationState: PropTypes.string,
    errorMessage: PropTypes.string,
    required: PropTypes.bool,
    onChange: PropTypes.func
  };

  constructor(props) {
    super(props);

    this.state = {
      value: this.props.value
    };
  }

  static isValid(value) {
    return /^\d{10}$/.exec(value);
  }

  handleChange = (change) => {
    const phoneNumber = this.coercePhoneNumber(change[this.props.name]);
    this.setState({
      value: phoneNumber
    });

    const phoneNumberDigits = this.toJustNumbers(phoneNumber);
    if (this.props.onChange && phoneNumberDigits !== this.toJustNumbers(this.props.value)) {
      this.props.onChange({
        [this.props.name]: phoneNumberDigits
      });
    }
  };

  coercePhoneNumber = (value) => {
    const match = PHONE_NUMBER_REGEX.exec(value);
    let phoneNumber = "";
    if (match) {
      if (match[1] && !match[2]) {
        phoneNumber = match[1];
      } else if (match[2]) {
        phoneNumber = `(${match[2]}`;
        if (match[3] && !match[4]) {
          phoneNumber += match[3];
        } else if (match[4]) {
          phoneNumber += `) ${match[4]}`;
          if (match[5] && !match[6]) {
            phoneNumber += "-";
          } else if (match[6]) {
            phoneNumber += `-${match[6]}`;
          }
        }
      }
    }

    return phoneNumber;
  };

  toJustNumbers = (value) => value ? value.replace(/[^\d]/g, '') : null;

  render() {

    const {
      name,
      label,
      validationState,
      errorMessage,
      required,
      // pull value and onChange so they don't get included in ...props
      value, onChange, // eslint-disable-line no-unused-vars
      ...props
    } = this.props;

    return (
      <div>
        <FieldGroup
          key={name}
          id={name}
          type="text"
          label={label}
          validationState={validationState}
          errorMessage={errorMessage}
          onChange={this.handleChange}
          value={this.state.value || ''}
          required={required}
          placeholder="(xxx) xxx-xxxx"
          {...props}
        />
      </div>
    );
  }
}
