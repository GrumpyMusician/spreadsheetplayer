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

function onPlayerReady(event) {
    event.target.playVideo();
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

        const CSV = quotedLines.join('\n');

        console.log(CSV);
    };

    reader.readAsText(file);
    } else {
    alert('Please select a CSV file.');
    }
}