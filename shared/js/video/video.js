require('./video.css');

window.onload = function() {
  var testImageAccess = require('../url_test/url_test.js');
  testImageAccess('https://www.youtube.com/favicon.ico?' + Math.random(),
    function(){ vjs(true);},
    function(){ vjs(false);}
  );
  function vjs(youtubeEnabled) {
    var techOrder = youtubeEnabled ? ['youtube', 'html5', 'flash'] : ['html5', 'flash'];
    var videojs = require('video.js/dist/video-js/video.novtt.js');
    if(youtubeEnabled) {
      console.log('youtube enabled');
      yt = require('videojs-youtube');
      videojs.plugin('youtube', yt);
    }
    videojs('video', {
      techOrder: techOrder,
      ytcontrols: true
    });
  }
};
