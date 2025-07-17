const socket = io('http://localhost:5000');
const start = document.getElementById('startBtn');
const stop = document.getElementById('stopBtn');
const language = document.getElementById('language');
const container = document.getElementById('translationContainer');
// socket.binaryType = "arraybuffer";

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

socket.on('connect', () => {
  console.log('Connected to backend')
});

socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);
});

socket.on('translated', (data) => {
  const floatArray = new Float32Array(data);
  const wavBlob = float32ToWav16bit(floatArray);
  const url = URL.createObjectURL(wavBlob);
  create_translated_div(url);
});

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
        const blob = new Blob(chunks, { type: 'audio/webm' });
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

function create_translated_div(url) {
  const audio = document.createElement('audio');
  audio.classList.add('translatedAudio');
  audio.src = url;
  audio.controls = true;
  audio.autoplay = true;
  container.appendChild(audio);
}

function float32ToWav16bit(float32Array) {
  const sampleRate = 16000;
  const numChannels = 1;
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const wavHeaderSize = 44;
  const dataSize = float32Array.length * bytesPerSample;

  const buffer = new ArrayBuffer(wavHeaderSize + dataSize);
  const view = new DataView(buffer);

  // RIFF header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, 'WAVE');

  // fmt subchunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);

  // data subchunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  // Write 16-bit PCM data
  let offset = 44;
  for (let i = 0; i < float32Array.length; i++, offset += 2) {
    let s = Math.max(-1, Math.min(1, float32Array[i])); // Clamp
    view.setInt16(offset, s * 0x7FFF, true); // Scale and write as int16
  }

  return new Blob([buffer], { type: 'audio/wav' });

  function writeString(view, offset, str) {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  }
}
