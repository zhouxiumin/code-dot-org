import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import CongratsResources from '@cdo/apps/templates/CongratsResources';

$(document).ready(showCongratsResources);

function showCongratsResources() {
  ReactDOM.render (
    <CongratsResources/>,
    document.getElementById('congrats-resources')
  );
}
