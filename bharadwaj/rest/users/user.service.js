const config = require('config.json');
const jwt = require('jsonwebtoken');
const Role = require('_helpers/role');
const User = require('./user.model');

module.exports = {
    authenticate,
    readAll,
    create,
    read,
    update,
    delete_
};

async function authenticate({username, password }) {
    console.log(username);
    console.log(password);
    let user = await User.findOne({username: username});
    console.log(user);
    if (user) {
        const token = jwt.sign({sub: user.id}, config.secret);
        return {
            "token" : token,
        }
    }
}

async function readAll(){
    let user = await User.find().lean();
    return user;
}

async function create({ username, email, password }){
    const user = new User({
        username: username,
        email: email,
        password: password
    });
    let savedUser = await user.save();
    const token = jwt.sign({sub: savedUser._id.toString()}, config.secret);
    return { 
        token,
    }
}

async function read({id}){
    let user = await User.findById(id).lean();
    return user;
}

async function update({id, username, email, password}){
    let query = await User.findOne({id: id}).lean();
    let user = await User.findByIdAndUpdate(query, {
        username: username,
        email: email,
        password: password
    });
}

async function delete_({id}){
    const res = await User.deleteOne({id: id});
    if (res == 1){
        return {
            "removed" : true
        }
    }
    else if (res == 0) {
        return {
            "removed" : false
        }
    }
}