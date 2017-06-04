// load jQuery within the bundled 'defer' js script,
// so it doesn't block DOM building and page rendering.
// Any script with 'defer: true' or inline after DOMContentLoaded event
// will have access to the jQuery globals.
import jQuery from 'jquery';
window.$ = window.jQuery = jQuery;

import 'details-element-polyfill';

import 'lazysizes';
import 'lazysizes/plugins/unveilhooks/ls.unveilhooks';
import {isUnsupportedBrowser} from '@cdo/apps/util/browser-detector';
import {initHamburger} from '@cdo/apps/hamburger/hamburger';
import {loadVideos} from '@cdo/apps/util/loadVideos';

// Prevent filtered errors from being passed to New Relic.
 if (window.newrelic) {
   window.newrelic.setErrorHandler(function (err) {
     // Remove errors from unsupportenewrelicnd IE versions
     return !!isUnsupportedBrowser();
   });
 }

document.addEventListener('DOMContentLoaded', function () {
  if (isUnsupportedBrowser()) {
    $("#warning-banner").show();
  }
});

initHamburger();
window.loadVideos = loadVideos;
