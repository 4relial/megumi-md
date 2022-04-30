exports.testMode = false


exports.info = {
    prefix: this.testMode ? '.' : '#',
	prefix2: this.testMode ? '!' : '.',
    dono: {
        nome: "Tomoya Aki",
        numero: ["6289515275674@s.whatsapp.net"]
    },
    premium: {
        number: ["6289515457047@s.whatsapp.net","62895361892629@s.whatsapp.net","6285280341639@s.whatsapp.net"]
    },
    grupo: ""
}

exports.connectionFileName = () => {
    var path = './.megumisecret/'
    return path + (this.testMode ? 'wabasemdConnectionTest.json' : 'WAConnection.json')
}