function getYouTubeDiv(id, autoplay) {
  if(autoplay) {
    return getIframeDiv(id);
  }

  // The image+button overlay code.
  var imgUrl = 'https://i.ytimg.com/vi/' + id + '/hqdefault.jpg';

  // Replace the iframe with image+button code
  var div = document.createElement('div');
  div.id = 'youtubevid-' + id;
  div.className = 'youtube-outer';

  // IE8 'contain' approximation
  div.style['-ms-filter'] = "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='"+imgUrl+"', sizingMethod='scale')";
  div.style['filter'] = "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='"+imgUrl+"', sizingMethod='scale')";
  div.style['background-size'] = 'contain';

  div.style.width = '100%';
  div.style.height = '100%';
  div.style.margin = '0 auto';
  div.style['background-image'] = 'url(' + imgUrl + ')';

  var innerDiv = document.createElement('div');
  innerDiv.style.height = '100%';
  innerDiv.className = 'youtube-inner';

  var playDiv = document.createElement('div');
  playDiv.className = 'youtube-play';

  innerDiv.appendChild(playDiv);
  div.appendChild(innerDiv);
  div.onclick = function() {
    var div = document.getElementById("youtubevid-" + id);
    div.parentNode.replaceChild(getIframeDiv(id), div);
  };
  return div;
}

// Replace preview image of a video with it's iframe.
function getIframeDiv(id) {
  var code = '<iframe src="https://www.youtube.com/embed/' + id + '/?controls=2&iv_load_policy=3&rel=0&autohide=1&showinfo=0&autoplay=1&enablejsapi=1 frameborder=0 allowfullscreen="allowfullscreen" style="border:1px solid #ccc; width: 100%; height: 100%;" ></iframe>';
  var iframe = document.createElement('div');
  iframe.innerHTML = code;
  iframe = iframe.firstChild;
  return iframe;
}

module.exports = getYouTubeDiv;
