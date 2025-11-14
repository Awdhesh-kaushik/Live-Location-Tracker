const express = require('express');
const app = express();
const path=require("path");



const http =require("http"); //socketio runs on http
const socketio =require("socket.io");  //
const server = http.createServer(app); //node mein http preinstalled ata hai //it will give me a server
const io =socketio(server); //calling socket io

const connectedClients = new Set();

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));


io.on("connection", function(socket){
    connectedClients.add(socket.id);
    io.emit("update-clients", Array.from(connectedClients));

    socket.on("send-location", function(data){
        console.log("Received location from", socket.id, ":", data);
        io.emit("receive-location", {id: socket.id, ...data});
    });
    console.log("connected");

    socket.on("disconnect", function(){
        connectedClients.delete(socket.id);
        io.emit("update-clients", Array.from(connectedClients));
        io.emit("user-disconnected", socket.id);
    });
});


app.get("/", function(req, res){
    res.render("index");
});

server.listen(3000);
