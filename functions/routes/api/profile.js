const express = require('express');
const router = express.Router();
const passport = require('passport');
const admin = require('firebase-admin');
//admin.initializeApp();

// @route   GET api/profile
// @desc    Get current users profile
// @access  Private
router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const errors = {};
    const uid = req.user.id;
    
    admin.database().ref(`/profile/${uid}`).once('value')
        .then((snapshot) =>{
            if (!snapshot.exists()){
                errors.noprofile = 'There is no profile for this user';
                return res.status(404).json(errors);
            }
            res.json(snapshot.val());
        })
        .catch(err => res.status(404).json(err));
  }
);


module.exports = router;

