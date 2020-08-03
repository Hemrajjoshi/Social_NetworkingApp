const fs = require('fs');
const download = require('download-file');
const path = require('path');
const Post = require('../models/post');
const Profile = require('../models/profile');
const ITEMS_PER_PAGE = 2;
exports.getHomepage = (req, res, next) => {
  res.render('other/home', {
    pageTitle: 'HomePage',
    path: '/home'
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
exports.getReply=(req,res,next)=>{
const postId=req.params.postId;
const content=req.query.content;
//console.log('postId:'+postId);
//console.log('content:'+content);
Post.findOne({_id:postId}).then(post=>{
  let comment=post.comment;
  let items=comment.items;
  //console.log('items'+items);
  let reply=[];
  for(var i=0;i<items.length;i++){
    console.log(items[i].content);
    if(items[i].content == content){
reply=items[i].reply;
//console.log('1');
    }
  }
  //console.log(reply);
  let isDeletable=[];
    let email=req.user.email;
    for(var i=0;i<reply.length;i++){
      if(reply[i].email == email)
      isDeletable.push(true);
      else  isDeletable.push(false);
    }
  res.render('other/comment-reply',{
    content:content,
    reply:reply,
    pageTitle:'Reply on Comment',
    path:'/reply',
    postId:postId,
    isDeletable:isDeletable
  });
}).catch(err=>{
  console.log(err);
  const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error); 
})
};
exports.postReply=(req,res,next)=>{
  const postId=req.body.postId;
  const content=req.body.content;
  const message=req.body.reply;
  const email=req.user.email;
  Post.findOne({_id:postId}).then(post=>{
    let comment=post.comment;
    let items=comment.items;
    let reply=[];
    for(var i=0;i<items.length;i++){
      if(items[i].content == content)
      reply=items[i].reply;
    }
    reply.push({email:email,content:message});
    for(var i=0;i<items.length;i++){
      if(items[i].content == content)
      items[i].reply=reply;
    }
    comment.items=items;
    post.comment=comment;
    return post.save().then(result=>{
      res.redirect('/posts');
    });
  }).catch(err=>{
    console.log(err);
    const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error); 
  })
};
exports.getLikeOnReply = (req, res, next) => {
  const postId = req.params.postId;
  const content=req.params.content;
  const message=req.params.message;
  console.log(postId);
  var email=req.user.email;
  console.log('content:'+content);
  console.log(email);
  Post.findOne({_id:postId})
  .then(post => { 
    console.log(post);
    let comment={...post.comment};
    console.log(comment);
    let items=comment.items;
   console.log('items:'+items);
    let likers=[];let totalLikes;
    let reply=[];
    for(var i=0;i<items.length;i++){
      console.log(items[i]);
      if(items[i].content == content)
        reply=items[i].reply;
    }
    for(var i=0;i<reply.length;i++){
      if(reply[i].content == message)
        {likers=reply[i].likers;totalLikes=reply[i].totalLikes;}
    }
    console.log(likers);
    console.log('totallikes:'+totalLikes);
      let found = likers.find(element =>{ 
        return element == email}); 
      if(found){
        totalLikes--;
        likers=likers.filter(ele=>{
        return ele != email;});  }
    else {
      totalLikes++;
      likers.push(email);
    }
    for(var i=0;i<reply.length;i++){
      if(reply[i].content == message)
        {reply[i].likers=likers;reply[i].totalLikes=totalLikes;}
    }
    for(var i=0;i<items.length;i++){
      if(items[i].content == content)
        items[i].reply=reply;
    }
    const updatedComment={
      items:items
    };
    post.comment=updatedComment;
    return post.save();
  }).then(result=>{
     res.redirect('/posts');
  })
  .catch(err => {
console.log('3');
console.log(err);
const error = new Error(err);
error.httpStatusCode = 500;
    return next(error);
  });
};
exports.deleteReply=(req,res,next)=>{
const postId=req.params.postId;
const content=req.params.content;
const message=req.params.message;
console.log('message:'+message);
Post.findOne({_id:postId}).then(post=>{
  let comment=post.comment;
  let items=comment.items; let reply=[];
   for(var i=0;i<items.length;i++){
    if(items[i].content == content)
    reply=items[i].reply;}
  //console.log('reply:'+reply);
  reply=reply.filter(ele=>{
    return ele.content != message;
  });
  //console.log('reply:'+reply);
  for(var i=0;i<items.length;i++){
    if(items[i].content == content)
    items[i].reply=reply;
  }
  comment.items=items;
  post.comment=comment;
  return post.save().then(result=>{
    res.redirect('/posts');
  });
}).catch(err=>{
  console.log(err);
  const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error); 
});
};
  exports.getComment=(req,res,next)=>{
  const postId = req.params.postId;
  Post.findById(postId)
  .then(post => {
    let comment=post.comment;  let items=comment.items;
    let reply=comment.reply;
    let isDeletable=[];
    let email=req.user.email;
    for(var i=0;i<items.length;i++){
      if(items[i].email == email)
      isDeletable.push(true);
      else  isDeletable.push(false);
    }    
    res.render('other/post-comment', {
      post: post,
      pageTitle: post.title,
      path: '/comments',
      comments:comment.items,
      email:req.user.email,
      isDeletable:isDeletable
    });
  })
  .catch(err => {
      console.log(err)
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
};
exports.postComment=(req,res,next)=>{  
  var postId = req.body.postId; 
  var email = req.body.email;
  var cmnt=req.body.comment.toString();
   Post.findById(postId).then(post =>{
    let comment={...post.comment};
    let item=comment.items;
   let ans={email:email,content:cmnt};
   item.push(ans);
   const updatedcomment={items:item};
   post.comment=updatedcomment;
   return post.save()
    .then(result => {   res.redirect('/posts');  });
  }).catch(err => {
  console.log(err);
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);  });
};
exports.getLikeOnComment = (req, res, next) => {
  const postId = req.params.postId;
  console.log(postId);
  var email=req.user.email;
  var content=req.query.content;
  console.log('content:'+content);
  console.log(email);
  Post.findOne({_id:postId})
  .then(post => { 
    console.log(post);
    let comment={...post.comment};
    console.log(comment);
    let items=comment.items;
   console.log('items:'+items);
    let likers=[];let totalLikes;
    for(var i=0;i<items.length;i++){
      console.log(items[i]);
      if(items[i].content == content){
        likers=items[i].likers;
        totalLikes=items[i].totalLikes; }
    }
    console.log(likers);
    console.log('totallikes:'+totalLikes);
      let found = likers.find(element =>{ 
        return element == email}); 
      if(found){
        totalLikes--;
        likers=likers.filter(ele=>{
        return ele != email;});  }
    else {
      totalLikes++;
      likers.push(email);
    }
    for(var i=0;i<items.length;i++){
      if(items[i].content == content){
        items[i].likers=likers;
        items[i].totalLikes=totalLikes; }
    }
    const updatedComment={
      items:items
    };
    post.comment=updatedComment;
    return post.save();
  }).then(result=>{
     res.redirect('/posts');
  })
  .catch(err => {
console.log('3');
console.log(err);
const error = new Error(err);
error.httpStatusCode = 500;
    return next(error);
  });
};
exports.getIndex = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;
  const userId=req.user._id;
  Post.find()
    .countDocuments()
    .then(numPosts => {
      totalItems = numPosts;
      return Post.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then(posts => {
      return Profile.findOne({user:userId}).then(profile=>{
        console.log(profile);
        if(profile === null){
          return res.redirect('/profile');
        }
        let following=profile.following;
        let userIds=[];
        for(var i=0;i<following.length;i++){
        userIds.push(following[i].userId);
        }
        //console.log(userIds);
        //console.log('posts:'+posts);
        let updatedPosts=[];
        console.log(posts.length);
        for(var i=0;i<posts.length;i++){
          if(posts[i].userId.toString() === req.user._id.toString())
          {updatedPosts.push(posts[i]);continue;}
          let usersId=posts[i].userId;
         // console.log(usersId);
          let found=userIds.findIndex(ele=>{
            return ele.toString() === usersId.toString();
          });
          //console.log(found);
          if(found !=-1) updatedPosts.push(posts[i]);
        }
        console.log(updatedPosts);
        res.render('other/index', {
          posts: updatedPosts,
          pageTitle: ' All Posts',
          path: '/',
          currentPage: page,
          hasNextPage: ITEMS_PER_PAGE * page < totalItems,
          hasPreviousPage: page > 1,
          nextPage: page + 1,
          previousPage: page - 1,
          lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
        });
      });
     
    })
    .catch(err => {
      console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getLike=(req,res,next)=>{
  const postId = req.params.postId;
  Post.findById(postId)
  .then(post => {
    let like={...post.like};
    let item=like.items;
    let totalLikes=like.totalLikes;
    const userId=req.user._id;
    let found = item.find(element =>{ 
      return element.userId.toString() == userId.toString()});
      if(found){
        totalLikes--;
        item=item.filter(ele=>{
        return ele.userId.toString() !==userId.toString();});
      }
    else {
      totalLikes++;
      item.push({userId:userId});
    }
    const updatedlike={
      items:item,
      totalLikes:totalLikes
    };
    post.like=updatedlike;
    return post.save();
  }).then(result=>{
     res.redirect('/posts');
  })
  .catch(err => {

    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  });
};

exports.deleteComment=(req,res,next)=>{
const postId=req.params.postId;
let content=req.query.content;
Post.findById(postId).then(post=>{
let comment={...post.comment};
let email=req.user.email;
let item=comment.items;
item=item.filter(ele=>{
return ele.email.toString() !== email.toString() ||  ele.content != content;
});
const updatedcomment={items:item};
post.comment=updatedcomment;
return post.save().then(result=>{
  res.redirect('/posts');

});
}).catch(err=>{
  console.log(err);
  const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
})
};
exports.getImage = (req, res, next) => {
 const postId=req.params.postId;
 Post.findById(postId).then(post=>{
  const imagePath = post.imageUrl;
  let imageName;
 let type=imagePath.split('.');
 if(type[1]='jpg'){
   imageName = 'image-' + postId + '.jpg';
   res.setHeader('Content-type','image/jpg')
 }
 else if(type[1]='jpeg'){
  imageName = 'image-' + postId + '.jpeg';
  res.setHeader('Content-type','image/jpeg')
}
else {
  imageName = 'image-' + postId + '.png';
  res.setHeader('Content-type','image/png')
}
res.setHeader(
    'Content-Disposition',
   'attachment; filename="' + imageName + '"'
   );
   const file=fs.createReadStream(imagePath);
   file.pipe(res);
});
};