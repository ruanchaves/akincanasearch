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



router.post('/authenticate', authenticate); 
router.post('/create', create); 


router.post('/read/:id', authorize(), read);  
router.post('/update/:id', authorize(), update);  
router.post('/delete/:id', authorize(), delete);  


module.exports = router;

// CONTROLLERS


const readAll = (req, res, next) => {
    const currentUser = req.user;
    const id = parseInt(req.params.id);
     if (currentUser.role !== Role.Admin) {
        return res.status(401).json({ message: 'Unauthorized' });
    }   
    userService.readAll(req.body)
        .then(handleUser(res)).catch(handleError(next));
};




const authenticate = (req, res, next) =>
    userService.authenticate(req.body)
        .then(handleUser(res)).catch(handleError(next));

const create = (req, res, next) =>
    userService.create(req.body)
        .then(handleUser(res)).catch(handleError(next));



const read = (req, res, next) => {
    const currentUser = req.user;
    const id = parseInt(req.params.id);
    if (id !== currentUser.sub && currentUser.role !== Role.Admin) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    userService.read(req.body)
        .then(handleUser(res)).catch(handleError(next));
};

const update = (req, res, next) => {
    const currentUser = req.user;
    const id = parseInt(req.params.id);
    if (id !== currentUser.sub && currentUser.role !== Role.Admin) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    userService.update(req.body)
        .then(handleUser(res)).catch(handleError(next));
};

const delete = (req, res, next) => {
    const currentUser = req.user;
    const id = parseInt(req.params.id);
    if (id !== currentUser.sub && currentUser.role !== Role.Admin) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    userService.delete(req.body)
        .then(handleUser(res)).catch(handleError(next));
};


