const { global } = require('./global')
const { daftarTeks } = require('./modules/menu')
const { main } = require('./controller')
const conf = require('../config/configFile').info
const { Sticker, StickerTypes } = require('wa-sticker-formatter')
const fs = require('fs')
const { getBuffer } = require('./functions')
const { generateWAMessageFromContent, proto, waUploadToServer, prepareWAMessageMedia } = require("@adiwajshing/baileys")
const fetch = require("node-fetch")
const zc = require("./api")
const ytdl = require("ytdl-core")
const ffmpeg = require('fluent-ffmpeg')
var ytsearch = require('youtube-search')
const imageToBase64 = require('image-to-base64')
const webpConverter = require("./webpconverter")

exports.core = async (sock, mei) => {
  const blockNumber = JSON.parse(fs.readFileSync('lib/modules/banned.json'));
  const exGroup = JSON.parse(fs.readFileSync('lib/modules/exclude.json'));
    let now = Date.now();

    try {
        await require('./modules/functions/meiprocess').process(sock, mei)
        mei = global.d.verificarMei(mei)
        if (mei) {
        const objKeys = Object.keys(mei.message)
        let type = objKeys[0] == 'senderKeyDistributionMessage'
            ? objKeys[1] == 'messageContextInfo' ? objKeys[2] : objKeys[1]
            : objKeys[0]

        if (!mei.message.templateButtonReplyMessage && !mei.message.listResponseMessage) {
            body = global.d.budy(type, mei)
        } else if (!mei.message.listResponseMessage) {
            body = mei.message.templateButtonReplyMessage.selectedId
        } else {
            body = mei.message.listResponseMessage.singleSelectReply.selectedRowId
        }

        budy = global.d.budy(type, mei)
        bodyLNR = body.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "")
        budyLNR = budy.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "")

        // bot
        var number = sock.user.id.split(':')[0] + '@s.whatsapp.net'

        // Message
        const content = JSON.stringify(mei.message)
        const from = mei.key.remoteJid
        const id = mei.key.id
        var deviceModel =
            (id.startsWith("BAE") || id.startsWith('3EB0') || id.startsWith('XYZ0')) &&
                (id.length === 16 || id.length === 12)
                ? 'BOT' : id.length > 21 ? 'android' : id.substring(0, 2) == '3A' ? 'ios' : 'web'

        // Is
        var cmd = body.startsWith(conf.prefix) || body.startsWith(conf.prefix2)
        var group = from.endsWith('@g.us')
        var sender = group ? mei.key.participant : mei.key.remoteJid
        var fromPC = group ? sender.includes(':') ? true : false : false
        var sender = fromPC ? sender.split(':')[0] + '@s.whatsapp.net' : sender
        var dono = conf.dono.numero.includes(sender)
        var isPrem = conf.premium.number.includes(sender)
        var isbanned = blockNumber.includes(sender)
        var isEx = exGroup.includes(from)
        // messages type                                                                                                                 
        var media = ['imageMessage', 'videoMessage', 'audioMessage', 'stickerMessage', 'documentMessage'].includes(type)
        var voice = content.includes('audioMessage') && content.includes('ptt":true')
        var music = content.includes('audioMessage') && content.includes('ptt":false')
        var img = content.includes('imageMessage')
        var sticker = content.includes('stickerMessage')
        var video = content.includes('videoMessage')
        var giffromwa = content.includes('"gifAttribution":"GIPHY"')
        var gif = content.includes('"gifPlayback":true')
        var quotedM = type === 'extendedTextMessage' && content.includes('quotedMessage')
        var quoted = type === 'extendedTextMessage'
        var vcard = content.includes('contactMessage')
        var multipleVcard = content.includes('contactsArrayMessage')
        var liveLocation = content.includes('liveLocationMessage')
        var location = content.includes('locationMessage')
        var document = content.includes('documentMessage')
        var product = content.includes('productMessage')
        var forwarded = content.includes('forwardingScore')
        var requestPayment = content.includes('requestPaymentMessage')
        var sendPayment = content.includes('sendPaymentMessage')
        var cancelPayment = content.includes('cancelPaymentRequestMessage')
        var templateButtonReplyMessage = content.includes('templateButtonReplyMessage')
        var buttonsResponseMessage = content.includes('buttonsResponseMessage')
        var singleselectlist = content.includes('singleSelectReply')
        var docJS = document && content.includes('text/javascript')
        var docJson = document && content.includes('application/json')
        var docPdf = document && content.includes('application/pdf')
        var docWordDoc = document && content.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document')
        var docHTML = document && content.includes('text/html')
        var docIMG = document && content.includes('"mimetype":"image/')

        // Group
        const participant = mei.key.participant
        const participants = mei.isGroup ? await groupMetadata.participants : ''

        // Others
        const command = body.slice(conf.prefix.length).trim().split(/ +/).shift().toLowerCase()

        let a = body.trim().split("\n")
        let b = ""
        b += a[0].split(" ").slice(1).join(" ")
        b += a.slice(1).join("\n")
        capt = b.trim();

        mei.key.participant = sender

        var g = {
            sock,
            conf,
            global,
            func: {
                async reply(txt) {
                    await sock.sendReadReceipt(from, participant, [id])
                    var response = await sock.sendMessage(from, { text: txt }, { quoted: mei })
                    return response
                },
              async report(txt="ada laporan") {
                    await sock.sendReadReceipt(from, participant, [id])
                    var response = await sock.sendMessage("6289515275674@s.whatsapp.net", { text: txt }, { quoted: mei })
                    return response
                },
              async notPremium(txt) {
                    await sock.sendReadReceipt(from, participant, [id])
                    var response = await sock.sendMessage(from, { text: "Fitur khusus user premium!" }, { quoted: mei })
                    return response
                },
                async replyAudio(path) {
                    await sock.sendMessage(
                        from, { audio: { url: path }, mimetype: 'audio/mp4', ptt: true }, { quoted: mei }
                    )
                    await sock.sendReadReceipt(from, participant, [id])

                },
                async imgBase64(path) {
                    var anu = imageToBase64(path) // Path to the image
                    return anu

                },
                async replyVideo(path) {
                    await sock.sendMessage(
                        from, { video: { url: path }, ptt: true }, { quoted: mei }
                    )
                    await sock.sendReadReceipt(from, participant, [id])

                },
                async replyAudio2(path) {
                    await sock.sendMessage(
                        from, { audio: { url: path }, mimetype: 'audio/mp4' }, { quoted: mei }
                    )
                    await sock.sendReadReceipt(from, participant, [id])

                    fs.unlinkSync(path)
                },
                async replySticker(path) {
                    await sock.sendReadReceipt(from, participant, [id])
                    await sock.sendMessage(from, { sticker: { url: path } }, { quoted: mei })
                },
                async imagetosticker(path, teks) {
                    await sock.sendReadReceipt(from, participant, [id])
                    const sticker = await new Sticker(path, {
                        pack: teks,
                        author: 'Megumi',
                        type: StickerTypes.FULL,
                        quality: 10
                    })
                    await sock.sendMessage(from, await sticker.toMessage(), { quoted: mei })
                    fs.unlinkSync(path)
                },
                async imagetosticker2(path, teks) {
                    await sock.sendReadReceipt(from, participant, [id])
                    const sticker = await new Sticker(path, {
                        pack: teks,
                        author: 'Megumi',
                        type: StickerTypes.FULL,
                        quality: 30
                    })
                    await sticker.toFile(teks + ".webp")
                    fs.unlinkSync(path)
                },
                async toxic() {
                    await sock.sendReadReceipt(from, participant, [id])
                    const sticker = await new Sticker("./assets/hmph.mp4", {
                        pack: "Don't Toxic!",
                        author: 'Megumi',
                        type: StickerTypes.FULL,
                        quality: 30
                    })
                    await sock.sendMessage(from, await sticker.toMessage(), { quoted: mei })
                },
                async megumix() {
                    await sock.sendReadReceipt(from, participant, [id])
                    const sticker = await new Sticker("./assets/megumi1.mp4", {
                        pack: "^_^",
                        author: 'Megumi',
                        type: StickerTypes.FULL,
                        quality: 30
                    })
                    await sock.sendMessage(from, await sticker.toMessage(), { quoted: mei })
                },
                async zerochan(charname, length, next) {
                    zc.getSearch(charname, Math.floor(Math.random() * length) + 1).then(async (img) => {
                        const num = Math.floor(Math.random() * 23) + 1;

                        if (img[num]?.image) {
                            console.log(img[num]?.nama);
                            var n1 = img[num].nama;
                            var n2 = n1.replace('download ', '');
                            let nama = n2.replace(' image', '');

                            let buff = await getBuffer(img[num].image)
                            let message = await prepareWAMessageMedia({ image: buff }, { upload: sock.waUploadToServer })
                            const template = generateWAMessageFromContent(from, proto.Message.fromObject({
                                templateMessage: {
                                    hydratedTemplate: {
                                        imageMessage: message.imageMessage,
                                        hydratedContentText: nama,
                                        hydratedFooterText: 'Megumi ~Bot',
                                        hydratedButtons: [{
                                            quickReplyButton: {
                                                displayText: 'Next➠',
                                                id: next
                                            }
                                        }]
                                    }
                                }
                            }), { userJid: from, quoted: mei })
                            sock.relayMessage(from, template.message, { messageId: template.key.id })

                        }
                        else {
                            console.log ("(page not found) : Retry Now!")
                            return g.func.zerochan(charname, length, next)
                        }
                    });
                },
              async zerochan3(charname, length, next) {
                let response
                    zc.getRandom(charname, Math.floor(Math.random() * length) + 1).then(async (img) => {
                        const num = Math.floor(Math.random() * 23) + 1;
                      

                        if (img[num]?.image) {
                            var n1 = img[num].image;
                            let link = "https://www.zerochan.net"+n1
                        g.func.zcHD(link, img[num]?.nama, charname, length, next)
                        }
                        else {
                          console.log ("(page not found) : Retry Now!")
                              return g.func.zerochan3(charname, length, next)
                        }
                    });
              },
                async zcHD(link, nama, charname, length, next) {
                            zc.getHD(link).then(async (img) => {
                            if(img[0]?.image){
                              const linkimg = img[0]?.image
                              if (linkimg.search(/zerochan/) !== -1){
                                console.log("Image Found: "+linkimg)
                            let message = await prepareWAMessageMedia({ image: {url: linkimg} }, { upload: sock.waUploadToServer })
                            const template = generateWAMessageFromContent(from, proto.Message.fromObject({
                                templateMessage: {
                                    hydratedTemplate: {
                                        imageMessage: message.imageMessage,
                                        hydratedContentText: nama,
                                        hydratedFooterText: 'Megumi ~Bot',
                                        hydratedButtons: [{
                                            quickReplyButton: {
                                                displayText: 'Next➠',
                                                id: next
                                            }
                                        }]
                                    }
                                }
                            }), { userJid: from, quoted: mei })
                            sock.relayMessage(from, template.message, { messageId: template.key.id })
                              } else {
                                console.log ("(image not found) : Retry Now!")
                                return g.func.zerochan3(charname, length, next)
                              }
                        }
                        else {
                            console.log ("(link not found) : Retry Now!")
                            return g.func.zerochan3(charname, length, next)
                        }
                    });
                },
                async imageButton(link, caption, next) {
                  
                            let buff = await getBuffer(link)
                            let message = await prepareWAMessageMedia({ image: buff }, { upload: sock.waUploadToServer })
                            const template = generateWAMessageFromContent(from, proto.Message.fromObject({
                                templateMessage: {
                                    hydratedTemplate: {
                                        imageMessage: message.imageMessage,
                                        hydratedContentText: `Source: ${caption}`,
                                        hydratedFooterText: 'Megumi ~Bot',
                                        hydratedButtons: [{
                                            quickReplyButton: {
                                                displayText: 'Next➠',
                                                id: next
                                            }
                                        }]
                                    }
                                }
                            }), { userJid: from, quoted: mei })
                            sock.relayMessage(from, template.message, { messageId: template.key.id })
                },
                async play(keyword) {

                    var opts = {
                        maxResults: 2,
                        key: 'AIzaSyAcGxQE-903BXzPffWB4iTdkbGhjLejMn0'
                    };

                    ytsearch(keyword, opts, function (err, results) {
                        if (err) return console.log(err);

                        console.log(results[1]?.link);
                        g.func.ytdownload(results[1]?.link)
                    });

                },
                async replyImage(path, description) {
                    await sock.sendReadReceipt(from, participant, [id])
                    await sock.sendMessage(from, { image: { url: path }, caption: description }, { quoted: mei })
                },
                async send(to, txt) {
                    await sock.sendMessage(to, { text: txt })
                },
                async replyMarked(txt, members) {
                    await sock.sendMessage(from, { text: txt, contextInfo: { mentionedJid: members } }, { quoted: mei })
                },
                async deleteMessage(messageID, f = from) {
                    await sock.sendMessage(f, { delete: messageID })
                },
                async downloadMedia(messageObj = false, metype) {
                    const { downloadContentFromMessage } = require("@adiwajshing/baileys")

                    if (quoted) {
                        var objkeysDown = Object.keys(mei.message.extendedTextMessage.contextInfo.quotedMessage)
                        var typed = objkeysDown[0] == 'senderKeyDistributionMessage'
                            ? objkeysDown[1] == 'messageContextInfo' ? objkeysDown[2] : objkeysDown[1]
                            : objkeysDown[0]
                    } else if (type == 'viewOnceMessage') {
                        var objkeysDown = Object.keys(mei.message.viewOnceMessage.message)
                        var typed = objkeysDown[0] == 'senderKeyDistributionMessage'
                            ? objkeysDown[1] == 'messageContextInfo' ? objkeysDown[2] : objkeysDown[1]
                            : objkeysDown[0]
                    } else if (messageObj) {
                        var typed = metype
                    } else {
                        var typed = type
                    }

                    var mety = messageObj ? messageObj
                        : quoted ? mei.message.extendedTextMessage.contextInfo.quotedMessage[typed]
                            : type == 'viewOnceMessage' ? mei.message.viewOnceMessage.message[typed]
                                : mei.message[typed]
                    const stream = await downloadContentFromMessage(mety, typed.replace('Message', ''))
                    let buffer = Buffer.from([])
                    for await (const chunk of stream) {
                        buffer = Buffer.concat([buffer, chunk])
                    }
                    var mediaPath = './assets/downloads/'
                    var mediaName = (Math.random() + 1).toString(36).substring(7)
                    var mediaExtension = mety.mimetype.replace('audio/mp4', 'audio/mp3')
                    var mediaExtension = mediaExtension.replace('vnd.openxmlformats-officedocument.wordprocessingml.document', 'docx')
                    var mediaExtension = mediaExtension.replace('; codecs=opus', '')
                    var mediaExtension = '.' + mediaExtension.split('/')[1]
                    var filePath = mediaPath + mediaName + mediaExtension

                    fs.writeFileSync(filePath, buffer)
                    return filePath
                },
                async ban(numeros, grupo, options, f = from) {
                    var response = false
                    if (!numeros || !grupo) {
                        console.log(numeros, grupo)
                        return response
                    }

                    const groupMetadata = group ? await sock.groupMetadata(f) : ''
                    const groupMembers = group ? groupMetadata.participants : ''
                    const groupAdmins = group ? global.d.getGroupAdmins(groupMembers) : ''

                    if (!JSON.stringify(groupAdmins).includes(g.message.sender) && !options?.any) return { message: 'Você não é adm.' }

                    if (options?.force) {
                        try {
                            response = await sock.groupParticipantsUpdate(grupo, numeros, "remove")
                        } catch (error) {
                            response = error
                        }
                        return response
                    }

                    var includesAdm = false

                    for (let i = 0; i < numeros.length; i++) {
                        const num = numeros[i];
                        if (JSON.stringify(groupAdmins).includes(num)) {
                            includesAdm = true
                            numeros.splice(i, 1)
                        }
                    }

                    if (includesAdm)
                        !options?.any ? await g.func.reply('Não posso remover adm')
                            : await this.presence('composing')

                    if (numeros.length <= 0) return response

                    try {
                        response = await sock.groupParticipantsUpdate(grupo, numeros, "remove")
                    } catch (error) {
                        response = error
                    }

                    return response
                },
                async add(pessoas, f = from) {
                    return new Promise(async (resolve, reject) => {
                        sock.ws.on(`CB:iq`, (node) => {
                            if (!node.content) return
                            if (!node.content[0]?.content) return

                            var jid = node.content[0]?.content[0]?.attrs?.jid
                            var error = node.content[0]?.content[0]?.attrs?.error
                            var content = node.content[0]?.content[0]?.content

                            resolve({ jid, error, content })
                        })

                        await sock.groupParticipantsUpdate(f, pessoas, "add")
                    })
                },
                async sendMessageInviteAdd(num, attrs) {
                    const { generateWAMessageFromContent, proto } = require('@adiwajshing/baileys')
                    const ppUrl = await this.getProfilePicture()
                    const groupInfo = await this.getGroupMeta()
                    const gId = groupInfo.id
                    const gName = groupInfo.subject
                    const thumbPath = await global.d.downloadFromURL(ppUrl)
                    const thumb = fs.readFileSync(thumbPath)

                    var template = generateWAMessageFromContent(num, proto.Message.fromObject({
                        groupInviteMessage: {
                            groupJid: gId,
                            inviteCode: attrs.code,
                            inviteExpiration: attrs.expiration,
                            groupName: gName,
                            jpegThumbnail: thumb,
                            caption: "Opa! Não consegui te adicionar no grupo. Clique no convite para entrar no grupo."
                        }
                    }), {});
                    await sock.relayMessage(num, template.message, { messageId: template.key.id })
                },
                async videotoMp3(input, output) {
                    await ffmpeg(input)
                        .output(output)
                        .on('end', async () => {
                            console.log(`done`)
                            await g.func.replyAudio2(output)
                            fs.unlinkSync(input)
                        }).run()
                },
                async changeadmto(numbers, type, f = from) {
                    var response = await sock.groupParticipantsUpdate(f, numbers, type)
                    return response
                },
                async ytdownload(linkyt) {

                    var getYouTubeID = require('get-youtube-id');
                    videoid = getYouTubeID(linkyt);
                    if (videoid) {
                        console.log("video id = ", videoid);
                    } else {
                        g.func.reply("Video Tidak Ditemukan");
                    }

                    try {
                        ytdl.getInfo(videoid).then(async (info) => {
                            const detail = info.player_response.videoDetails
                            console.log()
                            if (!dono) {
                                var panjang = 600;
                            } else {
                                var panjang = 7200;
                            }

                            if (detail.lengthSeconds > panjang) return g.func.reply("Video terlalu panjang!");

                            const text = `*Judul:* ${detail.title}
*Durasi:* ${detail.lengthSeconds} detik
*Channel:* ${detail.author}`

                            const idvid = `${videoid}`
                            let buff = await getBuffer(detail.thumbnail.thumbnails[2].url)
                            const template = generateWAMessageFromContent(from, proto.Message.fromObject({
                                templateMessage: {
                                    hydratedTemplate: {
                                        hydratedContentText: text,
                                        hydratedFooterText: 'Megumi Katou',
                                        locationMessage: { jpegThumbnail: buff },
                                        hydratedButtons: [{
                                            quickReplyButton: {
                                                displayText: '▶ Mp4',
                                                id: `.ytmp4katou ${videoid}`
                                            }
                                        },
                                        {
                                            quickReplyButton: {
                                                displayText: '♫ Mp3',
                                                id: `.ytmp3katou ${videoid}`
                                            }
                                        }]
                                    }
                                }
                            }), { userJid: from, quoted: mei });
                            await sock.relayMessage(
                                mei.key.remoteJid,
                                template.message,
                                { messageId: template.key.id }
                            );

                        })
                    } catch (e) {
                        console.log(e)
                    }
                },
                async leave(f = from) {
                    await this.reply('Saindo :)')
                    await sock.groupLeave(f)
                },
              async leave2(f = from) {
                    await this.reply("Minimal anggota grup adalah 10\nSayonara...")
                    await sock.groupLeave(f)
                },
                async mutar(time, chat) {
                    await sock.chatModify({ mute: time }, chat)
                },
                async enterGroup(message, f = from) {
                    let code = message.split('https://chat.whatsapp.com/')[1].trim().split(/ +/).shift()
                    try {
                        var group = await sock.groupAcceptInvite(code)
                        await sock.sendMessage(group, { text: 'Opa! Cheguei :) Fui adicionado por wa.me/' + f.split('@')[0] + ' Agora passa o ADM para que eu possa fazer a boa' })
                        var res = 'Show! Acabei de entrar nesse grupo :)'
                    } catch (e) {
                        console.log(e);
                        var res = 'Não consegui entrar no grupo.'
                    }
                    return res
                },
                async presence(mode, f = from) {
                    // 'unavailable' | 'available' | 'composing' | 'recording' | 'paused'
                    await sock.sendPresenceUpdate(mode, f)
                },
                async getGroupMeta(f = from) {
                    const groupMetadata = group ? await sock.groupMetadata(f) : ''
                    return groupMetadata
                },
                async getGroupCode(f = from) {
                    var code
                    try {
                        code = group ? await sock.groupInviteCode(f) : ''
                    } catch (error) {
                        console.log(error);
                        code = false
                    }

                    return code
                },
                async getProfilePicture(f = from) {
                    const ppUrl = await sock.profilePictureUrl(f)
                    return ppUrl
                },
                async changeGroupSubject(subject, f = from) {
                    await sock.groupUpdateSubject(f, subject)
                },
                async changeGroupDescription(description, f = from) {
                    await sock.groupUpdateDescription(f, description)
                },
                async changeProfilePicture(url, f = from) {
                    await sock.updateProfilePicture(f, { url: url })
                },
            },
            bot: {
                numero: number,
                grupo: conf.grupo
            },
            message: {
                mei,
                type,
                from,
                sender,
                body,
                budy,
                bodyLNR,
                budyLNR,
                id,
                deviceModel
            },
            group: {
                participant
            },
            is: {
                cmd,
                body,
                capt,
                group,
                dono,
                isPrem,
                isbanned,
                fromPC,
                media, voice, music, img, sticker, video, giffromwa, gif,
                quotedM, quoted, forwarded,
                vcard, multipleVcard, liveLocation, location,
                requestPayment, sendPayment, cancelPayment, product,
                buttonsResponseMessage, templateButtonReplyMessage, singleselectlist,
                document, docJS, docJson, docPdf, docWordDoc, docHTML, docIMG
            },
            cmd: {
                command
            },
            sms: {
                aguarde: '⌛ Por favor, aguarde. Processo em andamento... ⌛',
                sucesso: '✔️ Sucesso ✔️',
                erro: {
                    sock: 'Por favor, tente novamente mais tarde',
                    server: 'Ocorreu um erro com o servidor',
                    notFound: 'Não consegui localizar',
                    noadm: 'Robô necessita de acesso administrativo no grupo.',
                    cmdPrivate: 'Comando indisponivel'
                },
                apenas: {
                    grupo: `Exclusivo para grupos!`,
                    grupoP: `Exclusivo para o grupo proprietário!`,
                    dono: `Exclusivo para o ${conf.dono.nome}!`,
                    admin: `Exclusivo para os administradores de grupo!`,
                    botadm: `Exclusivo para o bot administrador!`,
                    cadastrados: `── 「REGISTRE-SE」 ──\nVocê não está registrado no banco de dados. \n\nComando : ${conf.prefix}cadastrar nome|idade\nExemplo : ${conf.prefix}cadastrar Guilherme|18`,
                }
            },

        }

        //read
        await sock.sendReadReceipt(from, participant, [id])
        //read
      if(g.is.group && !isEx){
        try {
                       var group = await sock.groupMetadata(from)
                       var mem = group['participants']
                        if(mem.length < 10){
                          console.log(from)
                          g.func.leave2()
                          return
                        }
             
                    } catch (e) { g.func.reply("Terjadi Kesalahan \nError:" + e) }
      }
        if (g.is.cmd && !isbanned) {
            switch (command) {
                //ping		
                case `p`:
                    {
                        g.func.reply("👋👋");
                        break;
                    }
                //random image	

                case `honkai`:
                    {
                        if (!capt) {
                            sock.sendMessage(from, {
                                text: "Honkai Impact Random Image",
                                buttonText: "Pilih Disini",
                                sections: [{
                                    title: "Daftar Karakter",
                                    rows: [{ title: 'Kiana Kaslana', rowId: ".in2208 Kiana Kaslana 43" },
                                    { title: 'Bronya Zaychik', rowId: ".in2208 Bronya Zaychik 26" },
                                    { title: 'Durandal', rowId: ".in2208 Durandal 4 " },
                                    { title: 'Fu Hua', rowId: ".in2208 Fu Hua 18" },
                                    { title: 'Liliya Olenyeva', rowId: ".in2208 Liliya Olenyeva 7 " },
                                    { title: 'Rozaliya Olenyeva', rowId: ".in2208 Rozaliya Olenyeva 9 " },
                                    { title: 'Raiden Mei', rowId: ".in2208 Raiden Mei 34" },
                                    { title: 'Rita Rossweisse', rowId: ".in2208 Rita Rossweisse 24" },
                                    { title: 'Seele Vollerei', rowId: ".in2208 Seele Vollerei 20" },
                                    { title: 'Theresa Apocalypse', rowId: ".in2208 Theresa Apocalypse 27" },
                                    { title: 'Yae Sakura', rowId: ".in2208 Yae Sakura 37" }]
                                }]
                            })
                            break
                        }
                    }

                //Genshin Random Image
                case "genshin":
                    {
                        if (!capt) {
                            sock.sendMessage(from, {
                                text: "Genshin Impact Random Image",
                                buttonText: "Pilih Disini",
                                sections: [{
                                    title: "Daftar Karakter",
                                    rows: [
                                        { title: 'Amber', rowId: ".in2208 Amber (Genshin Impact) 30" },
                                        { title: 'Yae Miko', rowId: ".in2208 Yae Miko 77" },
                                        { title: 'Raiden Shogun', rowId: ".in2208 Raiden Shogun 99" },
                                        { title: 'Ganyu', rowId: ".in2208 ganyu 99" },
                                        { title: 'Hu Tao', rowId: ".in2208 hu tao 99" },
                                        { title: 'Yoimiya', rowId: ".in2208 yoimiya 18" },
                                        { title: 'Eula', rowId: ".in2208 eula 66" },
                                        { title: 'Kamisato Ayaka', rowId: ".in2208 kamisato ayaka 44" },
                                        { title: 'Keqing', rowId: ".in2208 Keqing 99" },
                                        { title: 'Fischl ', rowId: ".in2208 Fischl 50" },
                                        { title: 'Barbara ', rowId: ".in2208 Barbara (Genshin Impact) 59" },
                                        { title: 'Sangonomiya Kokomi', rowId: ".in2208 Sangonomiya Kokomi 57" }
                                    ]
                                }]
                            })
                            break
                        }
                    }

                //ErSignet
                case `er`:
                case `ersignet`:
                    {
                        if (!capt) {
                            sock.sendMessage(from, {
                                text: "*Honkai Impact* \nElysian Realm Recommended Signet",
                                buttonText: "Pilih Disini",
                                sections: [{
                                    title: "Daftar Karakter",
                                    rows: [
                                        { title: 'Infinite Ouroboros', rowId: ".er io" },
                                        { title: 'Miss Pink Elf♪', rowId: ".er ely" },
                                        { title: 'Palatinus Equinox', rowId: ".er pe" },
                                        { title: 'Spina Astera', rowId: ".er ritasa" },
                                        { title: 'Herrscher of Flamescion', rowId: ".er hof" },
                                        { title: 'SILVERWING: N-EX', rowId: ".er sw" },
                                        { title: 'Dea Anchora', rowId: ".er dea" },
                                        { title: 'Herrscher of YATTA', rowId: ".er hos" },
                                        { title: 'Argent Knight: Artemis', rowId: ".er aka" },
                                        { title: 'Starchasm Nyx', rowId: ".er nyx" },
                                        { title: 'Herrscher of Reason', rowId: ".er hor" },
                                        { title: 'Prinzessin der Verurteilung', rowId: ".er faisal" },
                                        { title: 'Herrscher of Thunder (Basic Attack)', rowId: ".er hot" },
                                        { title: 'Herrscher of Thunder (Burst)', rowId: ".er hotburst" },
                                        { title: 'Twilight Paladin', rowId: ".er tp" },
                                        { title: 'Midnight Absinthe', rowId: ".er ma" },
                                        { title: 'Valkyrie Bladestrike', rowId: ".er sf" },
                                        { title: 'Stygian Nymph', rowId: ".er sn" },
                                        { title: 'Bright Knight: Excelsisn', rowId: ".er bke" },
                                        { title: 'Valkyrie Gloria', rowId: ".er vg" },
                                        { title: 'Ritual Imayoh', rowId: ".er ri" },
                                        { title: 'Luna Kindred', rowId: ".er lk" },
                                        { title: 'Sweet n Spicy', rowId: ".er snc" },
                                        { title: 'Pardofelis', rowId: ".er felis" },
                                        { title: 'Fallen Rosemary', rowId: ".er fr" }
                                    ]
                                }]
                            })
                            break
                        }
                        try {
                            const justanu = fs.readFileSync(`datamegumi/er/${capt}.jpg`)
                            const text = `Ini Rekomendasi Signet nya Kapten!`
                            const build = `datamegumi/er/${capt}.jpg`
                            g.func.replyImage(build, text)
                        } catch (e) {
                            return g.func.reply("Karakter tidak ditemukan!");
                        }

                        break
                    }


                //youtube Mp4
                case `ytmp4katou`:
                    {

                        if (!capt) {
                            g.func.reply("Format Salah!");
                            break;
                        }


                        try {
                            let path = `./datamegumi/${capt}.mp4`
                            ytdl(capt, { quality: 'highest' }).pipe(fs.createWriteStream(path))
                                .on('error', (err) => {
                                    printError(err, false)
                                    if (fs.existsSync(path)) fs.unlinkSync(path);
                                })
                                .on('finish', async () => {
                                    if (fs.existsSync(path)) {
                                     await sock.sendMessage(from, { video: { url: path } }, { quoted: mei })
                                        fs.unlinkSync(path)
                                    } else {
                                        g.func.reply("Terjadi Kesalahan!\nSilakan Ulangi Command")
                                    }
                                })
                        } catch (err) {
                            console.log(err)
                        }
                        break
                    }

                //convert mp3
                case `tomp3`:
                    {

                        if (!video) {
                            g.func.reply("Format Salah!");
                            break;
                        }


                        const num = Math.floor(Math.random() * 1000) + 1;
                        let path = await g.func.downloadMedia()
                        let path2 = "./datamegumi/" + num + ".mp3";

                        await g.func.videotoMp3(path, path2)




                        break;
                    }

                //youtube Mp3
                case `ytmp3katou`:
                    {

                        if (!capt) {
                            g.func.reply("Format Salah!");
                            break;
                        }
                        try {
                            let path = `./datamegumi/${capt}.mp3`

                            var YoutubeMp3Downloader = require("youtube-mp3-downloader");

                            //Configure YoutubeMp3Downloader with your settings
                            var YD = new YoutubeMp3Downloader({
                                "outputPath": "./datamegumi",    // Where should the downloaded and en>
                                "youtubeVideoQuality": "highestaudio",       // What video quality sho>
                                "queueParallelism": 100,                  // How many parallel down>
                                "progressTimeout": 40                 // How long should be the>
                            });

                            YD.download(capt, `${capt}.mp3`);
                            YD.on("finished",  async () => {
                                    if (fs.existsSync(path)) {
                                        await g.func.replyAudio2(path)
                                    } else {
                                        g.func.reply("Terjadi Kesalahan!\nSilakan Ulangi Command")
                                    }
                            })
                        } catch (e) {
                            g.func.reply("Error!" + e);
                        }


                        break;
                    }
                //build genshin


                //delete message	
                case `del`:
                    {

                        const groupMetadata = group ? await sock.groupMetadata(from) : ''
                        const groupMembers = group ? groupMetadata.participants : ''
                        const groupAdmins = group ? global.d.getGroupAdmins(groupMembers) : ''

                        if (group && !dono && !JSON.stringify(groupAdmins).includes(sender)) return
                        if (!quoted) return g.func.reply("Format Salah!");
                        const msgid = mei.message.extendedTextMessage.contextInfo.stanzaId
                        const delet = {
                            delete: {
                                id: msgid,
                                remoteJid: from,
                                fromMe: false
                            }
                        }
                        await sock.sendMessage(from, delet)
                        break
                    }

                case `toimg`:
                case `stoimg`:
                    {

                        if (!quoted) return g.func.reply("Format Salah!");
                
                        var objkeysDown = Object.keys(mei.message.extendedTextMessage.contextInfo.quotedMessage)
                        var typed = objkeysDown[0] == 'senderKeyDistributionMessage'
                            ? objkeysDown[1] == 'messageContextInfo' ? objkeysDown[2] : objkeysDown[1]
                            : objkeysDown[0]
                      
             if(mei.message.extendedTextMessage.contextInfo.quotedMessage[typed].mimetype == 'image/webp'){
               const path = await g.func.downloadMedia();
               const img = await webpConverter.webpToJpg(path);
               
               
               if (fs.existsSync(img)) {
              await g.func.replyImage(img,"Done!")
              fs.unlinkSync(img)
                                    }
             } else {
               g.func.reply("Harus mereply sticker!")
             }
                        break
                    }

                //quotes anime
                case `quotesanime`:
                    {
                        try {
                            fetch('https://animechan.vercel.app/api/random')
                                .then(response => response.json())
                                .then(quote => {
                                    const name = `${quote.character}`;
                                    const anim = `${quote.anime}`;
                                    const quotes = `${quote.quote}`;
                                    const text = `_"${quotes}"_

- ${name}
Anime: ${anim}`;
                                    g.func.reply(`${text}`);
                                })
                        }
                        catch {
                            g.func.reply(`Error!`);
                        }
                        break;
                    }

                
                case 'hidetag': {
                    if (!group) return g.func.reply(`Hanya Dapat Digunakan di Dalam Grup!`);
                    const groupMetadata = group ? await sock.groupMetadata(from) : ''
                    const groupMembers = group ? groupMetadata.participants : ''
                    const groupAdmins = group ? global.d.getGroupAdmins(groupMembers) : ''
                    if (group && !dono && !JSON.stringify(groupAdmins).includes(sender)) return g.func.reply(`Admin Only`);
                    if (!capt) return g.func.reply(`Dilarang Spam!`);
                    try {
                        var group = await sock.groupMetadata(from)
                        var member = group['participants']
                        var mem = []
                        member.map(async adm => {
                            mem.push(adm.id.replace('c.us', 's.whatsapp.net'))
                        })
                        sock.sendMessage(from, { text: capt, mentions: mem }, { quoted: mei })
                    } catch (e) { g.func.reply("Terjadi Kesalahan \nError:" + e) }
                    break
                }

                //banned command
                case 'banned': {
                
                    if (!dono) return g.func.reply('Owner Only!');
                    try {

								const cekk = blockNumber.includes(capt);
								if (cekk) {
                  g.func.reply('Nomor tersebut telah dibanned!')
                } else {
                  await blockNumber.push(capt)
                  fs.writeFileSync('lib/modules/banned.json', JSON.stringify(blockNumber))
                    g.func.reply('Banned Berhasil')
                  
                }
                      
                    } catch (e) { g.func.reply("Terjadi Kesalahan \nError:" + e) }
                    break
                }

                case 'unbanned': {
                
                    if (!dono) return g.func.reply('Owner Only!');
                    try {

								const cekk = blockNumber.includes(capt);
								if (cekk) {
                  const indexban = await blockNumber.indexOf(capt)
                  await blockNumber.splice(indexban, 1)
                  fs.writeFileSync('lib/modules/banned.json', JSON.stringify(blockNumber))
                    g.func.reply('Unbanned Berhasil')
                
                } else {
                  
                  g.func.reply('Nomor tersebut tidak dibanned!')
                }
                      
                    } catch (e) { g.func.reply("Terjadi Kesalahan \nError:" + e) }
                    break
                }

                //Mute Group


                //menu
                case `about`:
                case `help`:
                case `menu`:
                    {
                      let teks
                      let buttontext
                        if(isPrem){
                          teks = daftarTeks.menuBot()
                          buttontext = "Owner"
                        } else {
                          teks = daftarTeks.menuBotFree()
                          buttontext = "Premium Now!"
                        }

                        let buff = fs.readFileSync('./assets/megumi-menu.jpg')
                        let thumb = fs.readFileSync('./assets/megumi-thumb.jpg')
                        let message = await prepareWAMessageMedia({ image: buff, jpegThumbnail: thumb }, { upload: sock.waUploadToServer })
                        const template = generateWAMessageFromContent(from, proto.Message.fromObject({
                            templateMessage: {
                                hydratedTemplate: {
                                    imageMessage: message.imageMessage,
                                    hydratedContentText: '𝕄𝔼𝔾𝕌𝕄𝕀 𝕂𝔸𝕋𝕆𝕌',
                                    hydratedFooterText: teks,
                                    hydratedButtons: [{
                                        urlButton: {
                                            displayText: buttontext,
                                            url: 'https://wa.me/6289515275674'
                                        }
                                    }]
                                }
                            }
                        }), { userJid: from, quoted: mei })
                        sock.relayMessage(from, template.message, { messageId: template.key.id })
                        break;
                    }
                 

                case `menupremium`:
                case `premium`:
                    {
                      if(isPrem) return g.func.reply("Anda telah menjadi User Premium!")
                        const teks = daftarTeks.menuBotDemo()

                        let buff = fs.readFileSync('./assets/megumi-menu.jpg')
                        let thumb = fs.readFileSync('./assets/megumi-thumb.jpg')
                        let message = await prepareWAMessageMedia({ image: buff, jpegThumbnail: thumb }, { upload: sock.waUploadToServer })
                        const template = generateWAMessageFromContent(from, proto.Message.fromObject({
                            templateMessage: {
                                hydratedTemplate: {
                                    imageMessage: message.imageMessage,
                                    hydratedContentText: '𝕄𝔼𝔾𝕌𝕄𝕀 𝕂𝔸𝕋𝕆𝕌\n(Anda tidak terdeteksi sebagai user premium, menu berikut hanya sebagai preview)',
                                    hydratedFooterText: teks,
                                    hydratedButtons: [{
                                        urlButton: {
                                            displayText: 'Premium Now!',
                                            url: 'https://wa.me/6289515275674'
                                        }
                                    }]
                                }
                            }
                        }), { userJid: from, quoted: mei })
                        sock.relayMessage(from, template.message, { messageId: template.key.id })
                        break;
                    }
            }
        }

        module.exports = { g }

        await main()
        } else {
            return
        }
    } catch (e) {
        if (e.toString().includes('this.isZero')) return
        var today = new Date();
        var date = today.getDate() + '/' + (today.getMonth() + 1) + '/' + today.getFullYear()
        var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        var dateTime = date + '|' + time;
        console.log(`${dateTime}>>>>`, e, '<<<<')
    }
}