var express = require('express')
var http = require('http');
var app = express();
var server = http.createServer(app);
var port = process.env.PORT || 3000;
 
server.listen(port, function() {
   console.log('Listening on ' + port);
});
 
app.get('/', function (request, response) {
   response.sendfile(__dirname + '/index.html');
});

var WebSocketServer = require("ws").Server
var wss = new WebSocketServer({server: server})
 
wss.on("connection", function(ws) {
  console.log("websocket connection open")
  var msg = {
      type: "news",
      data: "hello world"
  }
  ws.send(JSON.stringify(msg));
 
  ws.onmessage = function(d) {
    msg = JSON.parse(d.data);
    console.log("websocket messsage received")
    console.log(msg);
  };
});