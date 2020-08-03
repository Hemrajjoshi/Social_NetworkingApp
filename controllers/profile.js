
const path = require('path');
const fileHelper = require('../util/file');
const { validationResult } = require('express-validator/check');
const Profile = require('../models/profile');
const User = require('../models/user');
exports.getProfile=(req,res,next)=>{
  //console.log('1');
    const userId=req.user._id;
    const email=req.user.email;
   // console.log(userId); 
   // console.log(email);
    Profile.findOne({user:userId}).then(profile=>{
    const hasProfile=(profile)?true:false;
    //console.log(hasProfile);
     // console.log(profile);
        res.render('other/profile',{ profile:profile,
            pageTitle:email,
            path: '/profile',
            hasProfile:hasProfile,
            Title:req.user.email
        });
    }) .catch(err=>{
      console.log('3');
    console.log(err);
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
});
};
exports.getAddProfile = (req, res, next) => {
  console.log('in get');
    res.render('other/edit-profile', {
      pageTitle: 'Add Profile',
      path: '/add-profile',
      editing: false,
      hasError: false,
      errorMessage: null,
      validationErrors: [],
      user:req.user._id
    });
  };
  exports.postAddProfile = (req, res, next) => {
    //console.log('in post');
    const user = req.body.user;
    const image = req.file;
    const bio=req.body.bio;
    const location=req.body.location;
    const college=req.body.college;
    const degree=req.body.degree;
    console.log(degree);
    console.log('new');
    if (!image) {
      console.log('2');
      return res.status(422).render('other/edit-profile', {
        pageTitle: 'Add Profile',
        path: '/add-profile',
        editing: false,
        hasError: true,
        profile: {
          bio: bio,
          location:location,
          education:{
          degree:degree,
          college:college},
          user:user
        },
        user:user,
        errorMessage: 'Attached file is not an image.',
        validationErrors: []
      });
    }
    //console.log('3');
   const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors.array());
      return res.status(422).render('other/edit-profile', {
        pageTitle: 'Add Profile',
        path: '/add-profile',
        editing: false,
        hasError: true,
        profile: {
          bio: bio,
          location:location,
          education:{
          degree:degree,
          college:college},
          user:user
        },
        user:user,
        errorMessage: errors.array()[0].msg,
        validationErrors: errors.array()
      });
    }
  const suggestion=[];
  User.find().then(users=>{
    const items=[];
    for(var i=0;i<users.length;i++){
      if(users[i].email != req.user.email){
        const item={email:users[i].email,userId:users[i]._id,isFollowed:false,isBlocked:false};
        items.push(item);
      }
    }
    console.log('suggestion:'+items);
    const imageUrl = image.path;
    const profile = new Profile({
      bio: bio,
      location:location,
      education:{
       degree:degree,
      college:college},
      imageUrl: imageUrl,
      suggestion:items,
user: user
    });
   return  profile
      .save()
      .then(result => {
        // console.log(result);
        console.log('Created Profile');
        res.redirect('/profile');
      });
    }).catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
  };
  exports.getEditProfile = (req, res, next) => {
    const editMode = req.query.edit;
    console.log('in edit');
    const profileId = req.params.profileId;
    console.log(profileId);
    if (!editMode) {
      return res.redirect('/profile');
    }  
    Profile.findById(profileId)
      .then(profile => {
        if (!profile) {
          return res.redirect('/');
        }
        res.render('other/edit-profile', {
          pageTitle: 'Edit Profile',
          path: '/edit-profile',
          editing: editMode,
          profile: profile,
          hasError: false,
          errorMessage: null,
          user:req.user._id,
          validationErrors: []
        });
      })
      .catch(err => {
        console.log(err);
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
  };
  exports.postEditProfile = (req, res, next) => {
    const profileId = req.body.profileId;
    const updatedBio = req.body.bio;
    const updatedLocation = req.body.location;
    const updatedDegree = req.body.degree;
    const updatedCollege = req.body.college;
    const image = req.file;
    const user=req.body.user;
    console.log(user);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors.array());
      return res.status(422).render('other/edit-profile', {
        pageTitle: 'Edit Profile',
        path: '/edit-profile',
        editing: true,
        hasError: true,
        profile: {
          bio: updatedBio,
          location:updatedLocation,
          education:{
          degree:updatedDegree,
          college:updatedCollege},
          _id: profileId,
          user:user
        },
        user:user,
        errorMessage: errors.array()[0].msg,
        validationErrors: errors.array()
      });
    }
  
    Profile.findById(profileId)
      .then(profile => {
        if (profile.user.toString() !== req.user._id.toString()) {
          return res.redirect('/');
        }
        profile.bio=updatedBio;
        profile.location=updatedLocation;
        profile.education={degree:updatedDegree,college:updatedCollege};
        if (image) {
          fileHelper.deleteFile(profile.imageUrl);
          profile.imageUrl = image.path;
        }
        return profile.save().then(result => {
          console.log('UPDATED Profile!');
          res.redirect('/profile');
        });
      })
      .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
  };
  exports.getFollower=(req,res,next)=>{
   const profileId=req.params.profileId;
   Profile.findById(profileId).then(profile=>{
     //console.log(profile);
     const follower=profile.follower;
     const profileId=profile._id;
     res.render('other/follower',{
    followers:follower,
    pageTitle:'Followers',
    path:'/follower',
    profileId:profileId
     });
   }).catch(err=>{
    console.log(err);
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
   })
  };
  function compare(a,b){
    const emailA = a.email.toUpperCase();
  const emailB = b.email.toUpperCase();
  let comparison = 0;
  if (emailA > emailB) {
    comparison = 1;
  } else if (emailA < emailB) {
    comparison = -1;
  }
  return comparison;
  }
  exports.getFollowing=(req,res,next)=>{
    const profileId=req.params.profileId;
    Profile.findOne({_id:profileId}).then(profile=>{
      //console.log(profile);
      const following=profile.following;
      const profileId=profile._id;
      var suggestiones=profile.suggestion;
      const email=req.user.email;
      return User.find().then(users=>{
        //console.log(users);
        let items=[];
        for(var i=0;i<users.length;i++){``
          if(users[i].email == email) continue;
          else items.push({ email:users[i].email,userId:users[i]._id,isFollowed:false,isBlocked:false});
        }
        let updatedSuggestion=[];
        items.sort(compare);
        suggestiones.sort(compare);
        let emails=[];
        //for(var i=0;i<items.length;i++){
         // console.log(items[i]);}
          for(var i=0;i<suggestiones.length;i++){
emails.push(suggestiones[i].email);
          }
          for(var i=0;i<items.length;i++){
            let item=items[i].email;
            let index=emails.indexOf(item);
            if(index == -1) updatedSuggestion.push(items[i]);
          } 
          for(var i=0;i<suggestiones.length;i++){
            let suggestion=suggestiones[i];
            updatedSuggestion.push(suggestion);}
        updatedSuggestion.sort(compare);
        //console.log('updatedSuggestion:'+updatedSuggestion[0]);
        return Profile.findOne({_id:profileId}).then(profile=>{
          profile.suggestion=updatedSuggestion;
          return profile.save().then(result=>{
            res.render('other/following',{
              followings:following,
              pageTitle:'Followings',
              path:'/following',
              profileId:profileId,
              suggestiones:updatedSuggestion  });
          });
          });
        });
    }).catch(err=>{
     console.log(err);
     const error = new Error(err);
     error.httpStatusCode = 500;
     return next(error);
    })
  };
  exports.removeFollower=(req,res,next)=>{
    const userId=req.user._id;
    const email=req.user.email;
    const followerId=req.params.userId;
    const profileId=req.params.profileId;
    const  follower_email=req.params.email;
    //console.log('profileId:'+profileId);
    //console.log('userId'+userId);
    //console.log('email'+email);
    let profile1,profile2;
    Profile.find().then(profiles=>{
      for(var i=0;i<profiles.length;i++){
        if(profiles[i].user.toString() === followerId.toString()){
          profile2=profiles[i];
        }
        else if(profiles[i].user.toString() === userId.toString()){
          profile1=profiles[i];
        }
      }
      //console.log('profile1'+profile1);
      //console.log('profile2'+profile2);
      let follower1=profile1.follower;let following2=profile2.following;
      let suggestion2=profile2.suggestion;
      following2=following2.filter(ele=>{
        return ele.email != email;
      });
      follower1=follower1.filter(ele=>{
        return ele.email != follower_email;
      });
      for(var i=0;i<suggestion2.length;i++){
       if(suggestion2[i].email == email){
         suggestion2[i].isFollowed=false;
       }
      }
      return Profile.findOne({user:userId}).then(profile=>{
        //console.log('profile'+profile);
      //console.log('follower2'+follower1);
        profile.follower=follower1;
        return profile.save().then(result=>{
          return Profile.findOne({user:followerId}).then(profile=>{ 
          //console.log('profile'+profile);
            //console.log('following1'+following2);
            profile.following=following2;profile.suggestion=suggestion2;
            return profile.save().then(result=>{
              return User.findById(followerId).then(user=>{
                let notifications=user.notifications;
                notifications.push(email +' removed  You form his followerlist');
                user.notifications=notifications;
                let haveNewNotifications=true;
                user.haveNewNotifications=haveNewNotifications;
                return user.save().then(result=>{
                  res.redirect('/profile');
                });
              });
            });
        });
      });
    });
    }).catch(err=>{
      console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });

  };
  exports.followUser=(req,res,next)=>{
    const followerId=req.user._id;
    const follower_email=req.user.email;
    const userId=req.params.userId;
    const profileId=req.params.profileId;
    const email=req.params.email;
    //console.log('profileId:'+profileId);
    //console.log('userId'+userId);
    //console.log('email'+email);
    let profile1,profile2;
    Profile.find().then(profiles=>{
      for(var i=0;i<profiles.length;i++){
        if(profiles[i].user.toString() === followerId.toString()){
          profile1=profiles[i];
        }
        else if(profiles[i].user.toString() === userId.toString()){
          profile2=profiles[i];
        }
      }
      if(profile2 === undefined){
        return res.redirect('/profile');
      }
      //console.log('profile1'+profile1);
      //console.log('profile2'+profile2);
      let follower2=profile2.follower;let following1=profile1.following;
      let suggestion1=profile1.suggestion;
      following1.push({userId:userId,email:email});
      follower2.push({userId:followerId,email:follower_email});
      for(var i=0;i<suggestion1.length;i++){
       if(suggestion1[i].email == email){
         suggestion1[i].isFollowed=true;
       }
      }
      return Profile.findOne({user:userId}).then(profile=>{
      
        //console.log('profile'+profile);
        //console.log('follower2'+follower2);
        profile.follower=follower2;
        return profile.save().then(result=>{
          return Profile.findOne({user:followerId}).then(profile=>{ 
           // console.log('profile'+profile);
            //console.log('following1'+following1);
            profile.following=following1;profile.suggestion=suggestion1;
            return profile.save().then(result=>{
              return  User.findOne({_id:userId}).then(user=>{
                let notifications=user.notifications;
                notifications.push(follower_email+' is started following You');
                user.notifications=notifications;
                let haveNewNotifications=true;
                user.haveNewNotifications=haveNewNotifications;
                return user.save().then(result=>{
                  res.redirect('/profile');
                });
              })  
            });
        });

      });
    });
    }).catch(err=>{
      console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    })

  };
  exports.unFollowUser=(req,res,next)=>{
    const unFollowerId=req.user._id;
    const unFollower_email=req.user.email;
    const userId=req.params.userId;
    const profileId=req.params.profileId;
    const email=req.params.email;
    //console.log('profileId:'+profileId);
   // console.log('userId'+userId);
    //console.log('email'+email);
    let profile1,profile2;
    Profile.find().then(profiles=>{
      for(var i=0;i<profiles.length;i++){
        if(profiles[i].user.toString() === unFollowerId.toString()){
          profile1=profiles[i];
        }
        else if(profiles[i].user.toString() === userId.toString()){
          profile2=profiles[i];
        }
      }
      //console.log('profile1'+profile1);
      //console.log('profile2'+profile2);
      let follower2=profile2.follower;let following1=profile1.following;
      let suggestion1=profile1.suggestion;
      following1=following1.filter(ele=>{
        return ele.email != email;
      });
      follower2=follower2.filter(ele=>{
        return ele.email != unFollower_email;
      });
      for(var i=0;i<suggestion1.length;i++){
       if(suggestion1[i].email == email){
         suggestion1[i].isFollowed=false;
       }
      }
      return Profile.findOne({user:userId}).then(profile=>{
       // console.log('profile'+profile);
      //console.log('follower2'+follower2);
        profile.follower=follower2;
        return profile.save().then(result=>{
          return Profile.findOne({user:unFollowerId}).then(profile=>{ 
         // console.log('profile'+profile);
           // console.log('following1'+following1);
            profile.following=following1;profile.suggestion=suggestion1;
            return profile.save().then(result=>{
              return  User.findOne({_id:userId}).then(user=>{
                let notifications=user.notifications;
                notifications.push(unFollower_email+' unfollowed  You');
                user.notifications=notifications;
                let haveNewNotifications=true;
                user.haveNewNotifications=haveNewNotifications;
                return user.save().then(result=>{
                  res.redirect('/profile');
                });
              });
              res.redirect('/profile');
            });
        });
      });
    });
    }).catch(err=>{
      console.log(err);
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    })

  };
  exports.getBlockedUsers=(req,res,next)=>{
    const profileId=req.params.profileId;
   Profile.findOne({_id:profileId}).then(profile=>{
     let blocked_user=profile.blocked;
     res.render('other/blocked-user',{
      users:blocked_user,
      pageTitle:'Blocked Users',
       profileId:profileId,
       path:'/blocked-user'
     });
   }).catch(err=>{
    console.log(err);
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
   });
  };
  exports.blockUser=(req,res,next)=>{
const profileId=req.params.profileId;
const reqId=req.user._id;
const req_email=req.user.email;
const email=req.params.email;
const userId=req.params.userId;
//console.log(email);
//console.log(req_email);
return Profile.find().then(profiles=>{
  //console.log('profile'+profile);
  //console.log(profiles);
  console.log('1');
  let profile1,profile2;
  for(var i=0;i<profiles.length;i++){
  if(profiles[i].user.toString() === reqId.toString())
    profile1=profiles[i];
  else if(profiles[i].user.toString() === userId.toString())
    profile2=profiles[i];
  }
  console.log(profile1);
  console.log(profile2);
  if(profile2 === undefined){
    return res.redirect('/profile');
  }
  let req_follower=profile1.follower;
  let req_following=profile1.following;
  let req_suggestion=profile1.suggestion;
  //console.log('req_suggestion:'+req_suggestion);
  let req_blocked=profile1.blocked;
  //console.log(req_blocked);
  req_blocked.push({userId:userId,email:email});
  for(var i=0;i<req_suggestion.length;i++){
    if(req_suggestion[i].email == email)
    req_suggestion[i].isBlocked=true;
  }
  //console.log('req_suggestion:'+updatedSuggestion);
  req_follower=req_follower.filter(ele=>{
    return ele.email != email;
  });
  req_following=req_following.filter(ele=>{
    return ele.email != email;
  });
  let followeres=profile2.follower;
  let followinges=profile2.following;
  let suggestion=profile2.suggestion;
  followinges=followinges.filter(ele=>{
    return ele.email != req_email;
  });
  followeres=followeres.filter(ele=>{
    return ele.email != req_email;
  });
  for(var i=0;i<suggestion.length;i++){
    if(suggestion[i].email == req_email)
   {suggestion[i].isBlocked=true;
    console.log(suggestion[i]);}
  }
  return Profile.findOne({user:reqId}).then(profile=>{
    console.log('2');
    profile.suggestion=req_suggestion;
  profile.following=req_following;
  profile.follower=req_follower;
  profile.blocked=req_blocked;
  return profile.save().then(result=>{
    console.log('3');
    return Profile.findOne({user:userId}).then(profile=>{ 
      console.log('4');
      profile.follower=followeres;
      profile.following=followinges;
      profile.suggestion=suggestion;
      return profile.save().then(result=>{
        console.log('5');
        res.redirect('/profile');
    });
  });
  });
});
}).catch(err=>{
  console.log(err);
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
});
  };
  exports.unBlockUser=(req,res,next)=>{
    const profileId=req.params.profileId;
    const email=req.params.email;
    const userId=req.params.userId;
    const reqId=req.user._id;
    const req_email=req.user.email;
    return Profile.findOne({user:reqId}).then(profile=>{
      let req_suggestion=profile.suggestion;
      let req_blocked=profile.blocked;
      req_blocked=req_blocked.filter(ele=>{
        return ele.email != email;
      });
      for(var i=0;i<req_suggestion.length;i++){
        if(req_suggestion[i].email ==email)
          req_suggestion[i].isBlocked=false;
      }
      profile.suggestion=req_suggestion;
      profile.blocked=req_blocked;
      return profile.save().then(result=>{
         return Profile.findOne({user:userId}).then(profile=>{
          if(profile == null){
            res.redirect('/profile');
          }
          else{
          let suggestion=profile.suggestion;
          for(var i=0;i<suggestion.length;i++){
            if(suggestion[i].email == req_email)
            suggestion[i].isBlocked=false;
          }
          profile.suggestion=suggestion;
          return profile.save().then(result=>{
            res.redirect('/profile');
          });
        }
        });
      });
    }).catch(err=>{
      const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
    });
  };