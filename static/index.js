const socket = io('http://localhost:5000');
const start = document.getElementById('startBtn');
const stop = document.getElementById('stopBtn');
const language = document.getElementById('language');

socket.on('connect', () => {
  console.log('Connected to backend')
});

socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);
});

const languageCodes = [
  "afr", "amh", "arb", "ary", "arz", "asm", "ast", "azj", "bel", "ben",
  "bos", "bul", "cat", "ceb", "ces", "ckb", "cmn", "cmn_Hant", "cym", "dan",
  "deu", "ell", "eng", "est", "eus", "fin", "fra", "fuv", "gaz", "gle",
  "glg", "guj", "heb", "hin", "hrv", "hun", "hye", "ibo", "ind", "isl",
  "ita", "jav", "jpn", "kam", "kan", "kat", "kaz", "kea", "khk", "khm",
  "kir", "kor", "lao", "lit", "ltz", "lug", "luo", "lvs", "mai", "mal",
  "mar", "mkd", "mlt", "mni", "mya", "nld", "nno", "nob", "npi", "nya",
  "oci", "ory", "pan", "pbt", "pes", "pol", "por", "ron", "rus", "slk",
  "slv", "sna", "snd", "som", "spa", "srp", "swe", "swh", "tam", "tel",
  "tgk", "tgl", "tha", "tur", "ukr", "urd", "uzn", "vie", "xho", "yor",
  "yue", "zlm", "zsm", "zul"
];

let mediaRecorder;
let chunks = [];

// Start recording the audio
start.addEventListener('click', (event) => {
  event.preventDefault();
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then((stream) => {
      mediaRecorder = new MediaRecorder(stream);

      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        chunks = []
        stream.getTracks().forEach(track => track.stop());
        if (!languageCodes.includes(language.value)) {
          alert('DO NOT CHANGE THE LANGUAGE CODE.');
        } else if (blob.size >= 2 * 1024 * 1024) {
          alert('Do not exceed 2MB');
        } else {
          socket.emit('audio', { audio: blob, code: language.value });
        }
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
stop.addEventListener('click', (event) => {
  event.preventDefault();
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
    start.disabled = false;
    stop.disabled = true;
  }
});