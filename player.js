var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var player;
function onYouTubeIframeAPIReady(id = "1lxNtsxdcgg") {
    player = new YT.Player('player', {
    videoId: id,
    playerVars: {
        'playsinline': 1
    },
    events: {
        'onReady': onPlayerReady
    }
    });
}

function onPlayerReady(event) {
    event.target.playVideo();
}