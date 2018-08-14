
const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
admin.initializeApp();

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
      const value = snapshot.val();
      if (value)
        {
          return res.status(400).json('Email already exists');
        }
      } catch(error) {
        console.log('Error getting messages', error.message);
        return res.sendStatus(500);
      }    
      
      const newUser = {
        name: req.body.name,
        email: req.body.email,
        //avatar,
        password: req.body.password,
        date: admin.database.ServerValue.TIMESTAMP
      };
      
      const snapshot = await admin.database().ref(`/users`).push(newUser);
      res.json("New user created.");
});      
 
//   User.findOne({ email: req.body.email }).then(user => {
//     if (user) {
//       errors.email = 'Email already exists';
//       return res.status(400).json(errors);
//     } else {
//       // const avatar = gravatar.url(req.body.email, {
//       //   s: '200', // Size
//       //   r: 'pg', // Rating
//       //   d: 'mm' // Default
//       // });

//       const newUser = new User({
//         name: req.body.name,
//         email: req.body.email,
//         //avatar,
//         password: req.body.password
//       });
      
//       // bcrypt.genSalt(10, (err, salt) => {
//       //   bcrypt.hash(newUser.password, salt, (err, hash) => {
//       //     if (err) throw err;
//       //     newUser.password = hash;
//       //     newUser
//       //       .save()
//       //       .then(user => res.json(user))
//       //       .catch(err => console.log(err));
//       //   });
//       // });
//     }
//   });
// });






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
