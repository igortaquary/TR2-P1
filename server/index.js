
import { Server } from 'socket.io'
import fs from "fs"

const blockDuration = 30; // seconds

const musics = [
  {
    id: 10,
    name: "Mac Miller - Self Care",
    path: "assets/selfcare.mp3",
    duration: 5 * 60 + 47,
  },
  {
    id: 11,
    name: "Hungria Hip Hop - Chovendo Inimigo",
    path: "assets/hungriahiphop-chovendo-inimigo.mp3",
    duration: 2 * 60 + 40,
  },
  {
    id: 12,
    name: "Matuê - Antes",
    path: "assets/antes.mp3",
    duration: 2 * 60 + 49,
  }
]

const io = new Server(3000, {cors: { origin: "*" }});

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on("list items", async () => {
    console.log("on list items")
    socket.emit("items", musics )
  });

  socket.on('getTrack', async (data) => {
    console.log('getTrack')
    console.log(data)
    const music = musics.find(m => m.id === data.music)
    const part = data.track

    /* const tempFilePath = `temp/temp_${music.id}_${part}.mp3`;

    try {
      await splitAudioFile(music, tempFilePath, part);
      const audioData = fs.readFileSync(tempFilePath);
      fs.unlinkSync(tempFilePath);

      socket.emit('audioPart', { audioData, part });
    } catch (error) {
      console.error(error);
      socket.emit('error', 'Erro ao processar parte do áudio.');
    } */

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
});

io.on('disconnection', () => {
  console.log('A user disconnected');
})

/* function splitAudioFile(audio, outputFilePath, part) {

  return new Promise((resolve, reject) => {
    const writeStream = fs.createWriteStream(outputFilePath);

    fs.stat(audio.path, (err, stat) => {
      console.log(stat.size)
      const blockSize = Math.floor((stat.size / audio.duration) * blockDuration)
      
      fs.createReadStream(audio.path, { start: blockSize * part, end: blockSize * (part+1) })
      .on('error', reject)
      .pipe(writeStream)
      .on('finish', resolve)
      .on('error', reject);
    })
  })
} */
 
