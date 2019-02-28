const express = require('express');
const router = express.Router();
const userService = require('./user.service');
const authorize = require('_helpers/authorize')
const Role = require('_helpers/role');

const handleUser = res => user => 
    user ? res.json(user) : res.status(400).json({ message: 'Error'});

const handleError = next => err => next(err);

// ROUTES


router.get('/readAll', authorize(Role.Admin), readAll); 

router.get('/read_/:userId', authorize(), read_); 


router.post('/authenticate', authenticate); 
router.post('/create', create); 
router.post('/getId', getId); 


router.post('/update/:userId', authorize(), update);  
router.post('/delete_/:userId', authorize(), delete_);  


module.exports = router;

// CONTROLLERS

// get.public


// get.admin
function readAll (req, res, next) {
    var request_body = {...req.body}
    var request_object = {}
    Object.keys(request_body).forEach(key => { request_object = JSON.parse(key);});
    request_object.id = req.params.userId;
    userService.readAll(request_object)
        .then(handleUser(res)).catch(handleError(next));
};


// get.admin_self
function read_ (req, res, next) {
    const userId = req.params.userId;
    const tokenId = req.res.tokenId;
    const roles = req.res.roles;
    if( !roles.includes(Role.Admin) && userId != tokenId) {
        return res.status(401).json({message: 'Unauthorized - read_'});
    }
    var request_body = {...req.body}
    var request_object = {}
    Object.keys(request_body).forEach(key => { request_object = JSON.parse(key);});
    request_object.id = userId;
    request_object.tokenId = tokenId;
    userService.read_(request_object)
        .then(handleUser(res)).catch(handleError(next));
};


//get.user

// post.public
function authenticate (req, res, next) {
    userService.authenticate(req.body)
        .then(handleUser(res)).catch(handleError(next));
}
function create (req, res, next) {
    userService.create(req.body)
        .then(handleUser(res)).catch(handleError(next));
}
function getId (req, res, next) {
    userService.getId(req.body)
        .then(handleUser(res)).catch(handleError(next));
}

// post.admin

// post.admin_self
function update (req, res, next) {
    const userId = req.params.userId;
    const tokenId = req.res.tokenId;
    const roles = req.res.roles;
    if( !roles.includes(Role.Admin) && userId != tokenId) {
        return res.status(401).json({message: 'Unauthorized - update'});
    }
    console.log(req.body);
    var request_object = {...req.body}
    request_object.id = userId;
    request_object.tokenId = tokenId;
    console.log(request_object);
    userService.update(request_object)
        .then(handleUser(res)).catch(handleError(next));
};

function delete_ (req, res, next) {
    const userId = req.params.userId;
    const tokenId = req.res.tokenId;
    const roles = req.res.roles;
    if( !roles.includes(Role.Admin) && userId != tokenId) {
        return res.status(401).json({message: 'Unauthorized - update'});
    }
    console.log(req.body);
    var request_object = {...req.body}
    request_object.id = userId;
    request_object.tokenId = tokenId;
    console.log(request_object);
    userService.delete_(request_object)
        .then(handleUser(res)).catch(handleError(next));
};


//post.user

//admin_list

//admin_self_list

//user_list
