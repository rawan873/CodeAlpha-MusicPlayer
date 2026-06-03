const trackList = [
    {
        title: "Retro Arcade Laser",
        artist: "8-Bit Oscillator",
        notes: [523.25, 783.99, 523.25, 1046.50], 
        type: "square",   
        speed: 180,       
        emoji: "👾"
    },
    {
        title: "Ambient Space Chime",
        artist: "Smooth Wave",
        notes: [440.00, 554.37, 659.25, 880.00], 
        type: "sine",     
        speed: 600,       
        emoji: "🔔"
    },
    {
        title: "Heavy Synth Bass",
        artist: "Analog Emulator",
        notes: [65.41, 73.42, 55.00, 48.99],     
        type: "sawtooth", 
        speed: 400,       
        emoji: "⚡"
    },
    {
        title: "80s Flute Pad",
        artist: "Digital Flute",
        notes: [329.63, 392.00, 440.00, 493.88], 
        type: "triangle", 
        speed: 500,      
        emoji: "🎹"
    }
];

let trackIndex = 0;
let isPlaying = false;
let synthInterval = null;
let audioCtx = null;

const playBtn = document.getElementById('play-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const trackArt = document.getElementById('track-art');
const trackTitle = document.getElementById('track-title');
const trackArtist = document.getElementById('track-artist');
const progressBar = document.getElementById('progress-bar');
const currentTimeDisplay = document.getElementById('current-time');
const totalDurationDisplay = document.getElementById('total-duration');
const volumeSlider = document.getElementById('volume-slider');
const playlistQueue = document.getElementById('playlist-queue');

function initPlayer() {
    buildPlaylistUI();
    loadTrack(trackIndex);
}

function loadTrack(index) {
    const track = trackList[index];
    
    trackTitle.innerText = track.title;
    trackArtist.innerText = track.artist;
    trackArt.innerText = track.emoji;
    
    progressBar.value = 0;
    currentTimeDisplay.innerText = "0:00";
    totalDurationDisplay.innerText = "0:04";

    updateActivePlaylistHighlight();
    
    if (isPlaying) {
        stopSynth();
        startSynth();
    }
}

function playTone(freq, duration, waveType) {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc.type = waveType; // 👈 Appoints the track's unique instrument wave type
    osc.frequency.value = freq;

    const volumePercent = volumeSlider.value / 100;
    
    // Adjust volume scaling dynamically depending on how loud the wave type inherently is
    let safeVolume = volumePercent * 0.15;
    if (waveType === 'sawtooth') safeVolume = volumePercent * 0.04; // Raw sawtooth waves are naturally loud
    if (waveType === 'sine') safeVolume = volumePercent * 0.3;      // Sine waves are inherently soft

    gainNode.gain.setValueAtTime(safeVolume, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + duration);
}

function startSynth() {
    isPlaying = true;
    playBtn.innerText = "⏸";
    trackArt.classList.add('spinning');
    
    const track = trackList[trackIndex];
    let noteStep = 0;
    
    // Play the very first note out immediately
    playTone(track.notes[noteStep], (track.speed / 1000) * 0.8, track.type);
    noteStep++;

    // Fire note triggers based on the track's custom speed attribute
    synthInterval = setInterval(() => {
        progressBar.value = (noteStep / track.notes.length) * 100;
        currentTimeDisplay.innerText = `0:0${Math.floor(noteStep * (track.speed / 1000))}`;
        
        if (noteStep >= track.notes.length) {
            clearInterval(synthInterval);
            nextTrack(); // Advance directly forward to the next index
            return;
        }

        playTone(track.notes[noteStep], (track.speed / 1000) * 0.8, track.type);
        noteStep++;
    }, track.speed);
}

function stopSynth() {
    clearInterval(synthInterval);
    trackArt.classList.remove('spinning');
    playBtn.innerText = "▶";
}

function buildPlaylistUI() {
    playlistQueue.innerHTML = "";
    trackList.forEach((track, i) => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${track.title}</span><span style="opacity:0.4; font-size:0.8rem;">${track.artist}</span>`;
        li.addEventListener('click', () => {
            trackIndex = i;
            isPlaying = true;
            loadTrack(trackIndex);
        });
        playlistQueue.appendChild(li);
    });
}

function updateActivePlaylistHighlight() {
    const items = playlistQueue.querySelectorAll('li');
    items.forEach((item, i) => {
        if (i === trackIndex) item.classList.add('active-track');
        else item.classList.remove('active-track');
    });
}

function togglePlay() {
    if (!isPlaying) {
        startSynth();
    } else {
        isPlaying = false;
        stopSynth();
    }
}

function prevTrack() {
    trackIndex = (trackIndex - 1 + trackList.length) % trackList.length;
    loadTrack(trackIndex);
}

function nextTrack() {
    trackIndex = (trackIndex + 1) % trackList.length;
    loadTrack(trackIndex);
}

playBtn.addEventListener('click', togglePlay);
prevBtn.addEventListener('click', prevTrack);
nextBtn.addEventListener('click', nextTrack);

initPlayer();