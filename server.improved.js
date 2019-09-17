const low = require('lowdb'),
  express = require('express'),
  passport = require('passport'),
  Strategy = require('passport-local').Strategy,
  FileSync = require('lowdb/adapters/FileSync'),
  adapter = new FileSync('db.json'),
  db = low(adapter),
  app = express(),
  uuidv4 = require('uuid/v4');

passport.use(new Strategy(
  function(username, password, cb) {
    db.users.findByUsername(username, function(err, user) {
      if (err) {
        return cb(err);
      }
      if (!user) {
        return cb(null, false);
      }
      if (user.password != password) {
        return cb(null, false);
      }
      return cb(null, user);
    });
  }));

passport.serializeUser(function(user, cb) {
  cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
  db.users.findById(id, function(err, user) {
    if (err) {
      return cb(err);
    }
    cb(null, user);
  });
});


db.defaults({
  members: [{
      "firstname": "Luke",
      "lastname": "Skywalker",
      "major": "Lightsaber Construction",
      "uuid": "f5701299-05f8-4ca0-a904-fa6fdfd3718c",
      "username": "Luke",
      "password": "Skywalker"
    },
    {
      "firstname": "Obi-Wan",
      "lastname": "Kenobi",
      "major": "Taking the High Ground",
      "uuid": "524dee4e-b72e-49e2-adf2-e4907db45fda",
      "username": "Obi-Wan",
      "password": "Kenobi"
    }
  ]
}).write();

app.use(express)

const http = require("http"),
  fs = require("fs"),
  mime = require("mime"),
  //mime = require("mime-types")
  dir = "public/",
  port = 3000;

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
    sendData(response, db.get('members').value() /*appdata*/ );
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

        const updatedEntry = {
          "firstname": updatedData.firstname,
          "lastname": updatedData.lastname,
          "major": updatedData.major,
          "uuid": updatedData.uuid
        };
        db.get('members').remove({
          uuid: updatedData.uuid
        }).write()

        db.get('members').push(updatedEntry).write();

        response.writeHead(200, "OK", {
          "Content-Type": "text/plain"
        });
        response.end();
        break;

      case "/delete":
        const entryToDelete = JSON.parse(dataString);
        db.get('members').remove({
          uuid: entryToDelete.uuid
        }).write()
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
