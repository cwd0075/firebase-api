const express = require('express');
const router = express.Router();
const passport = require('passport');
const admin = require('firebase-admin');
//admin.initializeApp();

const validateProfileInput = require('../../validation/profile');
const validateExperienceInput = require('../../validation/experience');
const validateEducationInput = require('../../validation/education');

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

// @route   GET api/profile/all
// @desc    Get all profiles
// @access  Public
router.get('/all', async (req, res) => {
  const errors = {};
  const profile =  await admin.database().ref(`/profile`).orderByKey().once('value');
  if (!profile.exists()){
      errors.noprofile = 'There is no profile for this user';
      return res.status(404).json(errors);
  }
  res.json(profile.val());
  
});



// @route   GET api/profile/handle/:handle
// @desc    Get profile by handle
// @access  Public

router.get('/handle/:handle', async (req, res) => {
  const errors = {};
  const profile =  await admin.database().ref(`/profile`).orderByChild('handle').equalTo(req.params.handle).once('value');
  if (!profile.exists()){
      errors.noprofile = 'There is no profile for this user';
      return res.status(404).json(errors);
  }
  res.json(profile.val());

});

// @route   GET api/profile/user/:user_id
// @desc    Get profile by user ID
// @access  Public

router.get('/user/:user_id', async (req, res) => {
  const errors = {};
  const profile =  await admin.database().ref(`/profile`).orderByKey().equalTo(req.params.user_id).once('value');
  if (!profile.exists()){
      errors.noprofile = 'There is no profile for this user';
      return res.status(404).json(errors);
  }
  res.json(profile.val());
  
});

// @route   POST api/profile/experience
// @desc    Add experience to profile
// @access  Private
router.post(
  '/experience',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const uid = req.user.id;
    const { errors, isValid } = validateExperienceInput(req.body);

    // Check Validation
    if (!isValid) {
      // Return any errors with 400 status
      return res.status(400).json(errors);
    }
    const newExp = {};
    if (req.body.title) newExp.title = req.body.title;
    if (req.body.company) newExp.company = req.body.company;
    if (req.body.location) newExp.location = req.body.location;
    if (req.body.from) newExp.from = req.body.from;
    if (req.body.to) newExp.to = req.body.to;
    newExp.current = 'false';
    if (req.body.current) newExp.current = req.body.current;
    if (req.body.description) newExp.description = req.body.description;
    
    const results2 = await admin.database().ref(`/profile/${uid}/experience`).push(newExp);
    res.json("Experience added."); 

  }
);

// @route   POST api/profile/education
// @desc    Add education to profile
// @access  Private
router.post(
  '/education',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const uid = req.user.id;
    const { errors, isValid } = validateEducationInput(req.body);

    // Check Validation
    if (!isValid) {
      // Return any errors with 400 status
      return res.status(400).json(errors);
    }
    const newEdu = {};
    if (req.body.school) newEdu.school = req.body.school;
    if (req.body.degree) newEdu.degree = req.body.degree;
    if (req.body.fieldofstudy) newEdu.fieldofstudy = req.body.fieldofstudy;
    if (req.body.from) newEdu.from = req.body.from;
    if (req.body.to) newEdu.to = req.body.to;
    newEdu.current = 'false';
    if (req.body.current) newEdu.current = req.body.current;
    if (req.body.description) newEdu.description = req.body.description;
    
    const results2 = await admin.database().ref(`/profile/${uid}/education`).push(newEdu);
    res.json("Education added");   
  
  }
);

// @route   DELETE api/profile/experience/:exp_id
// @desc    Delete experience from profile
// @access  Private
router.delete(
  '/experience/:exp_id',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const uid = req.user.id;
    const results3 =  await admin.database().ref(`/profile/${uid}/experience/${req.params.exp_id}`).remove();
    res.json('experience removed');
  }
);

// @route   DELETE api/profile/education/:edu_id
// @desc    Delete education from profile
// @access  Private
router.delete(
  '/education/:edu_id',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const uid = req.user.id;
    const results3 =  await admin.database().ref(`/profile/${uid}/education/${req.params.edu_id}`).remove();
    res.json('education removed');
  }
);

// @route   DELETE api/profile
// @desc    Delete user and profile
// @access  Private
// The best implement of async await function with catch error!!!!
router.delete(
  '/',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
  try{  
    
    const uid = req.user.id;
    const results3 =  await admin.database().ref(`/profile/${uid}`).remove();
    const results4 =  await admin.database().ref(`/users/${uid}`).remove();
    res.json({ success: true });
  }catch(error){
    console.log('Error deleting profile or user', error.message);
    res.sendStatus(500); 
  }

});


// @route   POST api/profile
// @desc    Create or edit user profile
// @access  Private
router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const { errors, isValid } = validateProfileInput(req.body);

    // Check Validation
    if (!isValid) {
      // Return any errors with 400 status
      return res.status(400).json(errors);
    }
    
    // Get fields
    const profileFields = {};
    const uid = req.user.id;
    //profileFields.id = uid;
    profileFields.user ={};
    profileFields.user.id = uid;
    profileFields.user.name = req.user.name;
    profileFields.user.avatar = req.user.avatar;
    if (req.body.handle) profileFields.handle = req.body.handle;
    if (req.body.company) profileFields.company = req.body.company;
    if (req.body.website) profileFields.website = req.body.website;
    if (req.body.location) profileFields.location = req.body.location;
    if (req.body.bio) profileFields.bio = req.body.bio;
    if (req.body.status) profileFields.status = req.body.status;
    if (req.body.githubusername)
      profileFields.githubusername = req.body.githubusername;
    // Skills - Spilt into array
    if (typeof req.body.skills !== 'undefined') {
      profileFields.skills = req.body.skills.split(',');
    }

    // Social
    profileFields.social = {};
    if (req.body.youtube) profileFields.social.youtube = req.body.youtube;
    if (req.body.twitter) profileFields.social.twitter = req.body.twitter;
    if (req.body.facebook) profileFields.social.facebook = req.body.facebook;
    if (req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;
    if (req.body.instagram) profileFields.social.instagram = req.body.instagram;
    profileFields.date = admin.database.ServerValue.TIMESTAMP;
    
    const profile =  await admin.database().ref(`/profile`).orderByChild('handle').equalTo(profileFields.handle).once('value');
    
        if (profile.exists()) {
            let people = [];
              profile.forEach((result) => {
                    people.push({key: result.key});
              });
            const uid2 = people[0].key
            if (uid2 != uid)
            {
                errors.handle = 'That handle already exists';
                return res.status(400).json(errors);
            }
        }
    
    const results =  await admin.database().ref(`/profile`).orderByKey().equalTo(uid).once('value');
        if (results.exists()) {
          
         const results3 =  await admin.database().ref(`/profile/${uid}`).remove();
         console.log('uid removed');
        }
    
    const results2 = await admin.database().ref(`/profile/${uid}`).set(profileFields);
    res.json("Profile updated."); 
    
  }
);


module.exports = router;

