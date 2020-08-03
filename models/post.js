const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const postSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  comment:{ items:[
{ email:{ type: String}, content:{ type:String} ,totalLikes:{
  type:Number,default: 0},
  likers:[],
  reply:[{
    email:{ type: String}, content:{ type:String},totalLikes:{
      type:Number,default: 0},
      likers:[]
  }]
 }
  ]
  },
  like:{
    items:[{
      userId:{
       type: Schema.Types.ObjectId}
    }  
        ],
     totalLikes:{
       type:Number,default: 0
     }   
  }
});

module.exports = mongoose.model('Post', postSchema);

