const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const chatRoomSchema = new Schema({
    users:{
        items:[{
            email:{type:String},
            message:[{
                content:{type:String},
                side:{type:String}
            }]
        }]
    }
});


module.exports = mongoose.model('ChatRoom', chatRoomSchema);