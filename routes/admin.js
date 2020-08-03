const path = require('path');

const express = require('express');
const { body } = require('express-validator');

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');

const router = express.Router();
router.get('/add-post', isAuth, adminController.getAddPost);
router.get('/posts/:postId', adminController.getPost);
router.get('/posts', isAuth, adminController.getPosts);
router.get('/chatbot/:username',adminController.getMessages);
router.get('/chatbot', isAuth, adminController.getChatbot);
router.get('/delete-message/:username',adminController.deleteMessage);
router.post('/send-messages',adminController.postMessages);
router.post(
  '/add-post',
  [
    body('title')
      .isString()
      .isLength({ min: 3 })
      .trim(),
    body('description')
      .isLength({ min: 5, max: 400 })
      .trim()
  ],
  isAuth,
  adminController.postAddPost
);
router.get('/edit-post/:postId', isAuth, adminController.getEditPost);
router.post(
  '/edit-post',
  [
    body('title')
      .isString()
      .isLength({ min: 3 })
      .trim(),
    body('description')
      .isLength({ min: 5, max: 400 })
      .trim()
  ],
  isAuth,
  adminController.postEditPost
);

router.post('/delete-post', isAuth, adminController.postDeletePost);
router.get('/notification/clear/:content',isAuth,adminController.clearNotification);
router.get('/notifications',isAuth,adminController.getNotifications);
module.exports = router;
