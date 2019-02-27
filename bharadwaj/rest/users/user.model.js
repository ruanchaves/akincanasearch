var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Model = mongoose.model;

var userSchema = new Schema({

  username: { type: String , required: true, unique: true },
  email: { type: String , required: true, unique: true },
  role: { type: Array , default: ['User'] },
  password: { type: String, required: true, bcrypt: true}
});

userSchema.plugin(require('mongoose-bcrypt'));

const User = Model('User', userSchema);
module.exports = User;