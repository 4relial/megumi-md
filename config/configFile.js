exports.testMode = false


exports.info = {
    prefix: this.testMode ? '.' : '#',
	prefix2: this.testMode ? '!' : '.',
    owner: {
        nome: "Tomoya Aki",
        numero: ["6289515275674@s.whatsapp.net"]
    },
    grupo: ""
}

exports.connectionFileName = () => {
    var path = './node_modules/'
    return path + (this.testMode ? 'wabasemdConnectionTest.json' : 'WAConnection.json')
}