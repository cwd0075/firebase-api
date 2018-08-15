
const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const admin = require('firebase-admin');
admin.initializeApp();
const keys = require('../../config/keys');
const User = require('../../models/User');



// @route   POST api/users/register
// @desc    Register user
// @access  Public
router.post('/register', async (req, res) => {
  // const { errors, isValid } = validateRegisterInput(req.body);

  // //Check Validation
  // if (!isValid) {
  //   return res.status(400).json(errors);
  // }

    let query = admin.database().ref(`/users`);
    query = query.orderByChild('email').equalTo(req.body.email);
    try {
      const snapshot = await query.once('value');
      //const value = snapshot.val();
      if (snapshot.exists())
        {
          return res.status(400).json('Email already exists');
        }
      } catch(error) {
        console.log('Error getting messages', error.message);
        return res.sendStatus(500);
      }    
      const avatar = gravatar.url(req.body.email, {
        s: '200', // Size
        r: 'pg', // Rating
        d: 'mm' // Default
      });
      
      const newUser = {
        name: req.body.name,
        email: req.body.email,
        avatar: avatar,
        password: req.body.password,
        date: admin.database.ServerValue.TIMESTAMP
      };
      
      // bcrypt is an async function here
      bcrypt.genSalt(10, (err, salt) => {
        if (err) throw err;
        bcrypt.hash(newUser.password, salt, async (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          const snapshot = await admin.database().ref(`/users`).push(newUser);
          res.json("New user created.");
          
        });
      });
});      

// @route   GET api/users/login
// @desc    Login User / Returning JWT Token
// @access  Public
router.post('/login', async (req, res) => {

  const email = req.body.email;
  const password = req.body.password;
  
  const results = await admin.database().ref(`/users`).orderByChild('email').equalTo(email).once('value');
  // Find user by email
  if(!results.exists()) {
    return res.status(404).json({email: 'User not found'});
  }
  let people = [];
  results.forEach((result) => {
        people.push({key: result.key, password: result.val().password, other: result.val()});
  });
  bcrypt.compare(password, people[0].password).then(isMatch => {
    if (isMatch) {
      // User Matched
      const payload = { id: people[0].key, name: people[0].other.name, avatar: people[0].other.avatar }; // Create JWT Payload
      console.log(payload);
        // Sign Token
      jwt.sign(payload, keys.secretOrKey, { expiresIn: 3600 }, (err, token) => {
          res.json({ success: true, token: 'Bearer ' + token});
        }
      );
    } else {
      //errors.password = 'Password incorrect';
      return res.status(400).json({password: 'Password incorrect'});
    }
  });
  
  
});  
  



 
//router.get('/test', (req, res) => res.json({ msg: 'Users Works'}));


// Demo: Using Mongoose Schema Validate function
// router.get('/test', (req, res) => {
//     const newUser = new User({
//         name: 'cwd',
//         email: 'email@gg.com',
//         //avatar,
//         password: 'password'
//       });

//       newUser.validate(error => {
//         if (error) {
//           console.log("ERROR: ", error);
//           res.status(400).json({error: "data not valid!"});
//         } else {
//           console.log(newUser);
//           res.json({ msg: 'validate done'});
//         }
//       });
      
// }
// );

// Demo: Check if item exit in Firebase
router.get('/email', async (req, res) => {
    const email = 'abc@gmail.co';
    let query = admin.database().ref(`/users/message`);
    query = query.orderByChild('email').equalTo(email);
    
    try {
      const snapshot = await query.once('value');
      // let messages = [];
      // snapshot.forEach((childSnapshot) => {
      //   messages.push({key: childSnapshot.key, message: childSnapshot.val().message});
      // });
      const value = snapshot.val();
      if (value)
      {
      res.status(200).json({email: 'email found'});
        
      }
      
      else
      {
      res.status(200).json({email: 'email not found'});
      }
    } catch(error) {
      console.log('Error getting messages', error.message);
      res.sendStatus(500);
    }
});

// Demo: Put data to Firebase
router.get('/messages', async (req, res) => {
    const data = {username : 'cwd', email: 'abc@gmail.com'};
    
    const snapshot = await admin.database().ref(`/users/message`).push(data);
    console.log(snapshot);
});


// Demo: Read Firebase Array of Return 
router.get('/words', async (req, res) => {
  const snapshot = await admin.database().ref(`/users/message`).once('value');
  let messages = [];
    snapshot.forEach((childSnapshot) => {
      messages.push({key: childSnapshot.key, message: childSnapshot.val().username});
    });

    res.status(200).json(messages);
});

module.exports = router;
