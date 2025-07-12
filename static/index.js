const socket = io('http://localhost:5000');
const start = document.getElementById('startBtn');
const stop = document.getElementById('stopBtn');
const audioPlayer = document.getElementById('audioPlayer');

socket.on('connect', () => {
    console.log('Connected to backend')
});

let mediaRecorder;
let chunks = [];

// Start recording the audio
start.addEventListener('click', () => {
    navigator.mediaDevices.getUserMedia({audio:true})
    .then((stream) => {
        mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.ondataavailable = (event) => {
            chunks.push(event.data);
        };
    mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, {type: 'audio/wav'});
        chunks = []
    };
    mediaRecorder.start();
    start.disabled = true;
    stop.disabled = false;
    })
    .catch((err) => {
        console.error(`${err.name}: ${err.message}`)
    });
});

// Stop recording the audio
stopBtn.addEventListener('click', () => {
  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
    // Disable the stop button and enable the start button for the next recording
    startBtn.disabled = false;
    stopBtn.disabled = true;
  }
});
