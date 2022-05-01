const { json } = require('express/lib/response');

exports.main = async () => {
	const { grupo, privado } = require('./modules')
	var { g } = require('./')
	const fs = require('fs')
	const quotesList = JSON.parse(fs.readFileSync("lib/modules/quotes.json", "utf-8")); const factList = JSON.parse(fs.readFileSync("lib/modules/fact.json", "utf-8"));
	const mathjs = require("mathjs")
	const tiktok = require('tiktok-scraper-without-watermark')
	const genshindb = require('genshin-db')
	const { getBuffer } = require('./functions')
	const { RemoveBgResult, RemoveBgError, removeBackgroundFromImageFile } = require("remove.bg")

	const x = g.func;
	const parameter = g.is.capt;
	if (g.is.cmd) {

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

			case "gi-material":
			case "materialgi": {
				if (!capt) return x.reply(`Format Salah!\nContoh: *.gi-material ayaka*`);
				try {

					const build = fs.readFileSync(`datamegumi/materialgi/${capt}.jpg`)
					x.replyImage(`datamegumi/materialgi/${capt}.jpg`)
				} catch (e) {
					g.func.reply(`Karakter Tidak Ditemukan`);
				}
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

			//Genshin Build
			case "buildgi":
			case "builgi":
			case "gi-build":
				{
					if (!capt) return x.reply(`Format Salah!\nContoh: *.gi-build ayaka*`);
					try {

						const build = fs.readFileSync(`datamegumi/buildgi/${capt}.jpeg`)
						x.replyImage(`datamegumi/buildgi/${capt}.jpeg`)
					} catch (e) {
						g.func.reply(`Karakter Tidak Ditemukan`);
					}
					break
				}

			case "play":
				{
					if (!parameter) return
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


					x.replyImage("https://pic.re/image/long_hair")
					break
				}


			case `arknight`:
			case `ak`:
				{
					g.func.zerochan('Arknights', 99, body)
					break;
				}
			case `megumi`:
				{
					g.func.zerochan('Katou Megumi', 22, body)
					break;
				}
			case `sagiri`:
				{
					if (!g.is.dono && !g.is.isPrem) return x.reply("Fitur khusus user premium!")
					g.func.zerochan('Izumi Sagiri', 60, body)
					break;
				}
			case `chitanda`:
				{
					g.func.zerochan('Chitanda Eru', 60, body)
					break;
				}
			case `emilia`:
				{
					g.func.zerochan('Emilia (Re:Zero)', 99, body)
					break;
				}
			case `elaina`:
				{
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
					g.func.zerochan("Yor Briar", 27, body)
					break;
				}
			case `anya`:
				{
					g.func.zerochan("Anya Forger", 18, body)
					break;
				}
			case `azurlane`:
				{
					if (!g.is.dono && !g.is.isPrem) return x.reply("Fitur khusus user premium!")
					g.func.zerochan("Azur Lane", 99, body)
					break;
				}



			//sticker	
			case `s`:
			case `sticker`:
			case `stiker`:
				{

					if (!g.is.img && !g.is.gif && !g.is.video) return x.reply("Format Salah! \nKirim gambar atau gif dengan caption *.sticker*")
					const path = await x.downloadMedia();
					let teks = "Your Sticker"
					//nobg
					if (capt == 'nobg') {
						if (!g.is.dono && !g.is.isPrem) return x.reply("Fitur khusus user premium!")

						const outputFile = `img(${g.message.sender}).png`;

						const result = await removeBackgroundFromImageFile({
							path: path,
							apiKey: "ar97RG3enrYcY5hKHyE4yej8",
							size: "regular",
							type: "auto",
							scale: "100%",
							outputFile
						})
						fs.unlinkSync(path)
						x.imagetosticker(outputFile)
						return
					}
					//nobg
					if (capt) {
						teks = capt
					}

					x.imagetosticker(path, teks)

					break;
				}

			case `stikerxxx228`:
				{

					if (!g.is.img && !g.is.gif && !g.is.video) return x.reply("Format Salah! \nKirim gambar atau gif dengan caption *.sticker*")
					const path = await x.downloadMedia();
					let teks = "Your Sticker"
					if (capt) {
						teks = capt
					}

					x.imagetosticker2(path, teks)

					break;
				}

			//Tiktok Downloader
			case "tiktok":
			case "tiktokdl":
				{
					if (!parameter) return x.reply("Format Salah! \nContoh: .tiktok https://www.tiktok.com/@kyusako/video/7064913329122250011")
					tiktok.tiktokdownload(parameter)
						.then(async (result) => {
							if (!result?.nowm) return x.reply("Video Tidak Ditemukan!")
							console.log('Video Tiktok Ditemukan, Mengirim.....')
							nowm = result?.nowm
							await x.replyVideo(nowm)
						})
						.catch(e => {
							console.log(e)
							x.reply("Error")
						})
					break
				}
		}


















	} else {

		if (g.is.body == 'p' || g.is.body == 'P') {
			x.reply('👋👋')
		}
		if (g.is.body == 'assalamualaikum' || g.is.body == 'Assalamualaikum') {
			x.reply("Wa'alaikumussalam")
		}
		if (!g.is.group && !g.is.cmd) {
			x.reply('Ketik *.help* Untuk Membuka Menu!')
		}

		const bd = g.is.body.toLowerCase()
		const z = bd.search(/\bkontol\b/)
		const z1 = bd.search(/\bmemek\b/)
		const z2 = bd.search(/\basu\b/)
		const z3 = bd.search(/\bkntl\b/)
		const z4 = bd.search(/\bbgsd\b/)
		const x1 = bd.search(/\bbot\b/)
		const x3 = bd.search(/\bmegumi\b/)
		const x2 = bd.search(/\bohayo/)
		const x4 = bd.search(/\bselamat\b/)
		const x5 = bd.search(/\blove\b/)


		if (z !== -1 || z1 !== -1 || z2 !== -1 || z3 !== -1 || z4 !== -1) {
			x.replySticker('./Angry!.webp')
		} else if (x1 !== -1 || x2 !== -1 || x3 !== -1 || x4 !== -1 || x5 !== -1) {
			x.replySticker('./^_^.webp')
		} else if (bd.search(/\baksal\b/) !== -1) {
			x.replySticker('./Angry!2.webp')
		}
	}
}