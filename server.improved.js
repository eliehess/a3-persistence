/*
Created by Elie Hess.

If you're seeing this, do me a favor and watch this video before proceeding with whatever else you were doing.

https://www.youtube.com/watch?v=CQ85sUNBK7w
*/
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
  helmet = require("helmet"),
  bodyParser = require('body-parser'),
  responseTime = require('response-time'),
  morgan = require('morgan'),
  adapter = new FileSync('db.json'),
  db = low(adapter),
  app = express(),
  dir = "public/",
  port = 3000;

app.use(express.static('public'));
app.use(helmet());
app.use(compression());
app.use(bodyParser.json());
app.use(responseTime());
app.use(morgan('tiny'));
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

app.post('/login', passport.authenticate('local'), function(req, res) {
  console.log('user: ', req.user)
  res.json({
    status: true
  })
});

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
  const updatedEntry = {
    "firstname": req.body.firstname,
    "lastname": req.body.lastname,
    "username": req.body.username,
    "password": req.body.password
  };

  db.get('members').remove({
    username: updatedEntry.username
  }).write();

  db.get('members').push(updatedEntry).write();

  res.writeHead(200, "OK", {
    "Content-Type": "text/plain"
  });
  res.end();
});

app.post('/submit', function(req, res) {
  const newMember = {
    "firstname": req.body.firstname,
    "lastname": req.body.lastname,
    "username": req.body.username,
    "password": req.body.password
  };

  db.get('members').push(newMember).write();

  res.writeHead(200, "OK", {
    "Content-Type": "text/plain"
  });
  res.end();
})

app.post('/delete', function(req, res) {
  db.get('members').remove({
    username: req.body.username
  }).write();
  res.writeHead(200, "OK", {
    "Content-Type": "text/plain"
  });
  res.end();
});

app.listen(process.env.PORT || port, function() {
  console.log("Server running on port " + port);
  console.log("Press Ctrl + C to stop");
});
