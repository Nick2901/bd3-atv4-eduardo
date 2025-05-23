const express = require("express");
const http = require("http");
const ejs = require("ejs");
const path = require("path");
const socketIO = require("socket.io");
const mongoose = require("mongoose");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Configurações de visualização
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'public'));
app.engine('html', ejs.renderFile);
app.set('view engine', 'html');

// Rota principal
app.get('/', (req, res) => {
    res.render('index.html');
});

// Conexão com MongoDB
function connectDB() {
    let dbURL = 'mongodb+srv://eduardo:Nick2901@cluster0.vn3gv.mongodb.net/';
    mongoose.connect(dbURL);
    mongoose.connection.on('error', console.error.bind(console, 'Connection error:'));
    mongoose.connection.once('open', function () {
        console.log('ATLAS MONGODB CONECTADO COM SUCESSO!');
    });
}
connectDB();

let Post = mongoose.model('Post', {
    data_hora: String,
    titulo: String,
    post: String
});

let posts = [];
Post.find({})
    .then(docs => posts = docs)
    .catch(error => console.log(error));

// SOCKET.IO
io.on('connection', socket => {
    console.log('NOVO USUÁRIO CONECTADO: ' + socket.id);
    socket.emit('previousPosts', posts);

    socket.on('sendPost', data => {
        let post = new Post(data);
        post.save().then(() => {
            posts.push(data);
            socket.broadcast.emit('receivedPost', data);
        }).catch(error => console.log(error));
    });

    console.log('QTD POSTS: ' + posts.length);
});

server.listen(3000, () => {
    console.log("💻 rede social rodando em http://localhost:3000");
});
