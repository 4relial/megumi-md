const { json } = require('express/lib/response');

exports.main = async () => {
	const { grupo, privado } = require('./modules')
	var { g } = require('./')
	const fs = require('fs')
	const quotesList = JSON.parse(fs.readFileSync("lib/modules/quotes.json", "utf-8"));
	const factList = JSON.parse(fs.readFileSync("lib/modules/fact.json", "utf-8"));
	const mathjs = require("mathjs")
  const { ttdl } = require('./modules/ttdl')
	const genshindb = require('genshin-db')
	const fetch = require("node-fetch")
	const { getBuffer } = require('./functions')
	const { RemoveBgResult, RemoveBgError, removeBackgroundFromImageFile } = require("remove.bg")
	const { TraceMoe } = require("trace.moe.ts")
	const anilist = require('anilist-node')

	const x = g.func;
	const body = g.message.body
	if (g.is.cmd && !g.is.isbanned && !g.is.isMute) {
		let parameter = g.func.parameter(body)

		switch (g.cmd.command) {

			//Quotes		
			case "quotes": {
				const quotes = quotesList[Math.floor(Math.random() * quotesList.length)];
				const text = `_"${quotes.quote}"_\n\n - ${quotes.by}`;
				x.reply(text);
				break
			}
			//Fact
			case "randomfact":
			case "fact": {
				const fact = factList[Math.floor(Math.random() * factList.length)];
				const text = `_${fact}_`;
				x.reply(text);
				break
			}

			case "gi-karakter": {
				if (!parameter) return
				const character = await genshindb.characters(parameter)
				if (!character?.name) return x.reply("Karakter Tidak Ditemukan!")
				console.log(character)
				const text = `*Name:* ${character.name}
*FullName:* ${character.fullname}
*Title:* ${character.title}
*Rarity:* ${character.rarity}
*Vision:* ${character.element}
*WeaponType:* ${character.weapontype}
*Sub Stat:* ${character.substat}
*Gender:* ${character.gender}
*Body:* ${character.body}
*Association:* ${character.association}
*Region:* ${character.region}
*Affiliation:* ${character.affiliation}
*Birthday:* ${character.birthday}
*Constellation:* ${character.constellation}
*Description:* ${character.description}`;
				g.func.replyImage(character?.images?.icon, text)
				break
			}


			//Kalkulator
			case "math":
			case "calc":
			case "kalkulator": {
				if (!parameter) {
					x.reply("Gunakan input yang benar!! , contoh _.math 10+10*10/10_")
					break;
				}
				try {
					const text = `*Hasil Dari:*\n${parameter} = ${mathjs.evaluate(parameter)}`
					x.reply(text)
					break;
				} catch {
					x.reply(`Hanya dapat melakukan operasi perkalian (*), pembagian(/), tambah(+) dan kurang(-)\nContoh: .math 10*2+2-1/9`)
				}
				break;
			}


			case "play":
				{
					if (!parameter) return x.reply(`Format Salah!\nContoh: *.play Moon Halo - Honkai Impact*`)
					g.func.play(parameter)
					break
				}

			//Youtube Downloader	
			case `ytdl`:
				{
					if (!parameter) return x.reply(`Format Salah!\nContoh: *.ytdl https://youtu.be/xREK6gZxYLQ*`)
					g.func.ytdownload(parameter)
					break
				}

			case "in2208":
				{
					if (!parameter) return

					const build = g.is.body
					const panjang = build.length
					const page = build.slice(panjang - 2, panjang)
					const cmdzr = build.slice(0, panjang - 3)
					const name = build.slice(8, cmdzr.length)

					g.func.zerochan(`${name}`, `${page}`, build)

					break
				}

			//Waifu Random
			case "waifu":
				{

						fetch('https://api.waifu.pics/sfw/waifu')
							.then(response => response.json())
							.then(waifu => {
								if (waifu.url) {
									const link = waifu?.url
									g.func.imageButton(link, "Waifu", body)
								} else {
									x.reply("Ulangi Command!")
								}
							})
          break
				}


			case `arknight`:
			case `arknights`:
			case `ak`:
				{
					g.func.zerochan('arknights', 22, body)
					break;
				}
			case `megumi`:
				{
					g.func.zerochan('Katou Megumi', 22, body)
					break;
				}
			case `sagiri`:
				{
					if (!g.is.owner && !g.is.isPrem) return x.notPremium()
					g.func.zerochan('Izumi Sagiri', 60, body)
					break;
				}
			case `chitanda`:
				{
					if (!g.is.owner && !g.is.isPrem) return x.notPremium()
					g.func.zerochan('Chitanda Eru', 60, body)
					break;
				}
			case `emilia`:
				{
					if (!g.is.owner && !g.is.isPrem) return x.notPremium()
					g.func.zerochan('Emilia (Re:Zero)', 99, body)
					break;
				}
			case `elaina`:
				{
					if (!g.is.owner && !g.is.isPrem) return x.notPremium()
					g.func.zerochan('Elaina (Majo no Tabitabi)', 26, body)
					break;
				}
			case `lena`:
				{
					g.func.zerochan("Vladilena Milize", 12, body)
					break;
				}
			case `yorbriar`:
				{
					if (!g.is.owner && !g.is.isPrem) return x.notPremium()
					g.func.zerochan("Yor Briar", 45, body)
					break;
				}
			case `maid`:
				{
					if (!g.is.owner && !g.is.isPrem) return x.notPremium()
					g.func.zerochan("maid+outfit", 99, body)
					break;
				}
			case `anya`:
				{
					if (!g.is.owner && !g.is.isPrem) return x.notPremium()
					g.func.zerochan("Anya Forger", 23, body)
					break;
				}
			case `lily`:
				{
					g.func.zerochan("Assault+Lily+Project", 31, body)
					break;
				}
			case `takagi`:
				{
					g.func.zerochan("Takagi (Karakai Jouzu no Takagi-san)", 16, body)
					break;
				}
			case `kemonomimi`:
				{
					if (!g.is.owner && !g.is.isPrem) return x.notPremium()
					g.func.zerochan("Kemonomimi,female", 20, body)
					break;
				}

			case `azurlane`:
				{
					if (!g.is.owner && !g.is.isPrem) return x.notPremium()
					g.func.zerochan("Azur Lane", 99, body)
					break;
				}
			case `nsfw`:
			case `hentai`:
				{
					x.replySticker('./bonk.webp')
					break;
				}


			//whatanime
			case `whatanime`:
				{
					if (!g.is.owner && !g.is.isPrem) return x.notPremium()
					if (!g.is.img) return x.reply("Format Salah! \nKirim screenshot scene anime dengan caption *.whatanime*")
					const path = await x.downloadMedia();
					const api = new TraceMoe();
					await api.fetchAnimeFromBuffer(fs.readFileSync(path)).then(response => {
						const Anilist = new anilist();
						Anilist.media.anime(response.result[1].anilist).then(data => {
							const text = `Romaji: ${data.title.romaji}
English: ${data.title.english}`
							x.reply(text + "\n\n*Note:* _Pastikan menggunakan screenshot asli dari scene anime yang ingin dicari agar mendapatkan hasil yang sesuai_")
						})
					})
					if (fs.existsSync(path)) {
						fs.unlinkSync(path)
					}
					break;
				}



			//sticker	
			case `s`:
			case `sticker`:
			case `stiker`:
				{

					if (!g.is.img && !g.is.gif && !g.is.video) return x.reply("Format Salah! \nKirim gambar atau gif dengan caption *.sticker*")
					if (g.func.parameter(body) == 'nobg') {
						if (!g.is.owner && !g.is.isPrem) return x.reply("Fitur khusus user premium!")
						const path = await x.downloadMedia();
						let teks = "Your Sticker"
						//nobg

						const outputFile = `img(${g.message.sender}).png`;

						const result = await removeBackgroundFromImageFile({
							path: path,
							apiKey: "Yout Apikey",
							size: "regular",
							type: "auto",
							scale: "100%",
							outputFile
						})
						fs.unlinkSync(path)
						x.imagetosticker(outputFile)
						return
					}
					const path = await x.downloadMedia();
					let teks = "Your Sticker"
					if (g.func.parameter(body)) {
						teks = g.func.parameter(body)
					}

					x.imagetosticker(path, teks)

					break;
				}

			case `stikerxxx228`:
				{

					if (!g.is.img && !g.is.gif && !g.is.video) return x.reply("Format Salah! \nKirim gambar atau gif dengan g.func.parameter(body)ion *.sticker*")
					const path = await x.downloadMedia();
					let teks = "Your Sticker"
					if (g.func.parameter(body)) {
						teks = g.func.parameter(body)
					}

					x.imagetosticker2(path, teks)

					break;
				}

			//Tiktok Downloader
			//Tiktok Downloader
			case "tiktok":
			case "tiktokdl":
				{
					if (!parameter) return x.reply("Format Salah! \nContoh: .tiktok https://www.tiktok.com/@kyusako/video/7064913329122250011")
					try {
						const anu = await ttdl(parameter)
						console.log(anu)
						if (anu.nowm) {
							await x.replyVideo(anu.nowm)
						} else {
							await x.reply("Tidak ditemukan!")
						}
					} catch (e) {
						x.reply("Video tidak ditemukan atau link tidak valid!")
					}
					break
				}
		}


















	} else {

		if (g.is.body == 'assalamualaikum' || g.is.body == 'Assalamualaikum') {
			x.reply("Wa'alaikumussalam")
		} else if (g.is.body == 'p' || g.is.body == 'P' || g.is.body == 'bot' || g.is.body == 'Bot') {
			x.reply('👋👋')
		} else if (!g.is.group && !g.is.cmd) {
			x.reply('Ketik *.help* Untuk Membuka Menu!')
		}

		const bd = g.is.body.toLowerCase()
		const z = bd.search(/\bkontol\b/)
		const z1 = bd.search(/\bmemek\b/)
		const z2 = bd.search(/\basu\b/)
		const z3 = bd.search(/\bkntl\b/)
		const z4 = bd.search(/\bbgsd\b/)
		const x3 = bd.search(/\bmegumi\b/)
		const x2 = bd.search(/\bohayo/)
		const x1 = bd.search(/\bbot\b/)


		if (!g.is.isbanned && (z !== -1 || z1 !== -1 || z2 !== -1 || z3 !== -1 || z4 !== -1) && !g.is.group) {
			x.reply("⚠️ Chat telah dilaporkan ke Owner!")
			const report = "*Kata Kasar terdeteksi!*\nJID: " + g.message.sender + "\nChat: _" + body + "_"
			x.report(report)
		} else if (!g.is.isbanned && (z !== -1 || z1 !== -1 || z2 !== -1 || z3 !== -1 || z4 !== -1) && (x2 !== -1 || x1 !== -1)) {
			x.reply("⚠️ Chat telah dilaporkan ke Owner!")
			const report = "*Kata Kasar terdeteksi!*\nJID: " + g.message.sender + "\nGrup ID: " + g.message.from + "\nChat: _" + body + "_"

			x.report(report)
		} else if (!g.is.isbanned && (z !== -1 || z1 !== -1 || z2 !== -1 || z3 !== -1 || z4 !== -1)) {
			x.replySticker('./Angry!.webp')
		} else if (!g.is.isbanned && (x2 !== -1 || x3 !== -1)) {
			x.replySticker('./^_^.webp')
		} else if (bd.search(/\baksal\b/) !== -1) {
			x.replySticker('./Angry!2.webp')
		}
	}
}
