
const { default: makeWASocket, useSingleFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require("@adiwajshing/baileys")
const { connectionFileName } = require("./config/configFile")
const { state, saveState } = useSingleFileAuthState(connectionFileName())
const MAIN_LOGGER = require("@adiwajshing/baileys/lib/Utils/logger").default
const logger = MAIN_LOGGER.child({})
logger.level = 'trace'
const { core } = require('./lib')


exports.createConnection = new Promise((resolve, reject) => {
    try {
        const startSock = async () => {
           const { version } = await fetchLatestBaileysVersion()
            const sock = makeWASocket({ version, logger, printQRInTerminal: true, auth: state })
            sock.ev.on('connection.update', (update) => {
                const { connection, lastDisconnect } = update
                if (connection === 'close')
                    lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut
                        ? startSock() : console.log('+ connection closed')
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

const express = require("express")
const cors = require("cors")
const request = require("request")
const got = require("got")


const app = express();

app.use(cors());
app.use(express.json());


app.get("/", (req, res) => {
    res.sendFile('megumi.html', {root: __dirname })
});



const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log("Megumi Server is Active in Port: " + PORT);
});

          
          //WEB SERVER