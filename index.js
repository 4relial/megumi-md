const { default: makeWASocket, AnyMessageContent, delay, DisconnectReason, fetchLatestBaileysVersion, makeInMemoryStore, MessageRetryMap, useMultiFileAuthState } = require("@adiwajshing/baileys")
const MAIN_LOGGER = require("@adiwajshing/baileys/lib/Utils/logger").default
const { core } = require('./lib')
const Pino = require("pino")
const fs = require('fs')
const logger = MAIN_LOGGER.child({ })

  try {
        const startSock = async () => {

          //Retry Handler
const { state, saveCreds } = await useMultiFileAuthState('baileys_auth_info')
	// fetch latest version of WA Web
	const { version, isLatest } = await fetchLatestBaileysVersion()
	console.log(`using WA v${version.join('.')}, isLatest: ${isLatest}`)

const store = makeInMemoryStore({ })
store.readFromFile('./baileys_store.json')
setInterval(() => {
    store.writeToFile('./baileys_store.json')
}, 10_000)

	const sock = makeWASocket({
		version,
		logger: Pino({ level: "silent" }), 
		printQRInTerminal: true,
		auth: state,
		// implement to handle retries
		getMessage: async key => {
			return {
				conversation: 'Failed to Send Message'
			}
		}
	})
          store.bind(sock.ev)

            sock.ev.on('connection.update', (update) => {
                const { connection, lastDisconnect } = update
                if (connection === 'close')
                    lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut
                        ? startSock() : console.log("anu")
              if (connection) { console.log("Connection Status: ", connection); }
            })
          

          
          
            sock.ev.on('creds.update', saveCreds)


            sock.ev.on('messages.upsert', async m => await core(sock, m))
            sock.ev.on('group-participants.update', async (anu) => {              
                console.log(anu)
              if(anu.participants[0] == "6283157447725@s.whatsapp.net") return
              if(anu.participants.length > 2) return
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


//WEB SERVER

const express = require("express")
const cors = require("cors")
const request = require("request")
const got = require("got")


const app = express();

app.use(cors());
app.use(express.json());


app.get("/", (req, res) => {
    res.sendFile('megumi.html', { root: __dirname })
});



const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log("Megumi Server is Active in Port: " + PORT);
});


          //WEB SERVER