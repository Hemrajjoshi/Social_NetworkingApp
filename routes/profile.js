const path = require('path');
const express = require('express');
const { body } = require('express-validator/check');
const profileController = require('../controllers/profile');
const isAuth = require('../middleware/is-auth');
const router = express.Router();
router.get('/profile', profileController.getProfile);
router.get('/add-profile', isAuth, profileController.getAddProfile);
router.post('/add-profile', [
    body('bio')
      .isString()
      .isLength({ min: 3 })
      .trim(),
    body('location')
      .isLength({ min: 5, max: 20 })
      .trim(),
      body('degree')
      .isString()
      .isLength({ min: 3 })
      .trim(),
      body('college')
      .isString()
      .isLength({ min: 3 })
      .trim()
  ],isAuth, profileController.postAddProfile);
router.get('/edit-profile/:profileId', isAuth, profileController.getEditProfile);
router.post('/edit-profile',
[
  body('bio')
    .isString()
    .isLength({ min: 3 })
    .trim(),
  body('location')
    .isLength({ min: 5, max: 20 })
    .trim(),
    body('degree')
    .isString()
    .isLength({ min: 3 })
    .trim(),
    body('college')
    .isString()
    .isLength({ min: 3 })
    .trim()
], isAuth, profileController.postEditProfile);
router.get('/follower/:profileId',isAuth,profileController.getFollower);
router.get('/following/:profileId',isAuth,profileController.getFollowing);
router.get('/follow/:profileId/:userId/:email',isAuth,profileController.followUser);
router.get('/unfollow/:profileId/:userId/:email',isAuth,profileController.unFollowUser);
router.get('/remove-follower/:profileId/:userId/:email',isAuth,profileController.removeFollower);
router.get('/block/:profileId/:userId/:email',isAuth,profileController.blockUser);
router.get('/unblock/:profileId/:userId/:email',isAuth,profileController.unBlockUser);
router.get('/blocked-user/:profileId',isAuth,profileController.getBlockedUsers);
module.exports=router;