const express = require('express');
const app = express();
const cors = require('cors')
require('dotenv').config()
require('./src/database/config')
const  router=require('./src/router/index')
// -------------------- cors allowing code-----------------------------
app.use(cors());
app.use(express.json())


//------------------ Test api for check project is running or not ------------------------
app.get('/', (req, res) => {
    res.send("Hello Guy's Welcome To My Crud Operation Project")
})

//-------------------api main route-----------------------
app.use('/api/v1',router);



//------------------------ connection code for socket io.------------------------
const http = require('http').createServer(app)
const io = require('socket.io')(http, {
    cors: {
        origin: '*', //["http://3.137.153.221:3006","http://143.244.210.208"],//["http://3.137.153.221:3006", "http://3.137.153.221:3000","http://localhost:3006","http://localhost:3000", "http://143.244.210.208:3006","http://143.244.210.208:3006"],
        methods: ["GET", "POST"],
        allowedHeaders: ["Access-Control-Allow-Origin", "*", "Access-Control-Allow-Headers",
            "Origin, X-Requested-With, Content-Type, Accept, Authorization"
        ],
        credentials: true
    }
})

//------------------------ to get public folder access ------------------------------
app.use(express.static('public'));

//------------------------- for chat connection check ------------------------------
app.get('/chat', (req, res) => {
    res.render('index.html')
});

io.on('connection', socket => {
    console.log("Socket Connection Is Running Successfully", socket.id)
    socket.on('disconnect', () => {
        console.log("Socket Disconnected Successfully", socket.id)
    })
    socket.on("message", async message => {
        let msg = await chat.chatMessage(message);
        io.emit("message", {
            "message": msg
        });
    });
})

//----------------------------- local server port run code ------------------------------
http.listen(process.env.PORT, () => {
    console.log('Server Running On Port No =', process.env.PORT)
})