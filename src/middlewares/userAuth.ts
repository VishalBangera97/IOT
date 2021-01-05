import { config } from 'dotenv';
import { NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.js';

config();

export const userAuth = async (req: any, res: any, next: NextFunction) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '') as string;
        const decode: any = jwt.verify(token, process.env.SECRET_KEY!);
        const user = await User.findOne({ _id: decode._id, 'tokens.token': token });
        if (!user) {
            throw new Error('Invalid User');
        }
        req.user = user;
        req.token = token;
        next();
    } catch (e) {
        res.status(401).send('Please Authenticate');
    }
}