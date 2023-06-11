
const socket = io.connect('http://localhost:3000')

/* const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const source = audioCtx.createBufferSource();

// Conectando a fonte de áudio à saída do áudio
source.connect(audioCtx.destination);

// Enviando o sinal para o servidor
const playButton = document.getElementById('play');
const stopButton = document.getElementById('stop');

playButton.addEventListener('click', () => {
  socket.emit('play', { action: 'start' });
});

stopButton.addEventListener('click', () => {
  socket.emit('play', { action: 'stop' });
});

socket.on('play', (data) => {
  if (data.action === 'start') {
    // Iniciando a reprodução do áudio
    source.start(0);
  } else if (data.action === 'stop') {
    // Parando a reprodução do áudio
    source.stop();
  }
}); */

const listButton = document.getElementById('list');

listButton.addEventListener('click', () => {
  socket.emit('list items');
});


let availableMusics = []
let currentMusic = undefined

function initMusic(musicId) {
  currentMusic = availableMusics.find( m => m.id === musicId)
  const container = document.getElementById("music-container")
  container.textContent = currentMusic.name
  socket.emit('get track', { music: musicId, track: 0 });
}

function listMusics() {
  const container = document.getElementById("list-container")
  const newNodes = []
  availableMusics.forEach((msc) => {
    const li = document.createElement("li")
    li.textContent = msc.name
    li.onclick = () => initMusic(msc.id)
    newNodes.push(li)
  })
  container.append(...newNodes)
}

const audio = document.getElementById("audioPlayer");
audio.crossOrigin = "anonymous";

async function decodeAudio(data) {
  //const audioContext = new (window.AudioContext || window.webkitAudioContext)()

  const AudioContext = window.AudioContext || window.webkitAudioContext;
  const audioContext = new AudioContext();
  
  // Criar um buffer de áudio
  const audioData = data;
  
  // Decodificar o buffer de áudio
  audioContext.decodeAudioData(audioData, function(buffer) {
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    
    //audio.currentTime = partIndex * partSize;
    source.connect(audioContext.destination);
    
    source.start();
  });
  
  /* let context = new AudioContext()
  const audioToPlay = await context.decodeAudioData(data)
  console.log(audioToPlay)
  const audioBuffer = context.createBuffer(1, audioToPlay.length, 4 * 1000);
  audioBuffer.getChannelData(0).set(audioToPlay);

  const blob = new Blob([audioBuffer], { type: "audio/mp3" });
  const url = window.URL.createObjectURL(blob);
  const audioElement = document.querySelector("audio")
  audioElement.src = url;

  const source = context.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(context.destination);
  source.start(0);

  window.URL.revokeObjectURL(url); */
  
}

socket.on('items', (data) => {
  availableMusics = data
  console.log(data)
  listMusics()
})

socket.on('track', (data) => {
  console.log(data)
  decodeAudio(data)
})

socket.emit('list items');