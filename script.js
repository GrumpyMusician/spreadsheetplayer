var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var player;
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
    videoId: "HeQX2HjkcNo",
    playerVars: {
        'playsinline': 1,
        'controls': 0
    },
    events: {
        'onReady': onPlayerReady,
        'onStateChange': onPlayerStateChange
    }
    });
}

function clock() {
    timeTotal = player.getDuration();
    timeEllapsed = player.getCurrentTime();

    document.getElementById("timestamp").innerHTML =
        toHMS(timeEllapsed) + "/" + toHMS(timeTotal);
    
    if (dragging) return;

    setDuration(timeTotal);
    setPosition(timeEllapsed);

    
}


function onPlayerReady(event) {
    setTimeout(() => {
        event.target.playVideo();
    }, 50);
    setInterval(clock, 100);
}

function onPlayerStateChange(event){
    button = document.getElementById("toggleablePause")
    state = player.getPlayerState();

    if (state === 1){ //running
        button.textContent = "play_arrow";
    }
    else {
        button.textContent = "pause";
    }
}

function toggleablePause(){
    button = document.getElementById("toggleablePause");
    
    if (button.innerHTML == "play_arrow"){
        button.textContent = "pause";
        player.pauseVideo();
    } 
    else if (button.innerHTML == "pause"){
        button.textContent = "play_arrow";
        player.playVideo();
    }
}

function toggleableVisibility(){
    button = document.getElementById("toggleableVisibility");
    
    if (button.innerHTML == "visibility"){
        button.textContent = "visibility_off";
        document.getElementById('player').style.filter = 'blur(50px)'; 
    } 
    else if (button.innerHTML == "visibility_off"){
        button.textContent = "visibility";
        document.getElementById('player').style.filter = 'none'; 
    }
}

var CSV;
function loadCSV() {
    const fileInput = document.getElementById('csvFile');
    const file = fileInput.files[0];

    if (file) {
    const reader = new FileReader();

    reader.onload = function(e) {
        const csvData = e.target.result;

        // Split into lines, removing empty ones
        const lines = csvData.split(/\r?\n/).filter(line => line.trim().length > 0);

        // Reformat with all fields quoted
        const quotedLines = lines.map(line => {
        // Match fields correctly (handles commas within quotes)
        const fields = line.match(/(".*?"|[^",\r\n]+)(?=\s*,|\s*$)/g);
        if (!fields) return '';

        // Wrap every field in quotes and escape inner quotes
        return fields.map(field => {
            let clean = field.replace(/^"|"$/g, ''); // remove existing outer quotes
            clean = clean.replace(/"/g, '""');       // escape internal quotes
            return `"${clean}"`;
        }).join(',');
        });

        CSV = quotedLines.join('\n');
    };

    reader.readAsText(file);
    } else {
    alert('Please select a CSV file.');
    }
}

function toHMS(totalSeconds) {
    totalSeconds = Number(totalSeconds);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);

    const hDisplay = hours > 0 ? String(hours).padStart(2, '0') + ':' : '';
    const mDisplay = String(minutes).padStart(2, '0') + ':';
    const sDisplay = String(seconds).padStart(2, '0');
    return hDisplay + mDisplay + sDisplay;
}

function toSec(hms) {
    const parts = hms.split(':').map(Number);
    if (parts.length === 3) {
        // hh:mm:ss
        return parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
        // mm:ss
        return parts[0] * 60 + parts[1];
    } else if (parts.length === 1) {
        // ss
        return parts[0];
    } else {
        throw new Error("Invalid time format");
    }
}

let duration = 30; // in seconds
const bar = document.getElementById("bar");
const progress = document.getElementById("progress");
const handle = document.getElementById("handle");
let currentTime = 0; // in seconds
let dragging = false;

function update() {
    const pct = (currentTime / duration) * 100;
    progress.style.width = pct + "%";
    handle.style.left = pct + "%";
}

function setPosition(seconds) {
    let v = Math.round(Number(seconds));
    if (isNaN(v)) return;
    currentTime = Math.max(0, Math.min(duration, v));
    update();
}

function getPosition() {
    return currentTime;
}

function setDuration(seconds) {
    let d = Math.round(Number(seconds));
    if (isNaN(d) || d <= 0) return;
    duration = d;
    currentTime = Math.min(currentTime, duration);
    update();
}

bar.onclick = e => {
    if (dragging) return;
    const x = e.offsetX / bar.clientWidth;
    setPosition(Math.round(x * duration));
    player.seekTo(currentTime, true);
};

bar.onmousedown = () => {
    dragging = true;

    document.onmousemove = e => {
        const rect = bar.getBoundingClientRect();
        let x = (e.clientX - rect.left) / rect.width;
        x = Math.max(0, Math.min(1, x));
        setPosition(Math.round(x * duration));
    };

    document.onmouseup = () => {
        dragging = false;
        document.onmousemove = null;
        player.seekTo(currentTime, true);
    };
};
