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
    player.setVolume(100);
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
    } else if (state === 0){
        button = document.getElementById("toggleableRepeat");

        if (button.innerHTML == "repeat"){
            nextSong();
        } 
        else if (button.innerHTML == "repeat_one"){
            player.playVideo();
        }

    }
    else {
        button.textContent = "pause";
    }
}

function toggleablePause(){
    button = document.getElementById("toggleablePause");
    
    if (button.innerHTML == "play_arrow"){
        player.pauseVideo();
    } 
    else if (button.innerHTML == "pause"){
        player.playVideo();
    }
}

function toggleableVisibility(){
    button = document.getElementById("toggleableVisibility");
    
    if (button.innerHTML == "visibility"){
        button.textContent = "visibility_off";
        document.getElementById('player').style.filter = 'blur(50px)'; 
        document.documentElement.style.setProperty('--blur-amount', '4px');
        obfuscatePage();
        music.updateTextObfuscation();
    } 
    else if (button.innerHTML == "visibility_off"){
        button.textContent = "visibility";
        document.getElementById('player').style.filter = 'none';
        document.documentElement.style.setProperty('--blur-amount', '0.3px');
        deobfuscatePage();
        music.updateText();
    }
}

function toggleableRepeat(){
    button = document.getElementById("toggleableRepeat");

    if (button.innerHTML == "repeat"){
        button.textContent = "repeat_one";
    } 
    else if (button.innerHTML == "repeat_one"){
        button.textContent = "repeat";
    }
}

function toggleableVolume(){
    button = document.getElementById("toggleableVolume");
    if (button.innerHTML == "volume_up"){
        button.innerHTML = "volume_off";
        player.setVolume(0)
    } else if (button.innerHTML == "volume_off"){
        button.innerHTML = "volume_mute";
        player.setVolume(25)
    } else if (button.innerHTML == "volume_mute"){
        button.innerHTML = "volume_down";
        player.setVolume(50)
    } else if (button.innerHTML == "volume_down"){
        button.innerHTML = "volume_up";
        player.setVolume(100)
    }
}

let music;
class Music {
    constructor(list) {
        this.list = list;
        this.currentId = 1;

        let count = 0;

        for (let songs of this.list) {
            if (count === 0){
                for (let i = 0; i < songs.length; i++) {
                    if (songs[i] === "Name"){
                        this.namePos = i;
                    }
                    else if (songs[i] === "Composer(s)" || songs[i] === "Composer"){
                        this.composerPos = i;
                    }
                    else if (songs[i] === "Image"){
                        this.imagePos = i;
                    }
                    else if (songs[i] === "Year"){
                        this.yearPos = i;
                    }
                    else if (songs[i] === "Link" || songs[i] === "Youtube"){
                        this.youtubePos = i;
                    }
                    else if (songs[i] === "Alternatives"){
                        this.alternativePos = i;
                    }
                }
            }

            else {
                let injectHTML = "";
                songs[this.alternativePos].split("\n").forEach(line => {
                    const url = line.trim();
                    if (!url) return;

                    injectHTML += `<span class="material-symbols-outlined musicButton" onclick="playMusic('`+ url + `', ` + count + `)">replace_audio</span>`;
                });

                document.getElementById("queuebucket").innerHTML += `<div class="cell"> <div id = "song` + count + `" class="card"> <div class="card-content"> <div class = "columns"> <div class = "column"> <div class="media"> <div class="media-left"> <figure class="image is-48x48"> <img class = "rawimage" src="` + songs[this.imagePos] + `" /> </figure> </div> <div class="media-content"> <div class="text-container"><p class="title is-6">` + songs[this.namePos] + `</p> <p class="subtitle is-6">` + songs[this.composerPos] + ` · ` + songs[this.yearPos] + `</p></div> </div> </div> </div> <div class = "column is-narrow"> <div> <span class="material-symbols-outlined musicButton" onclick = "skipTo(`+ count +`)">music_note</span> `+ injectHTML + ` </div> </div> </div> </div> </div> </div>`;
                
                if (count === 1){
                    this.update()
                }
            }

            count = count + 1;
        }
    }

    nextSong(){
        this.removeCurrentlyPlaying()
        this.currentId += 1;
        this.update()
    }

    prevSong(){
        this.removeCurrentlyPlaying()
        this.currentId -= 1;
        this.update()
    }

    skipTo(num){
        this.removeCurrentlyPlaying()
        this.currentId = num;
        this.update()
    }

    skipToAlt(num, url){
        this.removeCurrentlyPlaying();
        this.currentId = num;
        this.updateAlt(url);
    }

    removeCurrentlyPlaying(){
        document.getElementById("song" + this.currentId).classList.remove('currentlyPlaying');
        document.getElementById("song" + this.currentId).classList.remove('currentlyPlayingAlt');
    }

    update(){
        player.loadVideoById(this.list[this.currentId][this.youtubePos].slice(this.list[this.currentId][this.youtubePos].lastIndexOf('/') + 1), 0);
        document.getElementById("song" + this.currentId).classList.add('currentlyPlaying');
        if (document.getElementById("toggleableVisibility").innerHTML == "visibility_off"){
            this.updateTextObfuscation()
        } else {
            this.updateText()
        }
    }

    updateAlt(url){
        player.loadVideoById(url.slice(url.lastIndexOf('/') + 1), 0);
        document.getElementById("song" + this.currentId).classList.add('currentlyPlayingAlt');
        if (document.getElementById("toggleableVisibility").innerHTML == "visibility_off"){
            this.updateTextObfuscation()
        } else {
            this.updateText()
        }
    }

    updateText(){
        document.getElementById("music-title").textContent  = this.list[this.currentId][this.namePos];
        document.getElementById("music-composer").textContent  = this.list[this.currentId][this.composerPos];
        document.getElementById("music-year").textContent  = this.list[this.currentId][this.yearPos];
    }

    updateTextObfuscation(){
        document.getElementById("music-title").textContent = toZhuyin(this.list[this.currentId][this.namePos]);
        document.getElementById("music-composer").textContent = toZhuyin(this.list[this.currentId][this.composerPos]);
        document.getElementById("music-year").textContent = toZhuyin(this.list[this.currentId][this.yearPos]);
    }
} 

function nextSong(){
    music.nextSong();
}

function prevSong(){
    music.prevSong();
}

function skipTo(num){
    music.skipTo(num);
}

function playMusic(url, num){
    music.skipToAlt(num, url);
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
        music = new Music(rows);
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

const map = {
    "ch": "ㄔ", "sh": "ㄕ", "th": "ㄘ", "ng": "ㄫ",
    "b": "ㄅ", "c": "ㄠ", "d": "ㄉ", "f": "ㄈ", "g": "ㄍ",
    "h": "ㄏ", "j": "ㄐ", "k": "ㄎ", "l": "ㄌ", "m": "ㄇ",
    "n": "ㄓ", "p": "ㄆ", "q": "ㄩ", "r": "ㄖ", "s": "ㄙ",
    "t": "ㄊ", "v": "ㄪ", "w": "ㄨ", "x": "ㆲ", "y": "ㄬ", "z": "ㄗ",
    "a": "ㄡ", "e": "ㄝ", "i": "ㄧ", "o": "ㄛ", "u": "ㄦ",
    "0": "ロ", "1": "チ", "2": "ニ", "3": "サ", "4": "シ",
    "5": "ヨ", "6": "ク", "7": "ナ", "8": "ハ", "9": "ウ"
};

const digraphs = ["ch","sh","th","ng"];
const regex = new RegExp(`(${digraphs.join("|")}|.)`, "gi");

function flattenDiacritics(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function toZhuyin(text) {
    const flattened = flattenDiacritics(text);
    return flattened.replace(regex, m => map[m.toLowerCase()] || m);
}

const originalMap = new WeakMap();

function obfuscatePage() {
    function walk(node) {
        if (node.nodeType === Node.TEXT_NODE && (!node.parentNode.classList || !node.parentNode.classList.contains("material-symbols-outlined"))) {
            if (!originalMap.has(node)) originalMap.set(node, node.textContent);
                node.textContent = toZhuyin(originalMap.get(node));
            } else {
            node.childNodes.forEach(walk);
        }
    }
    walk(document.body);
}

function deobfuscatePage() {
    function walk(node) {
        if (node.nodeType === Node.TEXT_NODE && (!node.parentNode.classList || !node.parentNode.classList.contains("material-symbols-outlined"))) {
        if (originalMap.has(node)) node.textContent = originalMap.get(node);
        } else {
        node.childNodes.forEach(walk);
        }
    }
    walk(document.body);
}
