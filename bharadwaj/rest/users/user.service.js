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
    delete
};

async function authenticate({username, password }) {

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
    return { "id" : savedUser._id.toString() };
}

async function read({id}){
    let user = await User.findById(id).lean();
    return user;
}

async function update({id, username, email, password}){
    let user = User.findByIdAndUpdate(id, {

    })
}

async function delete({id}){

}

async function authenticate({ username, password }) {

    const user = User.findOne({username: username, password: password}, function (err, res) {
        if(err) {
            throw Error('Query failure.');
        }
        return res;
    });
    if (user) {
        const token = jwt.sign({ sub: user.id, role: user.role }, config.secret);
        const { password, ...userWithoutPassword } = user;
        return {
            ...userWithoutPassword,
            token
        };
    }
}

async function getAll() {
    return users.map(u => {
        const { password, ...userWithoutPassword } = u;
        return userWithoutPassword;
    });
}

async function getById(id) {
    const user = users.find(u => u.id === parseInt(id));
    if (!user) return;
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
}