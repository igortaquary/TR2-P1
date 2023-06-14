
const socket = io.connect('http://localhost:3000');

const audio = document.getElementById("audioPlayer");
audio.crossOrigin = "anonymous";

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
    li.textContent = msc.name + " " + Math.floor(msc.duration/60) + ":" + (msc.duration%60) 
    li.onclick = () => initMusic(msc.id)
    newNodes.push(li)
  })
  container.replaceChildren(...newNodes)
}

function listClients(myId, ids=[]) {
  const container = document.getElementById("clients-container")
  const newNodes = []
  const myli = document.createElement("li")
  myli.textContent = myId;
  ids.filter( id => id !== myId ).forEach((id) => {
    const li = document.createElement("li")
    li.textContent = id;
    //li.onclick = () => initMusic(msc.id)
    newNodes.push(li)
  })
  container.replaceChildren(myli, ...newNodes)
}

socket.on('items', (data) => {
  availableMusics = data
  listMusics()
})

socket.on('clients', (data) => {
  console.log(data)
  listClients(data.you, data.others)
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

audio.addEventListener('timeupdate', (ev) => {
  //console.log(ev)
  if(ev.target.duration - ev.target.currentTime < 15) {
    if(currentMusic.duration - ev.target.duration > 1) {
      requestAudioPart()
    }
  }
})