const express = require('express');
const router = express.Router();
const passport = require('passport');
const admin = require('firebase-admin');

// Validation
const validatePostInput = require('../../validation/post');

// @route   POST api/posts
// @desc    Create post
// @access  Private
router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    
    
    const { errors, isValid } = validatePostInput(req.body);

    // Check Validation
    if (!isValid) {
      // If any errors, send 400 with errors object
      return res.status(400).json(errors);
    }
    
    const newPost = {};
    newPost.user = req.user.id;
    newPost.date = admin.database.ServerValue.TIMESTAMP;
    if (req.body.text) newPost.text = req.body.text;
    if (req.body.name) newPost.name = req.body.name;
    if (req.body.avatar) newPost.avatar = req.body.avatar;
    
    try{  
        const results2 = await admin.database().ref(`/posts`).push(newPost);
        res.json({ post: "created" });
      }catch(error){
        console.log('Error creating new post', error.message);
        res.sendStatus(500); 
      }
   
  }
);

module.exports = router;
