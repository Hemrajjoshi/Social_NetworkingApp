const path = require('path');
const express = require('express');
const otherController = require('../controllers/other');
const isAuth = require('../middleware/is-auth');
const router = express.Router();
router.get('/reply/:postId',isAuth,otherController.getReply);
router.post('/reply/add-reply',isAuth,otherController.postReply);
router.get('/like-reply/:postId/:content/:message',isAuth,otherController.getLikeOnReply);
router.get('/delete-reply/:postId/:content/:message',isAuth,otherController.deleteReply);
router.get('/delete-comment/:postId',otherController.deleteComment);
router.post('/comment/add-commnet',isAuth, otherController.postComment);
router.get('/like-comment/:postId',otherController.getLikeOnComment);
router.get('/like/:postId', isAuth,otherController.getLike);
router.get('/posts/:postId', isAuth, otherController.getPost);
router.get('/comment/:postId',isAuth,otherController.getComment);
router.get('/posts',isAuth,otherController.getIndex);
router.get('/download/:postId',isAuth,otherController.getImage);
router.get('/', otherController.getHomepage);

module.exports = router;

