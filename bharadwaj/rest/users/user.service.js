const config = require('config.json');
const jwt = require('jsonwebtoken');
const Role = require('_helpers/role');
const User = require('./user.model');

if (!String.prototype.toObjectId) {
    String.prototype.toObjectId = function () {
        var ObjectId = (require('mongoose').Types.ObjectId);
        return new ObjectId(this.toString());
    };
}

module.exports = {
    authenticate,
    readAll,
    create,
    read_,
    update,
    delete_,
    getId
};

async function getId({ token }) {
    var decoded = await jwt.verify(token, config.secret);
    return {
        "id": decoded.sub
    }
}

async function authenticate({ username, password }) {
    let user = await User.findOne({ username: username });
    if (user) {
        const token = jwt.sign({ sub: user.id }, config.secret);
        return {
            "token": token,
        }
    }
}

async function readAll() {
    let user = await User.find().lean();
    return user;
}

async function create({ username, email, password }) {
    const user = new User({
        username: username,
        email: email,
        password: password
    });
    let savedUser = await user.save();
    const token = jwt.sign({ sub: savedUser._id.toString() }, config.secret);
    return {
        token,
    }
}

async function read_({ id }) {
    let user = await User.findById(id).lean();
    return user;
}

async function update({ id, username, email, password }) {
    let query = await User.findById(id).lean();
    let user = await User.findByIdAndUpdate(query, {
        username: username,
        email: email,
        password: password
    });
    let updated_user = await User.findById(id).lean();
    return updated_user;
}

async function delete_({ id }) {
    const res = await User.deleteOne({ id: id });
    if (res == 1) {
        return {
            "removed": true
        }
    }
    else if (res == 0) {
        return {
            "removed": false
        }
    }
}