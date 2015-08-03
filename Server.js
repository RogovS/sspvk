var express = require('express');
var http = require('http');
var VK = require('vksdk');
var app = express();
var server = http.createServer(app);
var port = process.env.PORT || 3000;
 
server.listen(port, function() {
   console.log('Listening on ' + port);
});
 
app.get('/', function (request, response) {
   response.sendfile(__dirname + '/index.html');
});

var WebSocketServer = require("ws").Server;
var wss = new WebSocketServer({server: server});

var mongo = require('mongoskin');
var connectionBigData = mongo.db("mongodb://admin:admin@ds035240.mongolab.com:35240/bigdata");
var connectionClientData = mongo.db("mongodb://admin:admin@ds043991.mongolab.com:43991/clientdata");

var collection_wall = 'wall';
var collection_aboutgroup = 'aboutgroup';
var collection_top = 'top';

var vk = new VK({
   'appId'     : 5019588,
   'appSecret' : 'dhk6znlyjSVdA3o4DTBt',
   'language'  : 'ru'
});

vk.setSecureRequests(false);
vk.request('groups.getById', {'group_id': "khl", 'fields': 'description'}, 'event');
vk.on('event', function(data) {
   
   var VKAboutGroup = {
      id: data.response[0].id,
   	name: data.response[0].name,
   	description: data.response[0].description,
   	photo_200: data.response[0].photo_200
   };
   
   function AddDataInBD(db,collection,data) {
      this.db = db;
      this.collection = collection;
      this.EntryInDB = function() {
         db.collection(collection).update(
            { id: data.id }, 
            data,
            { upsert:true },
            function (error, count, status) {
               console.log(error);
               console.log(count);
               console.log(status);
            }
         );
      };
   }
   
   var RecordableVKPostInBD = new AddDataInBD(connectionClientData, collection_aboutgroup, VKAboutGroup);
   RecordableVKPostInBD.EntryInDB();

});

wss.on("connection", function(ws) {
  console.log("websocket connection open");
  connectionClientData.collection(collection_aboutgroup).findOne(
   {
      id: 16202769
   },
   function(err, doc)
   {
      if (err) { console.log("Ошибка!!"); }
      if (doc) 
      { 
         console.log(doc); 
         var msg = {
            type: "news",
            data: doc
         };
         ws.send(JSON.stringify(msg));
         ws.onmessage = function(d) {
            msg = JSON.parse(d.data);
            console.log("websocket messsage received");
            console.log(msg);
         };
      }
   });
  
});