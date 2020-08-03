const mongoose = require('mongoose');

const fileHelper = require('../util/file');

const { validationResult } = require('express-validator/check');

const Post = require('../models/post');
const User = require('../models/user');
const Profile = require('../models/profile');
const ChatRoom = require('../models/chatroom');
exports.getNotifications = (req, res, next) => {
  const userId=req.user._id;
  console.log(userId);
  User.findById(userId).then(user=>{
    console.log(user);
   let notifications=user.notifications;
   let haveNewNotifications=user.haveNewNotifications;
   user.haveNewNotifications=false;
   let updatedNotifications=[];
   user.notifications=updatedNotifications;
   return user.save().then(result=>{
    res.render('admin/notifications',{
      pageTitle:'Notifications',
      path:'/notifications',
      notifications:notifications,
      haveNewNotifications:haveNewNotifications
    });
   });
  }).catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
};
exports.clearNotification = (req, res, next) => {
  const content=req.params.content;
  const userId=req.user._id;
  console.log(userId);
  User.findById(userId).then(user=>{
    console.log(user);
   let notifications=user.notifications;
   let haveNewNotifications=user.haveNewNotifications;
   notifications=notifications.filter(ele=>{
     return ele.toString() !== content.toString();
   })
  if(notifications.length === 0)
  user.haveNewNotifications=false;
  user.notifications=notifications;
  return user.save().then(result=>{
    res.render('admin/notifications',{
      pageTitle:'Notifications',
      path:'/notifications',
      notifications:notifications,
      haveNewNotifications:haveNewNotifications
    });
  });
  }).catch(err => {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
};
exports.getPost = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then(post => {
      res.render('other/post-detail', {
        post: post,
        pageTitle: post.title,
        path: '/posts'
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
exports.getAddPost = (req, res, next) => {
  res.render('admin/edit-post', {
    pageTitle: 'Add Post',
    path: '/admin/add-post',
    editing: false,
    hasError: false,
    errorMessage: null,
    validationErrors: []
  });
};
exports.getChatbot = (req, res, next) => {
  let user=req.user.email;
  let userId=req.user._id;
  return Profile.findOne({user:userId}).then(profile=>{
    if(!profile)
    return res.redirect('/profile');
    let suggestion=profile.suggestion;
    let usernames=[];
    for(var i=0;i<suggestion.length;i++){
      const email=suggestion[i].email;
      if(!suggestion[i].isBlocked)
      usernames.push(email);
    }
    res.render('admin/chatbot',{
      pageTitle: 'ChatBot',
        path: '/admin/chatbot',
        usernames:usernames
    });
  })
/*return User.find().then(items=>{
  const item=[];
  for(const it of items){
    if(it.email != user)
    item.push(it.email);
  }*/
.catch(err=>{
  const error = new Error(err);
  error.httpStatusCode = 500;
  return next(error);
});
};
exports.getMessages = (req,res,next) => {
  //console.log('1');
var username=req.params.username;
//console.log(username);
var messages=[];
return ChatRoom.find().then(item=>{
 // console.log('2');
 // console.log(item);
  if(item.length>0){
    item=item[0];
    let users={...item.users};
    //console.log('users:'+ users);
    let items=users.items;
    let found=items.find(ele=>{
   return ele.email.toString() == username.toString();
    });
   if(found){
      for(var i=0;i<items.length;i++){
       if(items[i].email== username)
        {messages=items[i].message;break;}
      }
    }
 }
 res.render('admin/messages',{
  pageTitle: 'Messages',
    path: '/admin/messages',
    username:username,
    messages:messages,
});
})
.catch(err=>{
  const error = new Error(err);
  error.httpStatusCode = 500;
  return next(error);
});
};
exports.postMessages =(req,res,next)=>{
var sender=req.user.email;
var receiver=req.body.username;
console.log(sender);
console.log(receiver);
var message=req.body.message;
console.log(message);
var message1=[];var message2=[];
ChatRoom.findOne().then(document =>{
  console.log(document);
  if(document === null){
    message1.push({content:message,side:'right'});
    message2.push({content:message,side:'left'});
    let data1={email:sender,message:message1};
    let data2={email:receiver,message:message2};
    let item=[];
    item.push(data1);item.push(data2);
    const data={items:item};
    let chatroom=new ChatRoom({users:data});
    return chatroom.save().then(result=>{
      res.redirect('/admin/chatbot');
    });
  }
else {
  const id=document._id;
  var users=document.users;
var items=users.items; 
console.log(items);
function iterate(item){
if(item.email === sender){
  message1=item.message;
}
else if(item.email === receiver)
message2=item.message;
};
items.forEach(iterate);
message1.push({content:message,side:'right'});
message2.push({content:message,side:'left'});
const updateditems=items.filter(ele=>{
return ele.email.toString() !== sender.toString() && ele.email.toString() !== receiver.toString();
});
updateditems.push({email:sender,message:message1});
updateditems.push({email:receiver,message:message2});
let newUsers={items:updateditems};
return ChatRoom.updateOne({_id:id},{users:newUsers}).then(result=>{
  res.redirect('/admin/chatbot');
});
}
}).catch(err=>{
  console.log(err);
  const error = new Error(err);
  error.httpStatusCode = 500;
  return next(error);
});

};

exports.deleteMessage = (req, res, next) => {
 var message=req.query.messageContent;
 var email=req.params.username;
 console.log('email:'+email);
 console.log('message:'+message);
  ChatRoom.findOne().then(document => {
   let users=document.users;
   let items=users.items;
   let resultItems=items.filter(ele=>{
     return ele.email === email;
   })  
   let messages=resultItems[0].message;
   let updatedMessages=messages.filter(ele=>{
     return ele.content.toString() != message.toString();
   });
   resultItems[0].message=updatedMessages;
  let updatedItems=items.filter(ele=>{
    if(ele.email == email) return resultItems[0];
    else return ele;
  });
  users.items=updatedItems;
  document.users=users;
  return document.save().then(result=>{
    console.log('deleted message');
    res.redirect('/admin/chatbot');
  });
 }).catch(err=>{
  console.log(err);
  const error = new Error(err);
  error.httpStatusCode = 500;
  return next(error);
 });
};
exports.postAddPost = (req, res, next) => {
  const title = req.body.title;
  const image = req.file;
  const description = req.body.description;
  if (!image) {
    return res.status(422).render('admin/edit-post', {
      pageTitle: 'Add Post',
      path: '/admin/add-post',
      editing: false,
      hasError: true,
      post: {
        title: title,
        description: description
      },
      errorMessage: 'Attached file is not an image.',
      validationErrors: []
    });
  }
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render('admin/edit-post', {
      pageTitle: 'Add Post',
      path: '/admin/add-post',
      editing: false,
      hasError: true,
      post: {
        title: title,
        description: description
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array()
    });
  }

  const imageUrl = image.path;

  const post = new Post({
    title: title,
    description: description,
    imageUrl: imageUrl,
    userId: req.user
  });
  post
    .save()
    .then(result => {
      console.log('Created Post');
      res.redirect('/admin/posts');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getEditPost = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const postId = req.params.postId;
  Post.findById(postId)
    .then(post => {
      if (!post) {
        return res.redirect('/');
      }
      res.render('admin/edit-post', {
        pageTitle: 'Edit Post',
        path: '/admin/edit-post',
        editing: editMode,
        post: post,
        hasError: false,
        errorMessage: null,
        validationErrors: []
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postEditPost = (req, res, next) => {
  const postId = req.body.postId;
  const updatedTitle = req.body.title;
  const image = req.file;
  const updatedDesc = req.body.description;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render('admin/edit-post', {
      pageTitle: 'Edit Post',
      path: '/admin/edit-post',
      editing: true,
      hasError: true,
      post: {
        title: updatedTitle,
        description: updatedDesc,
        _id: postId
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array()
    });
  }

  Post.findById(postId)
    .then(post => {
      if (post.userId.toString() !== req.user._id.toString()) {
        return res.redirect('/');
      }
      post.title = updatedTitle;
      post.description = updatedDesc;
      if (image) {
        fileHelper.deleteFile(post.imageUrl);
        post.imageUrl = image.path;
      }
      return post.save().then(result => {
        console.log('UPDATED POST!');
        res.redirect('/admin/posts');
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getPosts = (req, res, next) => {
  Post.find({ userId: req.user._id })
    .then(posts => {
      console.log(posts);
      res.render('admin/posts', {
        posts: posts,
        pageTitle: 'Admin Posts',
        path: '/admin/posts'
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postDeletePost = (req, res, next) => {
  const postId = req.body.postId;
  Post.findById(postId)
    .then(post => {
      if (!post) {
        return next(new Error('Post not found.'));
      }
      fileHelper.deleteFile(post.imageUrl);
      return Post.deleteOne({ _id: postId, userId: req.user._id });
    })
    .then(() => {
      console.log('DESTROYED POST');
      res.redirect('/admin/posts');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

