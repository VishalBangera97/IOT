var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import jwt from 'jsonwebtoken';
import { Admin } from '../models/admin.js';
import { config } from 'dotenv';
config();
export const adminAuth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let token = req.header('Authorization').replace('Bearer ', '');
        let decode = jwt.verify(token, process.env.SECRET_KEY || '');
        let admin = yield Admin.findOne({ _id: decode.id, 'tokens.token': token });
        if (!admin) {
            throw new Error('Please Authenticate');
        }
        req.admin = admin;
        req.token = token;
        next();
    }
    catch (e) {
        res.status(401).send('Please Authenticate');
    }
});
