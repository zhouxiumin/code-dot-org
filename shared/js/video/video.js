require('./video.css');

window.onload = function() {
  var testImageAccess = require('../url_test/url_test.js');
  testImageAccess('https://www.youtube.com/favicon.ico?' + Math.random(),
    function(){ vjs(true);},
    function(){ vjs(false);}
  );
  function vjs(youtubeEnabled) {
    var techOrder = youtubeEnabled ? ['youtube', 'html5', 'flash'] : ['html5', 'flash'];
    var videoJS = require('video.js/dist/video-js/video.novtt.js');
    if(youtubeEnabled) {
      videoJS.plugin('youtube', require('videojs-youtube'));
    }
    videoJS(document.getElementById('video'), {
      techOrder: techOrder,
      ytcontrols: true,
      'vtt.js': '/shared/js/video/build/vtt.js'
    }).ready(function() {
      document.getElementById('video').style.visibility = 'visible';
    });
  }
};
