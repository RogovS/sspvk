var express = require('express');
var http = require('http');
var VK = require('vksdk');
var cheerio = require('cheerio');
var request = require('request');
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
var collection_post = 'post';

var vk = new VK({
   'appId'     : 5019588,
   'appSecret' : 'dhk6znlyjSVdA3o4DTBt',
   'language'  : 'ru'
});

var vkID = 16202769;
var domain = 'khl';
var count = 10;
var idpost = new Array(0);

request({
   method: 'POST',
   url: 'https://vk.com/'.concat(domain)
   }, 
   function(err, response, body) {
   if (err) return console.error(err);

   $ = cheerio.load(body);
   $('div.post.all.own').each(function() {
      idpost[idpost.length] = $(this).attr("id").substr($(this).attr("id").indexOf('_')+1,$(this).attr("id").length);
   });

    
function AddDataInBD(db,collection,data) {
   this.db = db;
   this.collection = collection;
   this.EntryInDB = function() {
      db.collection(collection).update(
         { id: data.id }, 
         data,
         { upsert:true },
         function (error, count, status) {
            //console.log(error);
            //console.log(count);
            //console.log(status);
         }
      );
   };
}
      
vk.setSecureRequests(false);
vk.request('wall.get', {'domain': domain, 'count': count}, 'post');
vk.on('post', function(data) {
   
   var VKGroupPost = new Array(count);
   for (var i = 0; i < count; i++) {
      VKGroupPost[i] = {
         id: idpost[i],
         comments: data.response.items[i].comments,
         likes: data.response.items[i].likes,
         reposts: data.response.items[i].reposts,
         text: data.response.items[i].text,
      };
      
      var RecordableVKPostInBD = new AddDataInBD(connectionClientData, collection_post, VKGroupPost[i]);
      RecordableVKPostInBD.EntryInDB();
   }
   
});

vk.setSecureRequests(false);
vk.request('groups.getById', {'group_id': "khl", 'fields': 'site,description'}, 'event');
vk.on('event', function(data) {
   
   var VKAboutGroup = {
      id: data.response[0].id,
   	name: data.response[0].name,
   	description: data.response[0].description,
   	photo_200: data.response[0].photo_200,
   	site: data.response[0].site
   };
   
   var RecordableVKGroupInBD = new AddDataInBD(connectionClientData, collection_aboutgroup, VKAboutGroup);
   RecordableVKGroupInBD.EntryInDB();

});

});

wss.on("connection", function(ws) {
   console.log("websocket connection open");
   connectionClientData.collection(collection_aboutgroup).findOne(
   {
      id: vkID
   },
   function(err, doc)
   {
      if (err) { console.log("Ошибка!!"); }
      if (doc) 
      { 
         console.log(doc); 
         var msg = {
            type: "abouGroup",
            data: doc
         };
         console.log(msg.data);
         ws.send(JSON.stringify(msg));
         ws.onmessage = function(d) {
         msg = JSON.parse(d.data);
         console.log("websocket messsage received");
         console.log(msg);
         };
      }
   });
   
   /*console.log(connectionClientData.collection(collection_post).find())
   {
      "sort": "likes",
      "limit": 10,
      "skip": 3
   },
   {
      text: true,
      likes: true,
      comments: true,
      reposts: true
   },
   function(err, doc)
   {
      if (err) { console.log("Ошибка!!"); }
      if (doc) 
      { 
         console.log(doc); 
         var msg = {
            type: "likes",
            data: doc
         };
         console.log(msg.data);
         ws.send(JSON.stringify(msg));
         ws.onmessage = function(d) {
         msg = JSON.parse(d.data);
         console.log("websocket messsage received");
         console.log(msg);
         }; 
      }
   });*
  
});