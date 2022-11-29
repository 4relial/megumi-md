const fetch = require('node-fetch')
const axios = require('axios')
const cfonts = require('cfonts')
const spin = require('spinnies')
const Crypto = require('crypto')
const imageToBase64 = require('image-to-base64')

//YTDL QEUEUE
const ytmp4k = new Set()

const isYTprocess = (from) => {
    return !!ytmp4k.has(from)
}
const addYTprocess= (from) => {
    ytmp4k.add(from)
}
const delYTprocess= (from) => {
        return ytmp4k.delete(from)
}


//spam Non premium
const usedCommandRecently = new Set()

const isSpam = (from) => {
    return !!usedCommandRecently.has(from)
}
const addSpam = (from) => {
    usedCommandRecently.add(from)
    setTimeout(() => {
        return usedCommandRecently.delete(from)
    }, 2000) // 2s detik Delay
}
  
const h2k = (number) => {
    var SI_POSTFIXES = ["", " K", " M", " G", " T", " P", " E"]
    var tier = Math.log10(Math.abs(number)) / 3 | 0
    if(tier == 0) return number
    var postfix = SI_POSTFIXES[tier]
    var scale = Math.pow(10, tier * 3)
    var scaled = number / scale
    var formatted = scaled.toFixed(1) + ''
    if (/\.0$/.test(formatted))
      formatted = formatted.substr(0, formatted.length - 2)
    return formatted + postfix
}

const getBuffer = async (url, options) => {
	try {
		options ? options : {}
		const res = await axios({
			method: "get",
			url,
			headers: {
				'DNT': 1,
				'Upgrade-Insecure-Request': 1
			},
			...options,
			responseType: 'arraybuffer'
		})
		return res.data
	} catch (e) {
		console.log(`Error : ${e}`)
	}
}

const Base64 = async (url) => {
	imageToBase64(url) // Path to the image
    .then(
        (response) => {
            console.log('base64 Convert'); // "cGF0aC90by9maWxlLmpwZw=="
            return response
        }
    )
    .catch(
        (error) => {
            console.log(error); // Logs an error if there was one
        }
    )
}

const randomBytes = (length) => {
    return Crypto.randomBytes(length)
}

const generateMessageID = () => {
    return randomBytes(10).toString('hex').toUpperCase()
}

const getGroupAdmins = (participants) => {
	admins = []
	for (let i of participants) {
		i.isAdmin ? admins.push(i.jid) : ''
	}
	return admins
}

const getRandom = (ext) => {
	return `${Math.floor(Math.random() * 10000)}${ext}`
}

const spinner = { 
  "interval": 120,
  "frames": [
    "🕐",
    "🕑",
    "🕒",
    "🕓",
    "🕔",
    "🕕",
    "🕖",
    "🕗",
    "🕘",
    "🕙",
    "🕚",
    "🕛"
  ]}

        let globalSpinner;


        const getGlobalSpinner = (disableSpins = false) => {
        if(!globalSpinner) globalSpinner = new spin({ color: 'blue', succeedColor: 'green', spinner, disableSpins});
        return globalSpinner;
        }

        spins = getGlobalSpinner(false)

        const start = (id, text) => {
	       spins.add(id, {text: text})
		/*setTimeout(() => {
			spins.succeed('load-spin', {text: 'Suksess'})
		}, Number(wait) * 1000)*/
	       }
        const info = (id, text) => {
	       spins.update(id, {text: text})
        }
        const success = (id, text) => {
	       spins.succeed(id, {text: text})

	       }

        const close = (id, text) => {
	       spins.fail(id, {text: text})
        }
 
            const banner = cfonts.render(('zeevalya'), {
                font: 'block',
                color: 'system',
                align: 'left',
                gradient: ["red","white"],
                lineHeight: 2
                });



module.exports = {
  YT: {
        isYTprocess,
        addYTprocess,
        delYTprocess
    },
  Spam: {
        isSpam,
        addSpam,
    }, getBuffer, h2k, Base64, generateMessageID, getGroupAdmins, getRandom, start, info, success, banner, close
                 }