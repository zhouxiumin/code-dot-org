/**
 * A React component for our JavaScript debugger UI. Returns a connected component
 * so this can only be used in cases where we have a redux store.
 */

var React = require('react');
var connect = require('react-redux').connect;

var i18n = require('@cdo/locale');
var commonStyles = require('../commonStyles');
var styleConstants = require('../styleConstants');
var DebugWatch = require('./watchers/Watchers');
var PaneHeader = require('./PaneHeader');
var PaneSection = PaneHeader.PaneSection;
var PaneButton = PaneHeader.PaneButton;
var SpeedSlider = require('./SpeedSlider');
import {setStepSpeed} from '../redux/runState';

// Used in storybook only
import {Provider} from 'react-redux';
import {combineReducers, createStore} from 'redux';
import commonReducers from '@cdo/apps/redux/commonReducers';

var styles = {
  debugAreaHeader: {
    display: 'flex',
    top: styleConstants['resize-bar-width'],
    textAlign: 'center',
    lineHeight: '30px'
  },
  noPadding: {
    padding: 0
  },
  noUserSelect: {
    MozUserSelect: 'none',
    WebkitUserSelect: 'none',
    msUserSelect: 'none',
    userSelect: 'none',
  },
  showHideIcon: {
    marginLeft: 8,
    lineHeight: styleConstants['workspace-headers-height'] + 'px',
    fontSize: 18,
    ':hover': {
      cursor: 'pointer',
      color: 'white'
    }
  },
  showDebugWatchIcon: {
    margin: 0,
    marginLeft: 'auto',
    marginRight: 6,
    lineHeight: styleConstants['workspace-headers-height'] + 'px',
    fontSize: 18,
    ':hover': {
      cursor: 'pointer',
      color: 'white'
    }
  },
  watchersHeaderTextShowing: {
    margin: '0px 6px 0 auto',
  },
  watchersHeaderTextHidden: {
    flexGrow: 1,
    marginRight: 7
  },
  consoleHeaderText: {
    flexGrow: 1
  }
};

/**
 * The console for our debugger UI
 */
var DebugConsole = function (props) {
  var classes = 'debug-console';
  if (!props.debugButtons) {
    classes += ' no-commands';
  }
  if (!props.debugWatch) {
    classes += ' no-watch';
  }

  return (
    <div id="debug-console" className={classes}>
      <div id="debug-output" className="debug-output"/>
      <span className="debug-input-prompt">
        &gt;
      </span>
      <div contentEditable spellCheck="false" id="debug-input" className="debug-input"/>
    </div>
  );
};
DebugConsole.propTypes = {
  debugButtons: React.PropTypes.bool,
  debugWatch: React.PropTypes.bool,
};

/**
 * Buttons for stepping through code.
 */
var DebugButtons = function () {
  return (
    <div id="debug-commands" className="debug-commands">
      <div id="debug-buttons">
        {" "/* Explicitly insert whitespace so that this behaves like our ejs file*/}
        <button id="pauseButton" className="debugger_button">
          <img src="/blockly/media/1x1.gif" className="pause-btn icon21"/>
          {i18n.pause()}
        </button>
        {" "/* Explicitly insert whitespace so that this behaves like our ejs file*/}
        <button id="continueButton" className="debugger_button">
          <img src="/blockly/media/1x1.gif" className="continue-btn icon21"/>
          {i18n.continue()}
        </button>
        {" "/* Explicitly insert whitespace so that this behaves like our ejs file*/}
        <button id="stepOverButton" className="debugger_button">
          <img src="/blockly/media/1x1.gif" className="step-over-btn icon21"/>
          {i18n.stepOver()}
        </button>

        <button id="stepOutButton" className="debugger_button">
          <img src="/blockly/media/1x1.gif" className="step-out-btn icon21"/>
          {i18n.stepOut()}
        </button>
        {" "/* Explicitly insert whitespace so that this behaves like our ejs file*/}
        <button id="stepInButton" className="debugger_button">
          <img src="/blockly/media/1x1.gif" className="step-in-btn icon21"/>
          {i18n.stepIn()}
        </button>
      </div>
    </div>
  );
};

/**
 * The parent JsDebugger component.
 */
var JsDebugger = React.createClass({
  propTypes: {
    debugButtons: React.PropTypes.bool.isRequired,
    debugConsole: React.PropTypes.bool.isRequired,
    debugWatch: React.PropTypes.bool.isRequired,
    debugSlider: React.PropTypes.bool.isRequired,
    isDebuggerPaused: React.PropTypes.bool.isRequired,
    stepSpeed: React.PropTypes.number.isRequired,
    setStepSpeed: React.PropTypes.func.isRequired
  },

  getInitialState() {
    return {
      watchersHidden: false
    };
  },

  render() {
    var hasFocus = this.props.isDebuggerPaused;

    var sliderStyle = {
      marginLeft: this.props.debugButtons ? 5 : 45,
      marginRight: 5
    };

    const showWatchPane = this.props.debugWatch && !this.state.watchersHidden;
    return (
      <div id="debug-area">
        <div id="debugResizeBar" className="fa fa-ellipsis-h"></div>
        <PaneHeader
          id="debug-area-header"
          hasFocus={hasFocus}
          style={styles.debugAreaHeader}
        >
          <i id="show-hide-debug-icon" className="fa fa-chevron-circle-down" style={styles.showHideIcon}/>
          <span
            style={{...styles.noUserSelect, ...styles.consoleHeaderText}}
            className="header-text"
          >
            {i18n.debugConsoleHeader()}
          </span>
          {this.props.debugButtons &&
          <PaneSection id="debug-commands-header">
            <i id="running-spinner" style={commonStyles.hidden} className="fa fa-spinner fa-spin"/>
            <i id="paused-icon" style={commonStyles.hidden} className="fa fa-pause"/>
            <span
              style={styles.noUserSelect}
              className="header-text"
            >
              {i18n.debugCommandsHeaderWhenOpen()}
            </span>
          </PaneSection>
          }
          <PaneButton
            id="clear-console-header"
            iconClass="fa fa-eraser"
            label="Clear"
            headerHasFocus={hasFocus}
            isRtl={false}
          />
          {this.props.debugWatch &&
          <PaneSection
            id="debug-watch-header"
            onClick={() => {
              this.setState({watchersHidden: !this.state.watchersHidden});
            }}
            style={this.state.watchersHidden ? {
              borderLeft: 'none',
              textAlign: 'right',
              display: 'flex',
              flexGrow: 1
            } : {
              display: 'flex',
              flexGrow: 1
            }}
          >
            <span
              style={{...styles.noUserSelect, ...this.state.watchersHidden ? styles.watchersHeaderTextHidden : styles.watchersHeaderTextShowing}}
              className="header-text"
            >
              {this.state.watchersHidden ? 'Show Watch' : i18n.debugWatchHeader()}
            </span>
            <i
              id="hide-toolbox-icon"
              style={styles.showDebugWatchIcon}
              className={"fa " + (this.state.watchersHidden ? "fa-chevron-circle-left" : "fa-chevron-circle-right")}
            />
          </PaneSection>
          }
          {this.props.debugSlider && <SpeedSlider style={sliderStyle} hasFocus={hasFocus} value={this.props.stepSpeed} lineWidth={130} onChange={this.props.setStepSpeed}/>}
        </PaneHeader>
        {this.props.debugButtons && <DebugButtons/>}
        {this.props.debugConsole && <DebugConsole debugButtons={this.props.debugButtons} debugWatch={showWatchPane}/>}
        {showWatchPane && <DebugWatch debugButtons={this.props.debugButtons}/>}
      </div>
    );
  }
});

const ConnectedJsDebugger = connect(function propsFromStore(state) {
  return {
    debugButtons: state.pageConstants.showDebugButtons,
    debugConsole: state.pageConstants.showDebugConsole,
    debugWatch: state.pageConstants.showDebugWatch,
    debugSlider: state.pageConstants.showDebugSlider,
    isDebuggerPaused: state.runState.isDebuggerPaused,
    stepSpeed: state.runState.stepSpeed
  };
}, function propsFromDispatch(dispatch) {
  return {
    setStepSpeed: function (stepSpeed) {
      dispatch(setStepSpeed(stepSpeed));
    }
  };
})(JsDebugger);
module.exports = ConnectedJsDebugger;

if (BUILD_STYLEGUIDE) {
  JsDebugger.styleGuideExamples = storybook => {
    const storyTable = [];

    storyTable.push(
      {
        name: 'empty',
        story: () => (
          <JsDebugger />
        )
      });

    storyTable.push(
      {
        name: 'empty paused',
        story: () => (
          <JsDebugger isDebuggerPaused/>
        )
      });

    storyTable.push(
      {
        name: 'with debug buttons',
        story: () => (
          <JsDebugger debugButtons/>
        )
      });

    storyTable.push(
      {
        name: 'with debug console',
        story: () => (
          <div style={{height: 200}}>
            <JsDebugger debugConsole/>
          </div>
        )
      });

    const store = createStore(combineReducers(commonReducers));
    storyTable.push(
      {
        name: 'connected',
        story: () => (
          <Provider store={store}>
            <JsDebugger debugWatch />
          </Provider>
        )
      });

    storybook
      .storiesOf('JsDebugger', module)
      .addStoryTable(storyTable);
  };
}

