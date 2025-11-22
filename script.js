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

function toggleableMusicQueue(throughButton){
    const div1 = document.getElementById('queuecolumn');
    const div2 = document.getElementById('visualcolumn');

    if (throughButton){
        if (div1.style.display === 'none' || div1.style.display === '') {
            div1.style.display = 'flex';
            div2.style.display = 'none';
        } else {
            div1.style.display = 'none';
            div2.style.display = 'block';
        }
    } else {
        div1.style.display = '';
        div2.style.display = '';
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
        this.activeId = 1;
        this.altIndex = 0;

        let count = 0;

        for (let songs of this.list) {
            if (count === 0) {
                for (let i = 0; i < songs.length; i++) {
                    if (songs[i] === "Name") this.namePos = i;
                    else if (songs[i] === "Composer(s)" || songs[i] === "Composer") this.composerPos = i;
                    else if (songs[i] === "Image") this.imagePos = i;
                    else if (songs[i] === "Year") this.yearPos = i;
                    else if (songs[i] === "Link" || songs[i] === "Youtube") this.youtubePos = i;
                    else if (songs[i] === "Alternatives") this.alternativePos = i;
                }
            } else {
                let injectHTML = "";

                if (removeWhitespace(songs[this.youtubePos])) {
                    injectHTML += `<span class="material-symbols-outlined musicButton" onclick="skipTo(${count},0)">music_note</span>`;
                }

                let rawAlt = songs[this.alternativePos] || "";
                let altList = [];

                if (typeof rawAlt === "string" && rawAlt.trim().length > 0) {
                    altList = rawAlt.split(",").map(v => v.trim()).filter(Boolean);
                }

                this.list[count][this.alternativePos] = altList;

                for (let i = 1; i <= altList.length; i++) {
                    injectHTML += `<span class="material-symbols-outlined musicButton" onclick="skipTo(${count},${i})">replace_audio</span>`;
                }

                document.getElementById("queuebucket").innerHTML += `
                <div class="cell">
                    <div id="song${count}" class="card">
                        <div class="card-content">
                            <div class="columns is-mobile">
                                <div class="column">
                                    <div class="media">
                                        <div class="media-left">
                                            <figure class="image is-48x48">
                                                <img class="rawimage" src="${songs[this.imagePos]}" />
                                            </figure>
                                        </div>
                                        <div class="media-content">
                                            <div class="text-container">
                                                <p class="title is-6">${songs[this.namePos]}</p>
                                                <p class="subtitle is-6">${songs[this.composerPos]} · ${songs[this.yearPos]}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="column is-narrow">
                                    <div>${injectHTML}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`;
            }
            count++;
        }

        this.update();
    }

    removeCurrentlyPlaying() {
        const el = document.getElementById("song" + this.activeId);
        if (!el) return;
        el.classList.remove("currentlyPlaying");
        el.classList.remove("currentlyPlayingAlt");
    }

    clampActiveId() {
        this.activeId = Math.max(1, Math.min(this.activeId, this.list.length - 1));
    }

    clampAltIndex() {
        const alts = this.list[this.activeId][this.alternativePos] || [];
        this.altIndex = Math.max(0, Math.min(this.altIndex, alts.length));
    }

    nextSong() {
        this.removeCurrentlyPlaying();
        const alts = this.list[this.activeId][this.alternativePos] || [];
        if (this.altIndex < alts.length) this.altIndex++;
        else { this.activeId++; this.altIndex = 0; }
        this.clampActiveId();
        this.clampAltIndex();
        this.update();
    }

    prevSong() {
        this.removeCurrentlyPlaying();
        const alts = this.list[this.activeId][this.alternativePos] || [];
        if (this.altIndex > 0) this.altIndex--;
        else {
            this.activeId--;
            this.clampActiveId();
            const newAlts = this.list[this.activeId][this.alternativePos] || [];
            this.altIndex = newAlts.length;
        }
        this.clampActiveId();
        this.clampAltIndex();
        this.update();
    }

    skipTo(entryIndex, altIndex) {
        this.removeCurrentlyPlaying();
        this.activeId = Number(entryIndex);
        this.altIndex = Number(altIndex);
        this.clampActiveId();
        this.clampAltIndex();
        this.update();
    }

    update() {
        this.clampActiveId();
        this.clampAltIndex();

        const row = this.list[this.activeId];
        const alts = row[this.alternativePos] || [];

        let vid = this.altIndex === 0 ? row[this.youtubePos] : alts[this.altIndex - 1];
        const videoId = vid ? vid.slice(vid.lastIndexOf("/") + 1) : null;

        if (videoId) player.loadVideoById(videoId, 0);

        const el = document.getElementById("song" + this.activeId);
        if (el) el.classList.add(this.altIndex === 0 ? "currentlyPlaying" : "currentlyPlayingAlt");

        if (document.getElementById("toggleableVisibility").innerHTML === "visibility_off") {
            this.updateTextObfuscation();
        } else {
            this.updateText();
        }
    }

    updateText() {
        let injectMetadata = ""

        if (removeWhitespace(this.list[this.activeId][this.namePos])){
            injectMetadata += "<b>" + this.list[this.activeId][this.namePos] + "</b>"
        }

        if (removeWhitespace(this.list[this.activeId][this.namePos]) && removeWhitespace(this.list[this.activeId][this.composerPos])){
            injectMetadata += " · ";
        }

        if (removeWhitespace(this.list[this.activeId][this.composerPos])){
            injectMetadata += this.list[this.activeId][this.composerPos]
        }

        if ((removeWhitespace(this.list[this.activeId][this.composerPos]) && (removeWhitespace(this.list[this.activeId][this.yearPos])) || (removeWhitespace(this.list[this.activeId][this.namePos]) && removeWhitespace(this.list[this.activeId][this.yearPos])))){
            injectMetadata += " · ";
        }

        if (removeWhitespace(this.list[this.activeId][this.yearPos])){
            injectMetadata += this.list[this.activeId][this.yearPos]
        }

        document.getElementById("musicMetadata").innerHTML = injectMetadata;
    }

    updateTextObfuscation() {
        let injectMetadata = ""
        if (removeWhitespace(this.list[this.activeId][this.namePos])){
            injectMetadata += toZhuyin(this.list[this.activeId][this.namePos])
        }

        if (removeWhitespace(this.list[this.activeId][this.namePos]) && removeWhitespace(this.list[this.activeId][this.composerPos])){
            injectMetadata += " · ";
        }

        if (removeWhitespace(this.list[this.activeId][this.composerPos])){
            injectMetadata += toZhuyin(this.list[this.activeId][this.composerPos])
        }

        if ((removeWhitespace(this.list[this.activeId][this.composerPos]) && (removeWhitespace(this.list[this.activeId][this.yearPos])) || (removeWhitespace(this.list[this.activeId][this.namePos]) && removeWhitespace(this.list[this.activeId][this.yearPos])))){
            injectMetadata += " · ";
        }

        if (removeWhitespace(this.list[this.activeId][this.yearPos])){
            injectMetadata += toZhuyin(this.list[this.activeId][this.yearPos])
        }

        document.getElementById("musicMetadata").innerHTML = injectMetadata;
    }
}

function nextSong(){
    music.nextSong();
}

function prevSong(){
    music.prevSong();
}

function skipTo(entryIndex, altIndex){
    music.skipTo(entryIndex, altIndex);
}


function removeWhitespace(input) {
    inputString = String(input);
    return inputString.replace(/\s/g, "");
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
                if (insideQuotes && text[i + 1] === '"') {
                    field += '"';
                    i++;
                } else {
                    insideQuotes = !insideQuotes;
                }
            }
            else if (c === ',' && !insideQuotes) {
                row.push(field);
                field = "";
            }
            else if ((c === '\n' || c === '\r') && !insideQuotes) {
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

        if (field.length > 0 || row.length > 0) {
            row.push(field);
            rows.push(row);
        }

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

let duration = 30;
let currentTime = 0;
let dragging = false;

const bar = document.getElementById("bar");
const progress = document.getElementById("progress");
const handle = document.getElementById("handle");

function update() {
    const pct = (currentTime / duration) * 100;
    progress.style.width = pct + "%";
    handle.style.left = pct + "%";
}

function setPosition(seconds) {
    if (dragging) return;
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

function beginDrag(e) {
    dragging = true;
    moveDrag(e);
    document.addEventListener("mousemove", moveDrag);
    document.addEventListener("mouseup", endDrag);
}

function moveDrag(e) {
    const rect = bar.getBoundingClientRect();
    let x = (e.clientX - rect.left) / rect.width;
    x = Math.max(0, Math.min(1, x));
    currentTime = Math.round(x * duration);
    update();
}

function endDrag() {
    dragging = false;
    document.removeEventListener("mousemove", moveDrag);
    document.removeEventListener("mouseup", endDrag);
    const t = Math.round(player.getCurrentTime());
    if (t !== currentTime) player.seekTo(currentTime, true);
}

bar.addEventListener("mousedown", beginDrag);
handle.addEventListener("mousedown", e => { e.stopPropagation(); beginDrag(e); });

bar.addEventListener("click", e => {
    if (dragging) return;
    const x = e.offsetX / bar.clientWidth;
    const newTime = Math.round(x * duration);
    if (newTime !== Math.round(player.getCurrentTime())) {
        currentTime = newTime;
        update();
        player.seekTo(newTime, true);
    }
});


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

function adjustVideoHeight() {
    const queue = document.querySelector('#mediacenter');
    const video = document.querySelector('.videoContainer');

    if (!queue || !video) return;

    let queueHeight = queue.offsetHeight + 68;
    let viewportHeight = window.innerHeight;

    document.documentElement.style.setProperty('--mobilevideoheight', (viewportHeight - queueHeight) + 'px');

    toggleableMusicQueue(false);
}

adjustVideoHeight();

window.addEventListener('resize', adjustVideoHeight);
window.addEventListener('orientationchange', adjustVideoHeight);
