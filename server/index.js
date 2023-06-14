
import { Server } from 'socket.io'
import fs from "fs"
import { musics } from './musics.js';

const io = new Server(3000, {cors: { origin: "*" }});

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on("listMusics", async () => {
    console.log("on list items")
    socket.emit("items", musics)
    socket.emit("clientId", socket.id)
  });

  socket.on("listClients", async () => {
    console.log("on list clients")
    const ids = (await io.fetchSockets()).map( sock => sock.id )
    io.emit("clients", ids)
  })

  socket.on('getTrack', async (data) => {
    console.log('getTrack')
    console.log(data)

    const blockDuration = 30; // seconds
    const music = musics.find(m => m.id === data.music)
    const part = data.track

    fs.stat(music.path, (err, stats) => {
      if (err) {
        console.error(err);
        return socket.emit('error', 'Erro ao acessar o arquivo de áudio.');
      }
      const blockSize = Math.floor((stats.size / music.duration) * blockDuration)
      
      const fileSize = stats.size;

      if (blockSize * part >= fileSize) {
        return socket.emit('error', 'Parte não encontrada.');
      }

      const stream = fs.createReadStream(music.path, { start: blockSize * part, end: (blockSize-1) * (part+1) });

      const chunks = [];
      stream.on('data', (chunk) => {
        chunks.push(chunk);
      });

      stream.on('end', () => {
        const audioData = Buffer.concat(chunks);

        socket.emit('audioPart', { audioData, part });
      });
    })
  })

  socket.on('disconnect', async () => {
    console.log('disconnected');
    const ids = (await io.fetchSockets()).map( sock => sock.id )
    io.emit("clients", ids)
  });

  socket.on('playRemote', ({music, client}) => {
    console.log("playRemote => " + {music, client})
    io.sockets.sockets.get(client)
    .emit("play", music)
    //io.sockets.socket(client)
  })
});

io.on('disconnection', () => {
  console.log('A user disconnected');
})
