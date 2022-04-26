const { default: makeWASocket, useSingleFileAuthState, DisconnectReason, fetchLatestBaileysVersion, generateWAMessageFromContent } = require("@adiwajshing/baileys")
const { connectionFileName } = require("./config/configFile")
const { state, saveState } = useSingleFileAuthState(connectionFileName())
const { core } = require('./lib')
const express = require("express");
const cors = require("cors");
const request = require("request");
const got = require("got");
const zc = require("secret/api")
const fs = require("fs")


const app = express();

app.use(cors());
app.use(express.json());


exports.createConnection = new Promise((resolve, reject) => {
    try {
        const startSock = async () => {
            const { version } = await fetchLatestBaileysVersion()
            const sock = makeWASocket({
				version, 
				printQRInTerminal: true, 
				auth: state,
				getMessage: async key =>{
					return {
						conversation: 'Reconnecting....'
					}
				}
				})
            sock.ev.on('connection.update', (update) => {
                const { connection, lastDisconnect } = update
                if (connection === 'close')
                    if(lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut){
                        startSock() 
						console.log('Error: Koneksi Terputus')
					} else{
						console.log('Error: Koneksi Terputus')
					}
            })
            sock.ev.on('creds.update', saveState)
            if (sock.user) resolve(sock)

            sock.ev.on('messages.upsert', async m => await core(sock, m))
    sock.ev.on('group-participants.update', async (anu) => {
        console.log(anu)
        try {
            let metadata = await sock.groupMetadata(anu.id)
            let participants = anu.participants
            for (let num of participants) {
                // Get Profile Picture User
                try {
                    ppuser = await sock.profilePictureUrl(num, 'image')
                } catch {
                    ppuser = './assets/pp.jpg'
                }

                // Get Profile Picture Group
                try {
                    ppgroup = await sock.profilePictureUrl(anu.id, 'image')
                } catch {
                    ppgroup = './assets/pp.jpg'
                }

                if (anu.action == 'add') {
                    sock.sendMessage(anu.id, { image: { url: ppuser }, contextInfo: { mentionedJid: [num] }, caption: `Halo @${num.split("@")[0]} Selamat Datang di Grup *${metadata.subject}*` })
                } else if (anu.action == 'remove') {
                    sock.sendMessage(anu.id, { image: { url: ppuser }, contextInfo: { mentionedJid: [num] }, caption: `Sayonara @${num.split("@")[0]}` })
                }
            }
        } catch (err) {
            console.log(err)
        }
    })


         
       
        }
        startSock()
    } catch (e) { reject(e) }
})

 //WEB SERVER



app.get("/genshin", (req, res) => {
  zerochan('Genshin+Impact', 99, res);
});
app.get("/honkai", (req, res) => {
  zerochan('Houkai+3rd', 99, res);
});
app.get("/arknights", (req, res) => {
  zerochan('Arknights', 99, res);
});
app.get("/megumikatou", (req, res) => {
  zerochan('Katou+Megumi', 23, res);
});
app.get("/", (req, res) => {
    res.sendFile('index.html', {root: __dirname })
});



async function zerochan(charname, length, res) {
  zc.getSearch(charname, Math.floor(Math.random() * length) + 1).then(async (img) => {
      const num = Math.floor(Math.random() * 23) + 1;
      if (img[num]?.image) {
        const images = img[num].image;
        request({
          url: images,
          encoding: null
        }, 
        (err, resp, buffer) => {
          if (!err && resp.statusCode === 200){
            res.set("Content-Type", "image/jpeg");
            res.send(resp.body);
          } else {
            zerochan('Genshin+Impact', 99, res);
          }
        });
          console.log(images)
  }
})
}

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log("Server is listening in port" + PORT);
});

          
          //WEB SERVER