import jwt from 'jsonwebtoken';
import { Admin } from '../models/admin.js';

export const adminAuth = async (req, res, next) => {
    try {
        let token = req.header('Authorization').replace('Bearer ', '');
        let decode = jwt.verify(token, process.env.SECRET_KEY);
        let admin = await Admin.findOne({ _id: decode.id, 'tokens.token': token });
        if (!admin) {
            throw new Error('Please Authenticate');
        }
        req.admin = admin;
        req.token = token;
        next();
    } catch (e) {
        res.status(401).send('Please Authenticate');
    }
}