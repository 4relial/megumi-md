let { Start } = require("./index")
const fs = require('fs')
const rimraf = require('rimraf')

Start()

rimraf('./assets/downloads/*', function () {
  console.log('Data Dihapus!') 
})

//WEB SERVER

const express = require("express")
const cors = require("cors")
const request = require("request")
const got = require("got")


const app = express();

app.use(cors());
app.use(express.json());


app.get("/", (req, res) => {
    if (fs.existsSync('./img.png')) {
        res.sendFile(__dirname + '/img.png')
    } else {
        res.sendFile(__dirname + '/megumi.html')
    }

});

app.get("/ping", (req, res) => {
        res.sendFile(__dirname + '/ping.html')
});



const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log("Megumi Server is Active in Port: " + PORT);
});


          //WEB SERVER
