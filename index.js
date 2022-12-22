"use strict"
const { default: makeWASocket, AnyMessageContent, isJidBroadcast, jidNormalizedUser, makeCacheableSignalKeyStore, delay, DisconnectReason, fetchLatestBaileysVersion, makeInMemoryStore, MessageRetryMap, useSingleFileAuthState, useMultiFileAuthState, msgRetryCounterMap, getMessageFromStore } = require("@adiwajshing/baileys")
const MAIN_LOGGER = require("@adiwajshing/baileys/lib/Utils/logger").default
const { core } = require('./lib')
const Pino = require("pino")
const fs = require('fs')
const conf = require('./config/configFile').info
const qrcode = require("qr-image");
const logger = MAIN_LOGGER.child({})
const rimraf = require('rimraf')
const { global } = require('./lib/global')
const { getBuffer, Base64, Spam, SpamP, SpamX, Muted } = require('./lib/functions')
let sys = require('util')
let exec = require('child_process').exec;

rimraf('./assets/downloads/*', function () {
    console.log('Data Dihapus!')
})


const startSock = async (anu) => {
    const { state, saveCreds } = await useMultiFileAuthState('multi_state/state')
    // fetch latest version of WA Web
    const { version, isLatest } = await fetchLatestBaileysVersion()
    console.log(`using WA v${version.join('.')}, isLatest: ${isLatest}`)

    const store = makeInMemoryStore({})
    store.readFromFile('./multi_state/store.json')
    setInterval(() => {
        store.writeToFile('./multi_state/store.json')
    }, 10_000)
    const sock = makeWASocket({
        version,
        logger: Pino({ level: "silent" }),
        printQRInTerminal: true,
        shouldIgnoreJid: jid => isJidBroadcast(jid),
        browser: ['Megumi MD', 'Safari', '9.4.5'],
        auth: {
            creds: state.creds,
            /** caching makes the store faster to send/recv messages */
            keys: makeCacheableSignalKeyStore(state.keys, logger),
        },
        patchMessageBeforeSending: (message) => {
            const requiresPatch = !!(
                message.buttonsMessage ||
                // || message.templateMessage
                message.listMessage
            );
            if (requiresPatch) {
                message = {
                    viewOnceMessage: {
                        message: {
                            messageContextInfo: {
                                deviceListMetadataVersion: 2,
                                deviceListMetadata: {},
                            },
                            ...message,
                        },
                    },
                };
            }

            return message;
        },
        // implement to handle retries
        getMessage: async key => {
            if (store) {
                // if (alert.length < 4) alert.push(1)
                const msg = await store.loadMessage(key.remoteJid, key.id)
                return msg?.message || undefined
            }

            // only if store is present
            return {
                conversation: 'Failed to provide message'
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
                    rimraf("./multi_state/state/*", function () { console.log("done"); });
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


    // sock.ev.on('creds.update', saveState)
    sock.ev.on('creds.update', saveCreds)

    async function sendTyping(f = from) {
        await sock.presenceSubscribe(f)
        await delay(500)
        await sock.sendPresenceUpdate('composing', f)
        await delay(2000)
        await sock.sendPresenceUpdate('paused', f)
    }

    console.info = async function () {
        if (!require("util").format(...arguments).includes("Closing session: SessionEntry")) return
        if (!require("util").format(...arguments).includes("Removing old closed session: SessionEntry")) return
        // if (!require("util").format(...arguments).includes("Session error:MessageCounterError:")) 
    }

    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== "notify") return
        try {
            // console.log(type)
            let mei = global.d.verificarMei(messages)
            if (!mei) return
            await core(sock, mei)
        } catch (e) {
            if (e.toString().includes('this.isZero')) return
            var today = new Date();
            var date = today.getDate() + '/' + (today.getMonth() + 1) + '/' + today.getFullYear()
            var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
            var dateTime = date + '|' + time;
            console.log(`${dateTime}>>>> `, e, '<<<<')
        }
    })

    sock.ev.on('call', async (m) => {
        const call = m[0]
        if (call.status == 'offer') {
            console.log("Call From: " + call.from)
            await sock.rejectCall(call.id, call.from);
            if (!call.isGroup) {
                await sendTyping(call.from)
                await delay(100)
                await sock.sendMessage(call.from, { text: `Panggilan terdeteksi, kamu di blok secara otomatis\nSilakan hubungi owner jika tidak sengaja` })
                const vcard = 'BEGIN:VCARD\n' // metadata of the contact card
                    + 'VERSION:3.0\n'
                    + 'FN:Owner \n' // full name
                    + 'ORG:Blessing Software;\n' // the organization of the contact
                    + 'TEL;type=CELL;type=VOICE;waid=6289515275674:+62 895 1527 5674\n' // WhatsApp ID + phone number
                    + 'END:VCARD'
                const sentMsg = await sock.sendMessage(
                    call.from,
                    {
                        contacts: {
                            displayName: 'Yae',
                            contacts: [{ vcard }]
                        }
                    }
                )
                await delay(5000)
                await sock.updateBlockStatus(call.from, "block")
                return
            }
        }
    })

    sock.ev.on('group-participants.update', async (anu) => {
        if (!anu.participants.includes(conf.bot.number)) {
            console.log(anu)
            if (anu.participants.length > 2) return
            try {
                let metadata = await sock.groupMetadata(anu.id)
                let participants = anu.participants

                for (let num of participants) {
                    let options = { width: 300, height: 300 }
                    let ppuser
                    // Get Profile Picture User
                    try {
                        ppuser = await sock.profilePictureUrl(num)
                        ppuser = await getBuffer(ppuser)
                    } catch {
                        try {
                            ppuser = await sock.profilePictureUrl(anu.id)
                            ppuser = await getBuffer(ppuser)
                        } catch {
                            ppuser = fs.readFileSync('./assets/pp.jpg')
                        }
                    }

                    let Welcomer = `Halo @${num.split("@")[0]} Selamat Datang di Grup *${metadata.subject}*`
                    let Bye = `Sayonara @${num.split("@")[0]}`
                   

                    if (anu.action == 'add') {
                        await sendTyping(anu.id)
                        sock.relayMessage(
                            anu.id,
                            {
                                extendedTextMessage: {
                                    text: Welcomer, contextInfo: {
                                        mentionedJid: [num],
                                        externalAdReply: {
                                            title: "𝕄𝕖𝕘𝕦𝕞𝕚 𝕂𝕒𝕥𝕠𝕦",
                                            body: "❦ Selamat Datang",
                                            mediaType: 0,
                                            thumbnail: ppuser,
                                            sourceUrl: 'https://bit.ly/3eQfDdQ',
                                            containsAutoReply: false,
                                            renderLargerThumbnail: false,
                                            showAdAttribution: false
                                        },
                                    }
                                }
                            },
                            {}
                        )
                    } else if (anu.action == 'remove') {
                        await sendTyping(anu.id)
                        sock.relayMessage(
                            anu.id,
                            {
                                extendedTextMessage: {
                                    text: Bye, contextInfo: {
                                        mentionedJid: [num],
                                        externalAdReply: {
                                            title: "𝕄𝕖𝕘𝕦𝕞𝕚 𝕂𝕒𝕥𝕠𝕦",
                                            body: "❦ Bye Bye..",
                                            mediaType: 0,
                                            thumbnail: ppuser,
                                            sourceUrl: 'https://bit.ly/3eQfDdQ',
                                            containsAutoReply: false,
                                            renderLargerThumbnail: false,
                                            showAdAttribution: false
                                        },
                                    }
                                }
                            },
                            {}
                        )
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
                    if (anu.action == 'promote') {
                        await sendTyping(anu.id)
                        sock.sendMessage(anu.id, { mentions: [num], text: `Megumi telah menjadi Admin Grup` })
                    }
                }
            } catch (err) {
                console.log(err)
            }
        }
    })

}

module.exports = { startSock }
