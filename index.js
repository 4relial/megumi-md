const { default: makeWASocket, AnyMessageContent, delay, DisconnectReason, fetchLatestBaileysVersion, makeInMemoryStore, MessageRetryMap, useMultiFileAuthState, getMessageFromStore } = require("@adiwajshing/baileys")
const MAIN_LOGGER = require("@adiwajshing/baileys/lib/Utils/logger").default
const { core } = require('./lib')
const Pino = require("pino")
const fs = require('fs')
const conf = require('./config/configFile').info
const qrcode = require("qr-image");
const logger = MAIN_LOGGER.child({})
const { delGrup, getgroup } = require('./lib/DBUser')


   exports.Start = async() => {
try {
        //Retry Handler
        const { state, saveCreds } = await useMultiFileAuthState('.state')
        // fetch latest version of WA Web
        const { version, isLatest } = await fetchLatestBaileysVersion()
        console.log(`using WA v${version.join('.')}, isLatest: ${isLatest}`)

  async function startSock(){
    
        const store = makeInMemoryStore({})
        store.readFromFile('./baileys_store.json')
        setInterval(() => {
            store.writeToFile('./baileys_store.json')
        }, 10_000)

        const sock = makeWASocket({
            version,
            logger: Pino({ level: "silent" }),
            printQRInTerminal: true,
            defaultQueryTimeoutMs: undefined,
            browser: ['Megumi MD','Safari','1.0.0'],
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


        sock.ev.on('messages.upsert', m => core(sock, m))
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
  }
  startSock()
} catch (e) { reject(e) }
    }
    

