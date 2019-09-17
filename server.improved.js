const low = require('lowdb')
var express = require('express')
//const adapter = new LocalStorage('db')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('db.json')
const db = low(adapter)
var app = express();
const uuidv4 = require('uuid/v4');

db.defaults({
  members: [{
      "firstname": "Luke",
      "lastname": "Skywalker",
      "major": "Lightsaber Construction",
      "uuid": "f5701299-05f8-4ca0-a904-fa6fdfd3718c"
    },
    {
      "firstname": "Obi-Wan",
      "lastname": "Kenobi",
      "major": "Taking the High Ground",
      "uuid": "524dee4e-b72e-49e2-adf2-e4907db45fda"
    }
  ]
}).write();

app.use(express)

const http = require("http"),
  fs = require("fs"),
  mime = require("mime"),
  dir = "public/",
  port = 3000;

/*app.get("/", function(request, response) {
response.sendFile(__dirname + '/public/index.html');
});)

app.get("/users", function(request, response) {
  var dbUsers = [];
  var users = db.get('users').value() // Find all users in the collection
  users.forEach(function(user) {
    dbUsers.push([user.firstname, user.lastname, user.major]); // adds their info to the dbUsers value
  });
  response.send(dbUsers); // sends dbUsers back to the page
});

app.post("/users", function (request, response) {
  db.get('users')
    .push({ firstname: request.query.firstname, lastname: request.query.lastname, major: request.query.major })
    .write()
  console.log("New user inserted in the database");
  response.sendStatus(200);
});

var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});*/

/*const appdata = [{
    "firstname": "Luke",
    "lastname": "Skywalker",
    "major": "Lightsaber Construction",
    "year": 1596,
    "graduated": "Yes",
    "velocity": "42 m/s"
  },
  {
    "firstname": "Obi-Wan",
    "lastname": "Kenobi",
    "major": "Taking the High Ground",
    "year": 1554,
    "graduated": "Yes",
    "velocity": "11 m/s"
  }
];*/

const server = http.createServer(function(request, response) {
  if (request.method === "GET") {
    handleGet(request, response);
  } else if (request.method === "POST") {
    handlePost(request, response);
  }
});

const handleGet = function(request, response) {
  const filename = dir + request.url.slice(1);
  if (request.url === "/") {
    sendFile(response, "public/index.html")
  } else if (request.url === "/getdata") {
    sendData(response, db.get('members').value() /*appdata*/);
  } else {
    sendFile(response, filename);
  }
};

const handlePost = function(request, response) {
  let dataString = "";

  request.on("data", function(data) {
    dataString += data
  });

  request.on("end", function() {
    switch (request.url) {
      case "/submit":
        const data = JSON.parse(dataString);

        /*const graduated = parseInt(data.year) < 2019 ? "Yes" : "No";

        const newMember = {
          "firstname": data.firstname,
          "lastname": data.lastname,
          "major": data.major,
          "year": data.year,
          "graduated": graduated,
          "velocity": data.velocity
        };
        appdata.push(newMember);*/
        const newUUID = uuidv4();

        const newMember = {
          "firstname": data.firstname,
          "lastname": data.lastname,
          "major": data.major,
          "uuid": newUUID
        }

        db.get('members').push(newMember).write()

        response.writeHead(200, "OK", {
          "Content-Type": "text/plain"
        });
        response.end();

        break;
      case "/update":
        const updatedData = JSON.parse(dataString);
        //const uuid = updatedData.uuid;

        const updatedEntry = {
          "firstname": updatedData.firstname,
          "lastname": updatedData.lastname,
          "major": updatedData.major,
          "uuid": updatedData.uuid
          //Pass UUID back and forth between client and server?
        };
        db.get('members').remove({uuid: updatedData.uuid}).write()
        //db.get('members').pull(updatedData.uuid).write();

        db.get('members').push(updatedEntry).write();

        //appdata.splice(updatedData.index, 1, updatedEntry);
        response.writeHead(200, "OK", {
          "Content-Type": "text/plain"
        });
        response.end();
        break;

      case "/delete":
        const entryToDelete = JSON.parse(dataString);
        //const index = entryToDelete.memberNum
        //console.log("index to remove: " + index)

        //db.get('members').pullAt(db, index)

        //db.get('members').pull(entryToDelete.uuid).write();
        db.get('members').remove({uuid: entryToDelete.uuid}).write()
        //appdata.splice(entryToDelete.memberNum, 1);
        response.writeHead(200, "OK", {
          "Content-Type": "text/plain"
        });
        response.end();
        break;

      default:
        response.end("404 Error: File Not Found");
        break;
    }
  })
};

const sendData = function(response, request) {
  const type = mime.getType(request);
  response.writeHeader(200, {
    "Content-Type": type
  });
  response.write(JSON.stringify({
    data: request
  }));
  response.end();
};

const sendFile = function(response, filename) {
  const type = mime.getType(filename);

  fs.readFile(filename, function(err, content) {
    if (err === null) {
      response.writeHeader(200, {
        "Content-Type": type
      });
      response.end(content)
    } else {
      response.writeHeader(404);
      response.end("404 Error: File Not Found");
    }
  })
};

server.listen(process.env.PORT || port);
