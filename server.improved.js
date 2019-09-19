const low = require('lowdb'),
  express = require('express'),
  compression = require('compression'),
  session = require('express-session'),
  passport = require('passport'),
  flash = require("connect-flash"),
  Local = require('passport-local').Strategy,
  FileSync = require('lowdb/adapters/FileSync'),
  http = require("http"),
  fs = require("fs"),
  mime = require("mime"),
  bodyParser = require('body-parser'),
  cookieParser = require('cookie-parser'),
  morgan = require('morgan'),
  adapter = new FileSync('db.json'),
  db = low(adapter),
  app = express(),
  dir = "public/",
  port = 3000;

app.use(express.static('public'));
app.use(compression());
app.use(bodyParser.json());
app.use(morgan('tiny'));
app.use(cookieParser());
app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Bad thing happened');
});

passport.use(new Local(function(username, password, done) {
  const user = db.get("members").find({
    "username": username
  }).value();

  if (user === undefined) {
    console.log("user not found")
    return done(null, false, {
      message: "user not found"
    });
  } else if (user.password === password) {
    console.log("user found")
    return done(null, {
      username,
      password
    })
  } else {
    console.log("incorrect password")
    return done(null, false, {
      message: "incorrect password"
    });
  }

}));

passport.initialize();

passport.serializeUser((user, done) => done(null, user.username))

passport.deserializeUser((username, done) => {
  const user = db.get("members").find(u => u.username === username)
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
app.use(flash());

app.post('/login', passport.authenticate('local', {
  failureFlash: true,
  successFlash: true
}), function(req, res) {
  console.log('user: ', req.user)
  res.json({
    status: true
  })
})

/*app.post('/login', function(req, res) {
  console.log("hi there");
})*/

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/public/index.html');
});

app.get('/getdata', function(req, res) {
  const type = mime.getType(db.get('members').value());
  res.writeHeader(200, {
    "Content-Type": type
  });
  res.write(JSON.stringify({
    data: db.get('members').value()
  }));
  res.flush();
  res.end();
});

app.post('/update', function(req, res) {
  /*let dataString = "";
  console.log("update")
  req.on("data", function(data) {
    dataString += data
    console.log(data)
  });
  console.log("body: " + req.body)
  console.log("username: " + req.body.username)*/
  //const updatedData = req.body;
  const updatedEntry = {
    "firstname": req.body.firstname,
    "lastname": req.body.lastname,
    "username": req.body.username,
    "password": req.body.password
  };
  console.log(updatedEntry)

  db.get('members').remove({
    username: updatedEntry.username
  }).write();

  db.get('members').push(updatedEntry).write();

  res.writeHead(200, "OK", {
    "Content-Type": "text/plain"
  });
  res.end();

  /*req.on("end", function() {
    //const updatedData = JSON.parse(dataString);
    const updatedEntry = {
      "firstname": updatedData.firstname,
      "lastname": updatedData.lastname,
      "username": updatedData.username,
      "password": updatedData.password
    };
    db.get('members').remove({
      username: updatedData.username
    }).write();

    db.get('members').push(updatedEntry).write();

    res.writeHead(200, "OK", {
      "Content-Type": "text/plain"
    });
    res.end();
  })*/
});

app.post('/submit', function(req, res) {
  /*let dataString = "";

  req.on("data", function(data) {
    dataString += data
  });

  req.on("end", function() {
    const data = JSON.parse(dataString);

    const newMember = {
      "firstname": data.firstname,
      "lastname": data.lastname,
      "username": data.username,
      "password": data.password
    }*/

  const newMember = {
    "firstname": req.body.firstname,
    "lastname": req.body.lastname,
    "username": req.body.username,
    "password": req.body.password
  };

  db.get('members').push(newMember).write()

  res.writeHead(200, "OK", {
    "Content-Type": "text/plain"
  });
  res.end();
})
//});

app.post('/delete', function(req, res) {
  /*let dataString = "";

  req.on("data", function(data) {
    dataString += data
  });

  req.on("end", function() {
    const entryToDelete = JSON.parse(dataString);
    db.get('members').remove({
      //uuid: entryToDelete.uuid
      username: entryToDelete.username
    }).write()
    res.writeHead(200, "OK", {
      "Content-Type": "text/plain"
    });
    res.end();
  })*/
  db.get('members').remove({
    //uuid: entryToDelete.uuid
    username: req.body.username
  }).write()
  res.writeHead(200, "OK", {
    "Content-Type": "text/plain"
  });
  res.end();
});

app.listen(process.env.PORT || port, function() {
  console.log("Server running on port " + port);
});
