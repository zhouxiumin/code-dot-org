// This Webpack-bundled content runs after DOMContentLoaded.
// TODO rename to theme_common_body_after.js

import 'details-element-polyfill';

window.lazySizesConfig = window.lazySizesConfig || {};
window.lazySizesConfig.init = false;
import * as lazySizes from 'lazysizes';
import 'lazysizes/plugins/unveilhooks/ls.unveilhooks';
document.addEventListener('DOMContentLoaded', function () {
  lazySizes.init();
  if (isUnsupportedBrowser()) {
    $("#warning-banner").show();
  }
});

import {isUnsupportedBrowser} from '@cdo/apps/util/browser-detector';

// Prevent filtered errors from being passed to New Relic.
 if (window.newrelic) {
   window.newrelic.setErrorHandler(function (err) {
     // Remove errors from unsupportenewrelicnd IE versions
     return !!isUnsupportedBrowser();
   });
 }

import {initHamburger} from '@cdo/apps/hamburger/hamburger';
initHamburger();

import {loadVideos} from '@cdo/apps/util/loadVideos';
window.loadVideos = loadVideos;
