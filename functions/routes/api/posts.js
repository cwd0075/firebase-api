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

// @route   GET api/posts
// @desc    Get posts
// @access  Public
router.get('/', async (req, res) => {
  try{
    const errors = {};
    const results =  await admin.database().ref(`/posts`).orderByChild('date').once('value');
    if (!results.exists()){
        errors.nopostsfound = 'No posts found';
        return res.status(404).json(errors);
    }
    res.json({posts: results.val()});
  }catch(error){
    console.log('Error getting all post', error.message);
    res.sendStatus(500); 
  }
 
});

// @route   GET api/posts/:id
// @desc    Get post by id
// @access  Public
router.get('/:id', async (req, res) => {
  try{
    const errors = {};
    const results =  await admin.database().ref(`/posts`).orderByKey().equalTo(req.params.id).once('value');
    if (!results.exists()){
        errors.nopostsfound = 'No posts found with that ID';
        return res.status(404).json(errors);
    }
    res.json({post: results.val()});
  }catch(error){
    console.log('Error getting post with a single ID', error.message);
    res.sendStatus(500); 
  }  
 
});

// @route   DELETE api/posts/:id
// @desc    Delete post
// @access  Private
router.delete(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
      
      try{
        const errors = {};
        const results =  await admin.database().ref(`/posts`).orderByKey().equalTo(req.params.id).once('value');
        if (!results.exists()){
            errors.nopostsfound = 'No posts found';
            return res.status(404).json(errors);
        }
        let people = [];
        results.forEach((result) => {
              people.push({user: result.val().user});
        });
        if (people[0].user!==req.user.id){
          return res.status(401).json({ notauthorized: 'User not authorized' });
        }
        const results4 =  await admin.database().ref(`/posts/${req.params.id}`).remove();
        res.json({ success: true });
      }catch(error){
        console.log('Error deleting post', error.message);
        res.sendStatus(500); 
      }  
      
  }
);

module.exports = router;
