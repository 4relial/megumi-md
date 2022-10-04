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
    const blockNumber = JSON.parse(fs.readFileSync('lib/modules/banned.json'))
    const exGroup = JSON.parse(fs.readFileSync('lib/modules/exclude.json'))
    const premiumNumber = JSON.parse(fs.readFileSync('lib/modules/premium.json'))
    const vipGroup = JSON.parse(fs.readFileSync('lib/modules/vip.json'))
    const filterx = JSON.parse(fs.readFileSync('lib/modules/nsfwfilter.json'))
    const mutegroup = JSON.parse(fs.readFileSync('lib/modules/mutegroup.json'))

    let now = Date.now();

    await require('./modules/functions/meiprocess').process(sock, mei)
    mei = global.d.verificarMei(mei)
    if (!mei) return

    const objKeys = Object.keys(mei.message)
    let type = objKeys[0] == 'senderKeyDistributionMessage'
        ? objKeys[1] == 'messageContextInfo' ? objKeys[2] : objKeys[1]
        : objKeys[0]

    let body = global.d.body(type, mei)
    if (mei.message.buttonsResponseMessage) {
        body = mei.message.buttonsResponseMessage.selectedButtonId
    }

    if (mei.message.listResponseMessage) {
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
    const cmd = body.startsWith(conf.prefix) || body.startsWith(conf.prefix2)
    var group = from.endsWith('@g.us')
    var sender = group ? mei.key.participant : mei.key.remoteJid
    const fromPC = group ? sender.includes(':') ? true : false : false
    var sender = fromPC ? sender.split(':')[0] + '@s.whatsapp.net' : sender
    const owner = conf.owner.numero.includes(sender)
    const isPrem = premiumNumber.includes(sender) || vipGroup.includes(from)
    const isbanned = blockNumber.includes(sender)
    const isEx = exGroup.includes(from)
    const isNotFilterx = filterx.includes(from)
    const isMute = group ? mutegroup.includes(from) : false
    await sock.readMessages([mei.key])
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
    
  // Parameter
    let a = body.trim().split(" ")
    let b = ""
    b += a[0].split(" ").slice(1).join(" ")
    b += a.slice(1).join(" ")
    const param = b.trim();
    const commandx = body.slice(conf.prefix.length).trim().split(/ +/).shift()
    const parameter = param.replace(`${commandx} `, '')

    // Group
    const participant = mei.key.participant

    // Command
    const command = body.slice(conf.prefix.length).trim().split(/ +/).shift().toLowerCase()

    mei.key.participant = sender

    var g = {
        sock,
        conf,
        global,
        func: {
            async reply(txt) {
                var response = await sock.sendMessage(from, { text: txt }, { quoted: mei })
                return response
            },
            parameter(body) {
                let a = body.trim().split("\n")
                let b = ""
                b += a[0].split(" ").slice(1).join(" ")
                b += a.slice(1).join("\n")
                const capt = b.trim();
                return capt
            },

            async report(txt = "ada laporan") {
                return
            },
            async notPremium(txt) {
                var response = await sock.sendMessage(from, { text: "Fitur khusus user premium!" }, { quoted: mei })
                return response
            },
            async replyAudio(path) {
                await sock.sendMessage(
                    from, { audio: { url: path }, mimetype: 'audio/mp4', ptt: true }, { quoted: mei }
                )

            },
            async imgBase64(path) {
                var anu = imageToBase64(path) // Path to the image
                return anu

            },
            async replyVideo(path) {
                await sock.sendMessage(
                    from, { video: { url: path }, ptt: true }, { quoted: mei }
                )

            },
            async replyAudio2(path) {
                await sock.sendMessage(
                    from, { audio: { url: path }, mimetype: 'audio/mp4' }, { quoted: mei }
                )

                fs.unlinkSync(path)
            },
            async replySticker(path) {
                await sock.sendMessage(from, { sticker: { url: path } }, { quoted: mei })
            },
            async imagetosticker(path, teks) {
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
                const sticker = await new Sticker("./assets/hmph.mp4", {
                    pack: "Don't Toxic!",
                    author: 'Megumi',
                    type: StickerTypes.FULL,
                    quality: 30
                })
                await sock.sendMessage(from, await sticker.toMessage(), { quoted: mei })
            },
            async megumix() {
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
                        await g.func.imageButton(img[num].image, nama, next)

                    }
                    else {
                        console.log("(page not found) : Retry Now!")
                        return g.func.zerochan(charname, length, next)
                    }
                });
            },
            async imageButton(link, caption, next) {
                let buff = await getBuffer(link)

                const buttons = [
                    { buttonId: next, buttonText: { displayText: 'Next➠' }, type: 1 }
                ]

                const buttonMessage = {
                    image: { url: link },
                    caption: caption,
                    footer: "Megumi Katou",
                    buttons: buttons,
                    headerType: 4
                }

                await sock.sendMessage(from, buttonMessage, { quoted: mei })
            },
          async videotoMp3yt(input, output, title) {

                ffmpeg(input)
                    .output(output)
                    .audioBitrate('192')
                    .addOutputOption("-metadata", `title=${title}`)
                    .addOutputOption("-metadata", `artist=Megumi`)
                    .addOutputOption("-metadata", `album=Megumi MD`)
                    .on('start', function (progress) {
                        g.func.reply("Sedang Mengkonversi Video...")
                    })
                    .on('end', async () => {
                        console.log(`done`)
                        await g.func.replyAudio2(output)
                        fs.unlinkSync(input)
                    }).run()
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
                        if (!owner && !g.is.isPrem) {
                            var panjang = 600;
                        } else {
                            var panjang = 1800;
                        }

                        if (detail.lengthSeconds > panjang) return g.func.reply("Video terlalu panjang!");

                        const text = `*Judul:* ${detail.title}
*Durasi:* ${detail.lengthSeconds} detik
*Channel:* ${detail.author}`

                        let buff = await getBuffer(detail.thumbnail.thumbnails[2].url)

                        const buttons = [
                            { buttonId: `.ytmp4katou ${videoid}`, buttonText: { displayText: '▶ Mp4' }, type: 1 },
                            { buttonId: `.ytmp3katou ${videoid}`, buttonText: { displayText: '▶ Mp3' }, type: 1 }
                        ]

                        const buttonMessage = {
                            location: { jpegThumbnail: buff },
                            caption: text,
                            footer: "Megumi Katou MD",
                            buttons: buttons,
                            headerType: 6
                        }

                        await sock.sendMessage(from, buttonMessage, { quoted: mei })

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
            async isAdmin(number = g.message.sender, f = from) {
                const groupMetadata = group ? await sock.groupMetadata(f) : ''
                const groupMembers = group ? groupMetadata.participants : ''
                const groupAdmins = group ? global.d.getGroupAdmins(groupMembers) : ''
                let response = JSON.stringify(groupAdmins).includes(number) ? true : false
                return response
            }
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
            group,
            owner,
            isPrem,
            isbanned,
            isMute,
            isNotFilterx,
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
                owner: `Exclusivo para o ${conf.owner.nome}!`,
                admin: `Exclusivo para os administradores de grupo!`,
                botadm: `Exclusivo para o bot administrador!`,
                cadastrados: `── 「REGISTRE-SE」 ──\nVocê não está registrado no banco de dados. \n\nComando : ${conf.prefix}cadastrar nome|idade\nExemplo : ${conf.prefix}cadastrar Guilherme|18`,
            }
        },

    }

    if (g.is.cmd && !isbanned && !g.is.isMute) {

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
                    if (!g.func.parameter(body)) {
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
                    if (!g.func.parameter(body)) {
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
                    if (!g.func.parameter(body)) {
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
                        const justanu = fs.readFileSync(`datamegumi/er/${g.func.parameter(body)}.jpg`)
                        const text = `Ini Rekomendasi Signet nya Kapten!`
                        const build = `datamegumi/er/${g.func.parameter(body)}.jpg`
                        g.func.replyImage(build, text)
                    } catch (e) {
                        return g.func.reply("Karakter tidak ditemukan!");
                    }

                    break
                }


            //youtube Mp4
            case `ytmp4katou`:
                {

                    if (!g.func.parameter(body)) {
                        g.func.reply("Format Salah!");
                        break;
                    }


                    try {
                        let path = `./datamegumi/${g.func.parameter(body)}.mp4`
                        ytdl(g.func.parameter(body), { quality: 'highest' }).pipe(fs.createWriteStream(path))
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

                    if (!parameter) {
                        g.func.reply("Format Salah!");
                        break;
                    }
                    const info = await ytdl.getInfo(parameter)
                    console.log("MP3 Convert: " + info.player_response.videoDetails.title)
                    try {
                        let path = `./assets/downloads/${parameter}.mp4`
                        ytdl(parameter, { quality: 'highestaudio' }).pipe(fs.createWriteStream(path))
                            .on('error', (err) => {
                                console.log(err)
                                if (fs.existsSync(path)) fs.unlinkSync(path);
                            })
                            .on('finish', async () => {
                                if (fs.existsSync(path)) {
                                    const num = Math.floor(Math.random() * 10000) + 1;
                                    let path2 = "./assets/downloads/" + num + ".mp3";
                                    await g.func.videotoMp3yt(path, path2, info.player_response.videoDetails.title)
                                } else {
                                    g.func.reply("Terjadi Kesalahan!\nSilakan Ulangi Command")
                                }
                            })
                    } catch (err) {
                        console.log(err)
                    }
                    break;
                }
            //build genshin


            //delete message	
            case `del`:
                {
                    if (!quoted) return g.func.reply("Format Salah!")
                    const msgid = mei?.message?.extendedTextMessage?.contextInfo
                    if (!mei?.message?.extendedTextMessage?.contextInfo?.stanzaId) return g.func.reply("Format Salah!!")
                    let itsme = true
                    if (group) {
                        const groupMetadata = group ? await sock.groupMetadata(from) : ''
                        const groupMembers = group ? groupMetadata.participants : ''
                        const groupAdmins = group ? global.d.getGroupAdmins(groupMembers) : ''
                        if (group && !owner && !JSON.stringify(groupAdmins).includes(sender)) return g.func.reply(`Admin Only`);
                        let isBotAdminGrup = groupMetadata.participants.find(x => x.id === conf.bot.number).admin;
                        if (isBotAdminGrup === 'admin' && msgid.participant !== conf.bot.number) itsme = false
                    }

                    if (itsme == true && msgid.participant !== conf.bot.number) return g.func.reply("Bot Harus menjadi admin untuk menghapus chat anggota lain!")
                    if (msgid.participant !== conf.bot.number && !group) return g.func.reply("Hanya dapat menghapus chat Bot!")
                    if (msgid) {
                        const key = {
                            remoteJid: from,
                            fromMe: itsme,
                            id: msgid.stanzaId,
                            participant: msgid.participant
                        }

                        await sock.sendMessage(from, { delete: key })
                    } else {
                        console.log("Wrong Delete")
                    }
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

                    if (mei.message.extendedTextMessage.contextInfo.quotedMessage[typed].mimetype == 'image/webp') {
                        const path = await g.func.downloadMedia();
                        const img = await webpConverter.webpToJpg(path);


                        if (fs.existsSync(img)) {
                            await g.func.replyImage(img, "Done!")
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
                if (group && !owner && !JSON.stringify(groupAdmins).includes(sender)) return g.func.reply(`Admin Only`);
                let parameter = g.func.parameter(body)
                if (!parameter) parameter = "Anda Telah di Tag oleh Admin!"
                try {
                    var group = await sock.groupMetadata(from)
                    var member = group['participants']
                    var mem = []
                    member.map(async adm => {
                        mem.push(adm.id.replace('c.us', 's.whatsapp.net'))
                    })
                    sock.sendMessage(from, { text: parameter, mentions: mem }, { quoted: mei })
                } catch (e) { g.func.reply("Terjadi Kesalahan \nError:" + e) }
                break
            }

            //banned command
            case 'banned': {

                if (!owner) return g.func.reply('Owner Only!');
                try {

                    const cekk = blockNumber.includes(g.func.parameter(body) + "@s.whatsapp.net");
                    if (cekk) {
                        g.func.reply('Nomor tersebut telah dibanned!')
                    } else {
                        await blockNumber.push(g.func.parameter(body) + "@s.whatsapp.net")
                        fs.writeFileSync('lib/modules/banned.json', JSON.stringify(blockNumber))
                        g.func.reply('Banned Berhasil')

                    }

                } catch (e) { g.func.reply("Terjadi Kesalahan \n" + e) }
                break
            }

            case 'unbanned': {

                if (!owner) return g.func.reply('Owner Only!');
                try {

                    const cekk = blockNumber.includes(g.func.parameter(body) + "@s.whatsapp.net");
                    if (cekk) {
                        const indexban = await blockNumber.indexOf(g.func.parameter(body) + "@s.whatsapp.net")
                        await blockNumber.splice(indexban, 1)
                        fs.writeFileSync('lib/modules/banned.json', JSON.stringify(blockNumber))
                        g.func.reply('Unbanned Berhasil')

                    } else {

                        g.func.reply('Nomor tersebut tidak dibanned!')
                    }

                } catch (e) { g.func.reply("Terjadi Kesalahan \nError:" + e) }
                break
            }

            //Premium
            case 'getpremium': {

                if (!owner) return g.func.reply('Owner Only!');
                try {

                    const cekk = premiumNumber.includes(g.func.parameter(body) + "@s.whatsapp.net");
                    if (cekk) {
                        g.func.reply('Nomor telah premium!')
                    } else {
                        await premiumNumber.push(g.func.parameter(body) + "@s.whatsapp.net")
                        fs.writeFileSync('lib/modules/premium.json', JSON.stringify(premiumNumber))
                        g.func.reply('Premium Berhasil!')

                    }

                } catch (e) { g.func.reply("Terjadi Kesalahan \n" + e) }
                break
            }

            case 'delpremium': {

                if (!owner) return g.func.reply('Owner Only!');
                try {

                    const cekk = premiumNumber.includes(g.func.parameter(body) + "@s.whatsapp.net");
                    if (cekk) {
                        const indexban = await premiumNumber.indexOf(g.func.parameter(body) + "@s.whatsapp.net")
                        await premiumNumber.splice(indexban, 1)
                        fs.writeFileSync('lib/modules/premium.json', JSON.stringify(premiumNumber))
                        g.func.reply('Berhasil menghapus premium')

                    } else {

                        g.func.reply('Nomor tersebut bukan premium!')
                    }

                } catch (e) { g.func.reply("Terjadi Kesalahan \nError:" + e) }
                break
            }

            //VIP
            case 'getvip': {

                if (!owner) return g.func.reply('Owner Only!');
                try {

                    const cekk = vipGroup.includes(from);
                    if (cekk) {
                        g.func.reply('Grup Telah VIP!')
                    } else {
                        await vipGroup.push(from)
                        fs.writeFileSync('lib/modules/vip.json', JSON.stringify(vipGroup))
                        g.func.reply('Grup Berhasil Didaftarkan menjadi VIP!')

                    }

                } catch (e) { g.func.reply("Terjadi Kesalahan \n" + e) }
                break
            }

            case 'delvip': {

                if (!owner) return g.func.reply('Owner Only!');
                try {

                    const cekk = vipGroup.includes(from);
                    if (cekk) {
                        const indexban = await vipGroup.indexOf(from)
                        await vipGroup.splice(indexban, 1)
                        fs.writeFileSync('lib/modules/vip.json', JSON.stringify(vipGroup))
                        g.func.reply('Berhasil menghapus VIP')

                    } else {

                        g.func.reply('Grup ini tidak VIP!')
                    }

                } catch (e) { g.func.reply("Terjadi Kesalahan \nError:" + e) }
                break
            }


            //menu
            case `about`:
            case `help`:
            case `menu`:
                {
                    let teks
                    let buttontext
                    let footer
                    let buttonid
                    if (isPrem) {
                        footer = daftarTeks.menuBot()
                        buttontext = "Owner"
                        buttonid = ".owner"
                        teks = "𝕄𝔼𝔾𝕌𝕄𝕀 𝕂𝔸𝕋𝕆𝕌"
                    } else {
                        teks = daftarTeks.menuBotFree()
                        buttontext = "Premium Now!"
                        buttonid = ".premium"
                        footer = "𝕄𝔼𝔾𝕌𝕄𝕀 𝕂𝔸𝕋𝕆𝕌"
                    }

                    let buff = fs.readFileSync('./assets/megumi-menu.jpg')

                    const buttons = [
                        { buttonId: buttonid, buttonText: { displayText: buttontext }, type: 1 }
                    ]

                    const buttonMessage = {
                        location: { jpegThumbnail: buff },
                        caption: teks,
                        footer: footer,
                        buttons: buttons,
                        headerType: 6
                    }

                    const sendMsg = await sock.sendMessage(from, buttonMessage)

                    break;
                    break;
                }


            case `menupremium`:
            case `premium`:
                {
                    g.func.reply("Hubungi Owner untuk premium")
                    break;
                }


        }
    }


    //Mute Group
    if (g.is.body == ".mute on") {

        if (!group) return g.func.reply(`Hanya Dapat Digunakan di Dalam Grup!`);
        const groupMetadata = group ? await sock.groupMetadata(from) : ''
        const groupMembers = group ? groupMetadata.participants : ''
        const groupAdmins = group ? global.d.getGroupAdmins(groupMembers) : ''
        if (group && !owner && !JSON.stringify(groupAdmins).includes(sender)) return g.func.reply(`Admin Only`);

        try {

            const cekk = mutegroup.includes(from);
            if (cekk) {
                g.func.reply('Group Telah di Mute')
            } else {
                await mutegroup.push(from)
                fs.writeFileSync('lib/modules/mutegroup.json', JSON.stringify(mutegroup))
                g.func.reply('Berhasil masuk ke mode silent')

            }

        } catch (e) { g.func.reply("Terjadi Kesalahan \n" + e) }
        return
    }

    if (g.is.body == ".mute off") {

        if (!group) return g.func.reply(`Hanya Dapat Digunakan di Dalam Grup!`);
        const groupMetadata = group ? await sock.groupMetadata(from) : ''
        const groupMembers = group ? groupMetadata.participants : ''
        const groupAdmins = group ? global.d.getGroupAdmins(groupMembers) : ''
        if (group && !owner && !JSON.stringify(groupAdmins).includes(sender)) return g.func.reply(`Admin Only`);

        try {

            const cekk = mutegroup.includes(from);
            if (cekk) {
                const indexban = await mutegroup.indexOf(from)
                await mutegroup.splice(indexban, 1)
                fs.writeFileSync('lib/modules/mutegroup.json', JSON.stringify(mutegroup))
                g.func.reply('Berhasil mematikan mode silent')

            } else {

                g.func.reply('Grup telah Silent!')
            }

        } catch (e) { g.func.reply("Terjadi Kesalahan \nError:" + e) }
        return
    }

    module.exports = { g }

    await main()
}
