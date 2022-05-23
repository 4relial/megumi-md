let messages = []

function deleteMessage(messageID) {
    delete messages[messageID]
}
function saveMessage(messageID, txt) {
    messages[messageID] = txt
}
function getMessage(messageID) {
    return messages[messageID]

}
function clearMessages() {
    messages = []
}
setInterval(clearMessages, 120000)

module.exports = {
    getMessage,
    saveMessage,
    deleteMessage
}