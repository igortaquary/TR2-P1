
import { Server } from 'socket.io'
import fs from "fs"

const musics = [
  {
    id: 10,
    name: "Mac Miller - Self Care",
    path: "assets/selfcare.mp3",
  },
  {
    id: 11,
    name: "Hungria Hip Hop - Chovendo Inimigo",
    path: "assets/hungriahiphop-chovendo-inimigo.mp3"
  }
]

const streams = musics.map((music) => {
  const file = fs.readFileSync(music.path)
  return {
    id: music.id,
    stream: file.buffer
  }
})

const io = new Server(3000, {cors: { origin: "*" }});

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on("list items", async () => {
    console.log("on list items")
    io.emit("items", musics.map( m=>({id: m.id, name: m.name})))
  });

  socket.on('get track', (data) => {
    console.log('get track')
    console.log(data)
    io.emit("track", streams.find(s => s.id === data.music).stream)
    //io.emit("track", streams.find(s => s.id === data.music).stream.slice(data.track, data.track + 30))
  })
});

io.on('disconnection', () => {
  console.log('A user disconnected');
})

 
