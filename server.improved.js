const low = require('lowdb'),
  express = require('express'),
  session = require('express-session'),
  passport = require('passport'),
  Local = require('passport-local').Strategy,
  FileSync = require('lowdb/adapters/FileSync'),
  adapter = new FileSync('db.json'),
  db = low(adapter),
  app = express(),
  uuidv4 = require('uuid/v4'),
  http = require("http"),
  fs = require("fs"),
  mime = require("mime"),
  cookieParser = require('cookie-parser'),
  morgan = require('morgan'),
  //mime = require("mime-types"),
  dir = "public/",
  port = 3000;


/*app.get("/", (request, response) => {
  //response.send("Hello, World!")
  response.sendFile(__dirname + "/public/index.html");
});*/

app.use(express.static('public'));
//app.use(bodyParser.json());
app.use(morgan('tiny'));
app.use(cookieParser());
app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Bad thing happened');
});

passport.use(new Local(function(username, password, cb) {
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
passport.initialize();

passport.serializeUser((user, done) => done(null, user.username))

passport.deserializeUser((username, done) => {
  const user = db.find(u => u.username === username)
  //console.log('deserializing:', user)

  if (user !== undefined) {
    done(null, user)
  } else {
    done(null, false, {
      message: 'user not found; session not restored'
    })
  }
});

app.use(session({
  secret: 'fifteen potatoes',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

/*app.post('/test', function (req, res) {
    console.log('authenticate with cookie?', req.user)
    res.json({ status: 'success' })
})*/

app.get('/', function(req, res) {
  //console.log(req.user)
  res.sendFile(__dirname + '/public/login.html');
});

app.get('/getdata', function(req, res) {
  const type = mime.getType(db.get('members').value());
  res.writeHeader(200, {
    "Content-Type": type
  });
  res.write(JSON.stringify({
    data: db.get('members').value()
  }));
  res.end();
});

app.post('/update', function(req, res) {
  let dataString = "";

  req.on("data", function(data) {
    dataString += data
  });

  req.on("end", function() {
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

    res.writeHead(200, "OK", {
      "Content-Type": "text/plain"
    });
    res.end();
  })
});

app.post('/submit', function(req, res) {
  let dataString = "";

  req.on("data", function(data) {
    dataString += data
  });

  req.on("end", function() {
    const data = JSON.parse(dataString);
    const newUUID = uuidv4();

    const newMember = {
      "firstname": data.firstname,
      "lastname": data.lastname,
      "major": data.major,
      "uuid": newUUID
    }

    db.get('members').push(newMember).write()

    res.writeHead(200, "OK", {
      "Content-Type": "text/plain"
    });
    res.end();
  })
});

app.post('/delete', function(req, res) {
  let dataString = "";

  req.on("data", function(data) {
    dataString += data
  });

  req.on("end", function() {
    const entryToDelete = JSON.parse(dataString);
    db.get('members').remove({
      uuid: entryToDelete.uuid
    }).write()
    res.writeHead(200, "OK", {
      "Content-Type": "text/plain"
    });
    res.end();
  })
});

app.get('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.redirect('/login');
    }
    req.logIn(user, function(err) {
      if (err) {
        return next(err);
      }
      return res.redirect('/users/' + user.username);
    });
  })(req, res, next);
});

/*app.post(
  '/login',
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login.html'
  }),
  function(req, res) {
    console.log("Login successful")
    console.log(req.user)
    res.json({
      status: true
    })
  }
);*/



/*db.defaults({
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
    //sendFile(response, "public/index.html")
    sendFile(response, "public/login.html")
  } else if (request.url === "/getdata") {
    sendData(response, db.get('members').value() );
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
};*/

app.listen(process.env.PORT || port, function() {
  console.log("Server running on port " + port);
});
