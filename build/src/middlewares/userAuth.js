var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { config } from 'dotenv';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.js';
config();
export const userAuth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decode = jwt.verify(token, process.env.SECRET_KEY);
        const user = yield User.findOne({ _id: decode._id, 'tokens.token': token });
        if (!user) {
            throw new Error('Invalid User');
        }
        req.user = user;
        req.token = token;
        next();
    }
    catch (e) {
        res.status(401).send('Please Authenticate');
    }
});
