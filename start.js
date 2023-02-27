//WEB SERVER
let { startSock } = require("./index.js")
const express = require("express")
const cors = require("cors")
const request = require("request")
const got = require("got")
const fs = require('fs')


const app = express();
app.use(cors());
app.use(express.json());


app.get('/gambar', (req, res) => {
  const path = __dirname + '/img.png';
  const path2 = __dirname + '/done.jpg';
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  if (fs.existsSync('./img.png')) {
    res.sendFile(path, (err) => {
      if (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
      }
    });
  } else {
    res.sendFile(path2, (err) => {
      if (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
      }
    });
  }
});

app.get("/", (req, res) => {
  if (fs.existsSync('./img.png')) {
    res.sendFile(__dirname + '/qr.html')
  } else {
    res.sendFile(__dirname + '/megumi.html')
  }

});

app.get('/ping', function(req, res) {
  const ipAddress = req.socket.remoteAddress;
  res.send(ipAddress);
});


app.get("/restart", (req, res) => {
  try {
    res.sendFile(__dirname + '/ping.html')
  } finally {
    var sys = require('sys')
    var exec = require('child_process').exec;

    function puts(error, stdout, stderr) { sys.puts(stdout) }
    exec("kill 1", function(err, stdout, stderr) {
      console.log(stdout);
    })
  }
})

app.get("/del", (req, res) => {
  if (fs.existsSync('./multi_state/store.json')) {
    fs.unlinkSync('./multi_state/store.json')
  }

  res.sendFile(__dirname + '/ping.html')

})

startSock()

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log("Megumi Server is Active in Port: " + PORT);
});
