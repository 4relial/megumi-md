exports.testMode = false


exports.info = {
    prefix: this.testMode ? '.' : '#',
	prefix2: this.testMode ? '!' : '.',
    dono: {
        nome: "Tomoya Aki",
        numero: ["6289515275674@s.whatsapp.net"]
    },
    premium: {
        number: [""]
    },
    grupo: ""
}

exports.connectionFileName = () => {
    var path = './node_modules/secret/'
    return path + (this.testMode ? 'wabasemdConnectionTest.json' : 'wabasemdConnection.json')
}