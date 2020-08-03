const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;

const ProfileSchema = new Schema( {
   user: {
       type: Schema.Types.ObjectId,
       ref: 'user'
   },  imageUrl: {
    type: String,
    required: true
  },  location: {
    type: String
},   bio: {
    type: String
},follower:[
    {
        email:{type:String},
        userId:{ type: Schema.Types.ObjectId}
    }
],
following:[
    {
        email:{type:String},
        userId:{ type: Schema.Types.ObjectId}
    }
],
blocked:[
    {
        email:{type:String},
        userId:{ type: Schema.Types.ObjectId}
    }
],
suggestion:[
    {
        email:{type:String},
        userId:{ type: Schema.Types.ObjectId},
        isFollowed:{type:Boolean},
        isBlocked:{type:Boolean}
    }
],
education: 
    {college: {
            type: String,
            required: true },
        degree: {  type: String,
            required: true} }
});

module.exports = Profile = mongoose.model( 'profile', ProfileSchema );