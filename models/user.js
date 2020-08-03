const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  resetToken: String,
  resetTokenExpiration: Date,
  notifications: [String],
  haveNewNotifications:{type: Boolean,
 default:false
    }
});


module.exports = mongoose.model('User', userSchema);

