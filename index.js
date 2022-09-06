const { default: makeWASocket, AnyMessageContent, delay, DisconnectReason, fetchLatestBaileysVersion, makeInMemoryStore, MessageRetryMap, useMultiFileAuthState, getMessageFromStore } = require("@adiwajshing/baileys")
const MAIN_LOGGER = require("@adiwajshing/baileys/lib/Utils/logger").default
const { core } = require('./lib')
const Pino = require("pino")
const fs = require('fs')
const conf = require('./config/configFile').info
const qrcode = require("qr-image");
const logger = MAIN_LOGGER.child({})
const { global } = require('./lib/global')


async function startSock(anu) {
try {
    const { state, saveCreds } = await useMultiFileAuthState('.state')
    // fetch latest version of WA Web
    const { version, isLatest } = await fetchLatestBaileysVersion()
    console.log(`using WA v${version.join('.')}, isLatest: ${isLatest}`)
    const store = makeInMemoryStore({})
    store.readFromFile('./baileys_store.json')
    setInterval(() => {
        store.writeToFile('./baileys_store.json')
    }, 10_000)

    const sock = makeWASocket({
        version,
        logger: Pino({ level: "silent" }),
        printQRInTerminal: true,
        browser: ['Megumi MD', 'Safari', '9.4.5'],
        auth: state,
        // implement to handle retries
        getMessage: async key => {
            if (store) {
                const msg = await store.loadMessage(key.remoteJid, key.id, undefined)
                return msg?.message || undefined
            }

            // only if store is present
            return {
                conversation: 'Terjadi Kesalahan, Ulangi Command!'
            }
        }
    })

    store.bind(sock.ev)

        sock.ev.on('connection.update', (update) => {

            const { connection, lastDisconnect, qr } = update

            if (connection === 'close')
                if (lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut) {
                    startSock()
                } else {
                    try {
                        var rimraf = require("rimraf");
                        rimraf(".state", function () { console.log("done"); });
                        if (fs.existsSync('./baileys_store.json')) {
                            fs.unlinkSync('./baileys_store.json')
                        }
                    } finally {
                        startSock()
                    }
                }

            if (connection) { console.log("Connection Status: ", connection); }
            if (qr !== undefined) {
                qrcode.image(qr, { type: 'png', size: 20 }).pipe(fs.createWriteStream('./img.png'))
            } else {
                if (fs.existsSync('./img.png')) {
                    fs.unlinkSync('./img.png')
                }
            }
        })




        sock.ev.on('creds.update', saveCreds)


        sock.ev.on('messages.upsert', async (m) => {

        try {

            mei = global.d.verificarMei(m)
            if (!mei) return

            const from = mei.key.remoteJid
            var group = from.endsWith('@g.us')
            let sender = group ? mei.key.participant : mei.key.remoteJid
            let fromPC = group ? sender.includes(':') ? true : false : false
            sender = fromPC ? sender.split(':')[0] + '@s.whatsapp.net' : sender

            await sock.readMessages([mei.key])
            await core(sock, m)
        } catch (e) {
            if (e.toString().includes('this.isZero')) return
            var today = new Date();
            var date = today.getDate() + '/' + (today.getMonth() + 1) + '/' + today.getFullYear()
            var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
            var dateTime = date + '|' + time;
            console.log(`${dateTime}>>>> `, e, '<<<<')
        }
    })
    
        sock.ev.on('group-participants.update', async (anu) => {
          if(!anu.participants.includes(conf.bot.number)) {
            console.log(anu)
            if (anu.participants.length > 2) return
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
                        sock.sendMessage(anu.id, { mentions: [num] , text: `Halo @${num.split("@")[0]} Selamat Datang di Grup *${metadata.subject}*` })
                    } else if (anu.action == 'remove') {
                        sock.sendMessage(anu.id, { mentions: [num] , text: `Sayonara @${num.split("@")[0]}` })
                    }

                }
            } catch (err) {
                console.log(err)
            }
        } else {
            console.log("BOT Grup Info")
            try {
                let participants = anu.participants
                for (let num of participants) {
                    if (anu.action == 'remove') {
                        delGrup(anu.id)
                    } else if (anu.action == 'promote') {
                        sock.sendMessage(anu.id, { mentions: [num] , text: `Chisato menjadi Admin :)` })
                    } else if (anu.action == 'demote') {
                        sock.sendMessage(anu.id, { mentions: [num] , text: `Chisato sudah bukan Admin :(` })
                    }
                }
            } catch (err) {
                console.log(err)
            }
        }
        })
} catch (e) { reject(e) }
    }

//web

const rimraf = require('rimraf')

startSock()

rimraf('./assets/downloads/*', function () {
  console.log('Data Dihapus!') 
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
    if (fs.existsSync('./img.png')) {
        res.sendFile(__dirname + '/img.png')
    } else {
        res.sendFile(__dirname + '/megumi.html')
    }

});

app.get("/ping", (req, res) => {
        res.sendFile(__dirname + '/ping.html')
});



const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log("Megumi Server is Active in Port: " + PORT);
});


          //WEB SERVER
