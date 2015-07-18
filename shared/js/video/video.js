require('./video.css');

window.onload = function() {
  var opts = window.videojsOpts;
  if(opts.fallbackOnly) {
    videoJSLoad(false);
  } else {
    var testImageAccess = require('../url_test/url_test.js');
    testImageAccess('https://www.youtube.com/favicon.ico?' + Math.random(),
      function(){ videoJSLoad(true);},
      function(){ videoJSLoad(false);}
    );
  }

  function videoJSLoad(youtubeEnabled) {
    var videoJS = require('video.js/dist/video-js/video.novtt.js');
    var techOrder = [];

    if(youtubeEnabled) {
      videoJS.plugin('youtube', require('videojs-youtube'));
      techOrder.push('youtube');
    }

    var html5_ok = !window.localStorage.getItem('videojs_html5_error');
    if(html5_ok) {
      techOrder.push('html5');
    }
    techOrder.push('flash');

    var videoContainer = document.getElementById('video-container');
    var video = document.getElementById('video') || document.createElement('video');
    videoDiv = document.createElement('div');
    videoDiv.appendChild(video);
    video.id = 'video';
    video.setAttribute('width', '100%');
    video.setAttribute('height', '100%');
    video.autoplay = opts.autoplay;
    video.className = 'video-js vjs-default-skin vjs-big-play-centered';
    video.controls = true;
    video.preload = 'auto';
    video.poster = opts.thumbnail;

    var vjs = videoJS(video, {
      techOrder: techOrder,
      //ytcontrols: true,
      nativeControlsForTouch: true,
      'vtt.js': '/shared/js/video/build/vtt.js',
      flash: { swf: "/shared/misc/video/video-js.swf" }
    });
    vjs.src(opts.src);

    var timeout = setTimeout(ready, 500);
    var called = false;
    function ready() {
      if(called) {
        return;
      }
      called = true;
      clearTimeout(timeout);
      videoContainer.appendChild(videoDiv);
    }
    vjs.ready(ready);

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
