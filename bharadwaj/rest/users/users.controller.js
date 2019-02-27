const express = require('express');
const router = express.Router();
const userService = require('./user.service');
const authorize = require('_helpers/authorize')
const Role = require('_helpers/role');

const handleUser = res => user => 
    user ? res.status(201).json(user) : res.status(400).json({ message: 'Error'});

const handleError = next => err => next(err);

// ROUTES


router.get('/readAll', authorize(Role.Admin), readAll); 

router.get('/read/:id', authorize(), read); 


router.post('/authenticate', authenticate); 
router.post('/create', create); 


router.post('/update/:id', authorize(), update);  
router.post('/delete_/:id', authorize(), delete_);  


module.exports = router;

// CONTROLLERS


function readAll (req, res, next) {
    const currentUser = req.user;
    const id = parseInt(req.params.id);
     if (currentUser.role !== Role.Admin) {
        return res.status(401).json({ message: 'Unauthorized' });
    }   
    userService.readAll(req.body)
        .then(handleUser(res)).catch(handleError(next));
};


function read (req, res, next) {
    const currentUser = req.user;
    const id = parseInt(req.params.id);
    if (id !== currentUser.sub && currentUser.role !== Role.Admin) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    userService.read(req.body)
        .then(handleUser(res)).catch(handleError(next));
};



function authenticate (req, res, next) {
    userService.authenticate(req.body)
        .then(handleUser(res)).catch(handleError(next));
};

function create (req, res, next) {
    userService.create(req.body)
        .then(handleUser(res)).catch(handleError(next));
};



function update (req, res, next) {
    const currentUser = req.user;
    const id = parseInt(req.params.id);
    if (id !== currentUser.sub && currentUser.role !== Role.Admin) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    userService.update(req.body)
        .then(handleUser(res)).catch(handleError(next));
};

function delete_ (req, res, next) {
    const currentUser = req.user;
    const id = parseInt(req.params.id);
    if (id !== currentUser.sub && currentUser.role !== Role.Admin) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    userService.delete_(req.body)
        .then(handleUser(res)).catch(handleError(next));
};


