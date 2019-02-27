const expressJwt = require('express-jwt');
const { secret } = require('config.json');
const User = require('../users/user.model');
const jwt = require('jsonwebtoken');
const config = require('../config.json')

module.exports = authorize;

function authorize(roles = []) {
    if (typeof roles === 'string') {
        roles = [roles];
    }

    return [
        // authenticate JWT token and attach user to request object (req.user)
        expressJwt({ secret }),

        // authorize based on user role
        (req, res, next) => {
            // decode token, get id
            var id = req.user.sub;
            var query = User.findById(id, function (err,mongo_res) {
                if (!err) {
                    if(!roles.length){
                        return res.status(401).json({message: 'Unauthorized. No roles provided.'});
                    }
                    var flag = 0;
                    mongo_res.role.forEach(r => {
                        if(roles.includes(r)){
                            flag += 1;
                            res.roles = mongo_res.role;
                            res.tokenId = req.user.sub;
                            next();
                        }
                    });
                    if(flag === 0){
                        return res.status(401).json({message: 'Unauthorized. Access denied.'})
                    }
                }
            });
        }
    ];
}