var applabConstants = require('./constants');
var commonStyles = require('../commonStyles');
var ProtectedStatefulDiv = require('../templates/ProtectedStatefulDiv');

var BoardVisualization = React.createClass({
  render: function () {
    var appWidth = applabConstants.APP_WIDTH;
    var appHeight = applabConstants.APP_HEIGHT - applabConstants.FOOTER_HEIGHT;
    return (
      <div style={{background: 'blue', width: appWidth + 'px', height: appHeight + 'px'}}/>
    );
  }
});

module.exports = BoardVisualization;
