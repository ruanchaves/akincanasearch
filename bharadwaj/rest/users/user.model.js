var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Model = mongoose.model;

var userSchema = new Schema({

  username: { type: String , required: true, unique: true },
  password: { type: String , required: true },
  email: { type: String , required: true, unique: true },
  role: { type: Array , default: ['User'] }
});

const User = Model('User', userSchema);
module.exports = User;