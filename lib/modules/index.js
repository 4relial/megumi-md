var { global } = require('../global')

exports.grupo = async () => {
    var { g } = require('../')
	
}

exports.privado = async () => {
    var { g } = require('../')

    await g.sock.sendMessage(g.message.from, { text: 'Welcome' })
}