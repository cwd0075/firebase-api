'use strict';

const functions = require('firebase-functions');
//const admin = require('firebase-admin');
//admin.initializeApp();
const express = require('express');
//const cookieParser = require('cookie-parser')();
const cors = require('cors')({origin: true});
const app = express();
const bodyParser = require('body-parser');
const passport = require('passport');
const users = require('./routes/api/users');
const profile = require('./routes/api/profile');
const posts = require('./routes/api/posts');

// Passport middleware
app.use(passport.initialize());
// Passport Config
require('./config/passport')(passport);

app.use(cors);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.use('/api/users', users);
app.use('/api/profile', profile);
app.use('/api/posts', posts);

app.get('/hello/:messageId', (req, res) => {
  res.send(`Hello ${req.params.messageId}`);
});


exports.app = functions.https.onRequest(app);