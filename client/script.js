const host = new URLSearchParams(window.location.search).get("server") || "http://localhost"
const port = "3000"
const socket = io.connect(host + ":" + port);

const audio = document.getElementById("audioPlayer");
audio.crossOrigin = "anonymous";

let clientId;

let availableMusics = []
let currentMusic = undefined

let sourceBuffer = null;
let mediaSource = null;
let loadingBuffer = false;
const partSize = 30;

socket.on('connect', () => {
  socket.emit('listMusics');
  socket.emit('listClients');
});

function initMusic(musicId) {
  currentMusic = availableMusics.find( m => m.id === musicId)
  const container = document.getElementById("music-container")
  container.textContent = currentMusic.name

  sourceBuffer = null;
  mediaSource = null;
  loadingBuffer = false;

  socket.emit('getTrack', { music: musicId, track: 0 });
}

function listMusics() {
  const container = document.getElementById("list-container")
  const newNodes = []
  availableMusics.forEach((msc) => {
    const li = document.createElement("li")
    li.textContent = msc.id + " - " + msc.name + ". " + durationToText(msc.duration) 
    li.onclick = () => initMusic(msc.id)
    newNodes.push(li)
  })
  container.replaceChildren(...newNodes)
}

function listClients(ids=[]) {
  const container = document.getElementById("clients-container")
  const newNodes = []

  ids.filter( id => id !== clientId ).forEach((id) => {
    const li = document.createElement("li")
    li.textContent = id;
    li.onclick = () => selectRemote(id)
    newNodes.push(li)
  })
  container.replaceChildren(...newNodes)
}

socket.on('clientId', (id) => {
  console.log(id)
  clientId = id
  const userNode = document.getElementById("user")
  userNode.textContent = id;
})

socket.on('items', (data) => {
  availableMusics = data
  listMusics()
})

socket.on('clients', (data) => {
  console.log(data)
  listClients(data)
})

socket.on('play', (musicId) => {
  console.log("play " + musicId)
  initMusic(Number(musicId))
})

socket.on('audioPart', (data) => {
  console.log(data)
  const audioData = new Uint8Array(data.audioData);

  if (!mediaSource) {
    mediaSource = new MediaSource();
    audio.src = URL.createObjectURL(mediaSource);

    mediaSource.addEventListener('sourceopen', () => {
      sourceBuffer = mediaSource.addSourceBuffer('audio/mpeg');
      sourceBuffer.addEventListener('updateend', () => {
        if (!sourceBuffer.updating && mediaSource.readyState === 'open') {
          mediaSource.endOfStream();
          //mediaSource.duration = currentMusic.duration;
          loadingBuffer = false
        }
      });
      sourceBuffer.appendBuffer(audioData);
    });
  } else {
    if (!sourceBuffer.updating) {
      sourceBuffer.appendBuffer(audioData);
      loadingBuffer = false
    } else {
      sourceBuffer.addEventListener('updateend', () => {
        if (!sourceBuffer.updating && mediaSource.readyState === 'open') {
          mediaSource.endOfStream();
          //mediaSource.duration = currentMusic.duration;
          loadingBuffer = false
        }
      });
      sourceBuffer.appendBuffer(audioData);
    }
  }
  
  currentMusic.part = data.part
})

function requestAudioPart() {
  if(!loadingBuffer) {
    loadingBuffer = true
    console.log("requestAudioPart")
    socket.emit('getTrack', {music: currentMusic.id, track: Math.floor(currentMusic.part+1)});
  } else {
    console.log("loadingBuffer")
  }
}

function selectRemote(id) {
  const mscId = Number(window.prompt("Digite o ID da música a ser tocada no cliente remoto " + id))
  console.log(mscId)
  if(availableMusics.findIndex(m => m.id === mscId) === -1) {
    window.alert("Número da música inválido")
  } else if(mscId) {
    socket.emit('playRemote', {music: mscId, client: id})
  }
}

audio.addEventListener('timeupdate', (ev) => {
  //console.log(ev)
  if(ev.target.duration - ev.target.currentTime < 15) {
    if(currentMusic.duration - ev.target.duration > 1) {
      requestAudioPart()
    }
  }
})

function durationToText(duration) {
  const minutes = Math.floor(duration/60)
  const seconds = (duration%60)

  return (minutes < 10 ? "0" : "") + minutes + ":" + (seconds < 10 ? "0" : "") + seconds
}