var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import express from 'express';
import { userAuth } from '../middlewares/userAuth.js';
import { User } from '../models/user.js';
import { sendMail } from '../mails/mail.js';
import { EventEmitter } from 'events';
export const userRouter = express.Router();
const event = new EventEmitter();
var otp = 0;
//POST/users
//add a new User
userRouter.post('/users', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = new User(req.body);
        user.status = 'enquiry';
        yield user.save();
        event.emit('addUser', user);
        res.status(201).send({ user });
    }
    catch (e) {
        res.status(400).send(e);
    }
}));
//GET/users/me/validate?email=''
//Generate and get otp for user validation
userRouter.get('/users/me/validate', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const email = req.query.email;
        otp = Math.floor(100000 + Math.random() * 900000); //generating 6 digit otp
        event.emit('verifyUser', email, otp); //event to send mail for otp validation
        let user = yield User.findOne({ email });
        if (user) {
            throw new Error('Email already exist');
        }
        res.send({ otp });
    }
    catch (e) {
        res.status(401).send(e);
    }
}));
//GET/users/me
//get user
userRouter.get('/users/me', userAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let user = req.user;
        res.send({ user });
    }
    catch (e) {
        console.log(e);
        res.status(404).send(e);
    }
}));
//POST/users/me/login
//login user using email and password
userRouter.post('/users/me/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User.findUserByCredentials(req.body);
        let token = yield user.generateAuthToken();
        res.send({ user, token });
    }
    catch (e) {
        res.status(401).send('Invalid Credentials');
    }
}));
//PATCH/users/me/logout
//logout user
userRouter.patch('/users/me/logout', userAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        req.user.tokens = (_a = req.user.tokens) === null || _a === void 0 ? void 0 : _a.filter((token) => {
            return token.token !== req.token;
        });
        yield req.user.save();
        res.send();
    }
    catch (e) {
        res.status(401).send();
    }
}));
//PATCH/users/me/logoutall
//logout all users
userRouter.patch('/users/me/logoutall', userAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        req.user.tokens = undefined;
        yield req.user.save();
        res.send();
    }
    catch (e) {
        res.status(500).send();
    }
}));
//mail events
//event to send mail when a new user registers
event.on('addUser', (user) => {
    sendMail(user.email, 'Welcome to IOTNO', 'Thank you for choosing us and we will strive to do better', []);
});
//event to send mail to user to validate otp
event.on('verifyUser', (email, otp) => {
    sendMail(email, 'IOTNO OTP Verification', 'OTP for IOTNO is ' + otp + '. Please enter this in the app registration page. Please do not share this otp number with anyone', []);
});
