const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const generateToken = (user) => {
    return jwt.sign({ id:user._id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

module.exports = { generateToken };