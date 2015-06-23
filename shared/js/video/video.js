require('./video.css');

window.onload = function() {
  var testImageAccess = require('../url_test/url_test.js');
  testImageAccess('https://www.youtube.com/favicon.ico?' + Math.random(),
    function(){ vjs(true);},
    function(){ vjs(false);}
  );
  function vjs(youtubeEnabled) {
    var techOrder = [];
    if(youtubeEnabled) {
      techOrder.push('youtube');
    }
    var html5_ok = !window.localStorage.getItem('videojs_html5_error');
    if(html5_ok) {
      techOrder.push('html5');
    }
    techOrder.push('flash');
    var videoJS = require('video.js/dist/video-js/video.novtt.js');
    if(youtubeEnabled) {
      videoJS.plugin('youtube', require('videojs-youtube'));
    }
    var vjs = videoJS(document.getElementById('video'), {
      techOrder: techOrder,
      ytcontrols: true,
      nativeControlsForTouch: true,
      'vtt.js': '/shared/js/video/build/vtt.js',
      flash: { swf: "/shared/misc/video/video-js.swf" }
    });
    vjs.ready(function() {
      document.getElementById('video').style.opacity = '1';
    });
    vjs.on('error', function(e) {
      console.log('Error:');
      var errorCode = vjs.error().code;
      if(errorCode == 4 || errorCode == 3) {
        // If html5 isn't working, fallback to Flash and reload
        window.localStorage.setItem('videojs_html5_error','1');
        window.location.reload();
      }
    });
  }
};
