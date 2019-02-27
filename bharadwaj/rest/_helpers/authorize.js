const expressJwt = require('express-jwt');
const { secret } = require('config.json');
const User = require('../users/user.model');
const jwt = require('jsonwebtoken');
const config = require('../config.json');
const Role = require('_helpers/role');

module.exports = authorize;

function authorize(roles = ['User']) {
    return [
        // authenticate JWT token and attach user to request object (req.user)
        expressJwt({ secret }),

        // authorize based on user role
        (req, res, next) => {
            // decode token, get id
            var id = req.user.sub;
            var query = User.findById(id, function (err, mongo_res) {
                if (!err) {
                    var flag = 0;
                    try {
                        mongo_res.role.forEach(r => {
                            if (roles.includes(r)) {
                                flag += 1;
                                res.roles = mongo_res.role;
                                res.tokenId = req.user.sub;
                                next();
                            }
                        });
                    } catch (e) {
                        return res.status(401).json({message: e.message});
                    }
                    if (flag === 0) {
                        return res.status(401).json({ message: 'Unauthorized. Access denied.' })
                    }
                }
            });
        }
    ];
}