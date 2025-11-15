var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var player;
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
    videoId: "rtYC2jx1LM0",
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
    }, 100);
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

function assembleList(list) {
    let count = 0;
    let namePos, composerPos, imagePos, yearPos, youtubePos;

    for (let songs of list) {
        if (count === 0){
            for (let i = 0; i < songs.length; i++) {
                if (songs[i] === "Name"){
                    namePos = i;
                }
                else if (songs[i] === "Composer(s)" || songs[i] === "Composer"){
                    composerPos = i;
                }
                else if (songs[i] === "Image"){
                    imagePos = i;
                }
                else if (songs[i] === "Year"){
                    yearPos = i;
                }
                else if (songs[i] === "Link" || songs[i] === "Youtube"){
                    youtubePos = i;
                }
            }
        }

        else {
            document.getElementById("queuebucket").innerHTML += `<div class="cell queuecard"> <div class="card"> <div class="card-content"> <div class = "columns"> <div class = "column"> <div class="media"> <div class="media-left"> <figure class="image"> <img class = "rawImage" src="` + songs[imagePos] + `" /> </figure> </div> <div class="media-content"> <p class="title is-6">` + songs[namePos] + `</p> <p class="subtitle is-6">` + songs[composerPos] + ` · ` + songs[yearPos] + `</p> </div> </div> </div> <div class = "column is-narrow"> <button onclick = "skipTo(`+ count + `)"><span class="material-symbols-outlined p-2">music_note</span></button> </div> </div> </div> </div> </div>`;
            if (count === 1){
                player.loadVideoById(songs[youtubePos].slice(songs[youtubePos].lastIndexOf('/') + 1), 0)
            }
        }

        count = count + 1;
    }
}

function loadCSV() {
    const fileInput = document.getElementById('csvFile');
    const file = fileInput.files[0];

    if (!file) {
        alert('Please select a CSV file.');
        return;
    }

    const reader = new FileReader();

    reader.onload = function (e) {
        const text = e.target.result;

        let rows = [];
        let row = [];
        let field = "";
        let insideQuotes = false;

        for (let i = 0; i < text.length; i++) {
            const c = text[i];

            if (c === '"') {
                // If we see two quotes in a row ("") → it's an escaped quote
                if (insideQuotes && text[i + 1] === '"') {
                    field += '"';
                    i++; // skip the second quote
                } else {
                    insideQuotes = !insideQuotes;
                }
            }
            else if (c === ',' && !insideQuotes) {
                // end of field
                row.push(field);
                field = "";
            }
            else if ((c === '\n' || c === '\r') && !insideQuotes) {
                // end of row
                if (field.length > 0 || row.length > 0) {
                    row.push(field);
                    rows.push(row);
                }
                row = [];
                field = "";
            }
            else {
                field += c;
            }
        }

        // push last line if not empty
        if (field.length > 0 || row.length > 0) {
            row.push(field);
            rows.push(row);
        }

        // rows is now a clean 2D array with no double quotes
        assembleList(rows);
    };

    reader.readAsText(file);
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

handle.onmousedown = bar.onmousedown;

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