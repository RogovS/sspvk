var express = require('express');
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

var WebSocketServer = require("ws").Server;
var wss = new WebSocketServer({server: server});

var mongo = require('mongoskin');
var conn = mongo.db("mongodb://admin:admin@ds035240.mongolab.com:35240/bigdata");

var script = document.createElement('script');
script.src = '//vk.com/js/api/openapi.js';
document.getElementsByTagName('head')[0].appendChild(script);

VK.init(function() {
			console.log('API initialization true');
			VK.api('users.get', {test_mode: 1, fields:"screen_name"}, function(data) {  
				if (data.error)
			      alert('error!'+data.error);
			   else {
			   	var a = data.response[0].screen_name;  
			   	$("#screen_name").attr('class',a);
			      $("#user").append('Привет, ' + data.response[0].first_name + ' ' + data.response[0].last_name);
			   }
			});
			VK.api("friends.getAppUsers", {test_mode: 1}, function (data) {
				if (data.response != null) {
					console.log('getAppUsers', data.response);
					alert("!!!! " + data.response);
				}
			});
			
		}, function() { 
			 console.log('API initialization failed');
		}, '5.33');

function AddPostInBigDataDB(db,collection,post) {
   this.db = db;
   this.collection = collection;
   this.post = post;
   this.EntryInDB = function() {
      conn.collection(collection).update(
         { post: post.post },
         { post: post.post, comment: post.comment, like: post.like },
         { upsert:true },
         function (error, count, status) {
            console.log(error);
            console.log(count);
            console.log(status);
         }
      );
   };
}

var VKPost = {
   post: 10,
   comment: 2,
   like: 12
};

var collection = 'wall';

var RecordableVKPostInBD = new AddPostInBigDataDB(conn, collection, VKPost);
RecordableVKPostInBD.EntryInDB();

/*wss.on("connection", function(ws) {
  console.log("websocket connection open");
  var msg = {
      type: "news",
      data: "hello world"
  };
  ws.send(JSON.stringify(msg));
 
  ws.onmessage = function(d) {
    msg = JSON.parse(d.data);
    console.log("websocket messsage received");
    console.log(msg);
  };
});

wss.on("connection", function(ws) {
   console.log("websocket connection open");
  
   var mongo = require('mongoskin');
   var conn = mongo.db("mongodb://admin:admin@ds041032.mongolab.com:41032/gamevk");
   var id, summary;
   
      var msg = {
         type: "news",
         data: "hello world"
      };
      
      ws.send(JSON.stringify(msg));
    
      ws.onmessage = function(event) {
         
         var type = JSON.parse(event.data).type;
         
         switch (type) {
            case "result":
               event = JSON.parse(event.data);
               id = event.id;
               summary = event.summary;
               console.log("id " + id);
               console.log("summary " + summary);
               conn.collection('players').update(
                  { id: id },
                  { id: id, summary: summary },
                  { upsert:true },
                  function (err, count, status) {
                     console.log(err);
                     console.log(count);
                     console.log(status);
                  }
               );
               break;
            case "init":
               var idU= JSON.parse(event.data).id;
               console.log("idU " + idU);
               conn.collection('players').findOne(
               {
                  id: idU
               },
               function(err, doc)
               {
                  if (err) {   }
                  if (doc) { 
                     var summaryUser = {
                        summary: doc.summary
                     }; 
                     console.log("summaryUser " + summaryUser.summary);
                     ws.send(JSON.stringify(summaryUser));
                  }
                  if (!doc) {
                     conn.collection('players').update(
                        { id: idU },
                        { id: idU, summary: "0" },
                        { upsert:true },
                        function (err, count, status) {
                           console.log(err);
                           console.log(count);
                           console.log(status);
                        }
                     );
                     summaryUser = {summary: "0" };
                     ws.send(JSON.stringify(summaryUser));
                  }
               });
               break;
            default:
               break;
         }
      };
});*/