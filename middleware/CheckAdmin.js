const jwt = require('jsonwebtoken');
const Admin = require('../model/AdminModel');

const ChcekisAdmin = async (req, res, next) => {
    try {

        const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Token is missing' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRATE_KEY);

        const user = await Admin.findById(decoded.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.isAdmin) {
            return res.status(403).json({ message: 'You do not have permission to perform this action' });
        }

        req.user = user;

        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ message: 'Token has expired. Please log in again.' });
        }
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({ message: 'Invalid token. Please log in again.' });
        }
        console.error(error);
        return res.status(500).json({ message: 'Error At CheckisAdmin Middlwware' });
    }
};

module.exports = ChcekisAdmin;
