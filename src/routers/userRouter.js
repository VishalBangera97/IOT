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
userRouter.post('/users', async (req, res) => {
    try {
        const user = new User(req.body);
        user.status = 'enquiry';
        await user.save();
        event.emit('addUser', user);
        res.status(201).send({ user });
    } catch (e) {
        res.status(400).send(e);
    }
});

//GET/users/me/validate?email=''
//Generate and get otp for user validation
userRouter.get('/users/me/validate', async (req, res) => {
    try {
        const email = req.query.email;
        otp = Math.floor(100000 + Math.random() * 900000); //generating 6 digit otp
        event.emit('verifyUser', email, otp); //event to send mail for otp validation
        let user = await User.findOne({ email });
        if (user) {
            throw new Error('Email already exist');
        }
        res.send({ otp });
    } catch (e) {
        res.status(401).send(e);
    }
});

//GET/users/me
//get user
userRouter.get('/users/me', userAuth, async (req, res) => {
    try {
        let user = req.user;
        res.send({ user });
    } catch (e) {
        res.status(404).send(e);
    }
});


//POST/users/me/login
//login user using email and password
userRouter.post('/users/me/login', async (req, res) => {
    try {
        const user = await User.findUserByCredentials(req.body);
        let token = await user.generateAuthToken();
        res.send({ user, token });
    } catch (e) {
        res.status(401).send('Invalid Credentials')
    }
});

//PATCH/users/me/logout
//logout user
userRouter.patch('/users/me/logout', userAuth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token;
        });
        await req.user.save();
        res.send();
    } catch (e) {
        res.status(401).send();
    }
});

//PATCH/users/me/logoutall
//logout all users
userRouter.patch('/users/me/logoutall', userAuth, async (req, res) => {
    try {
        req.user.tokens = undefined;
        await req.user.save();
        res.send();
    } catch (e) {
        res.status(500).send();
    }
});


//mail events

//event to send mail when a new user registers
event.on('addUser', (user) => {
    sendMail(user.email, 'Welcome to IOTNO', 'Thank you for choosing us and we will strive to do better');
});

//event to send mail to user to validate otp
event.on('verifyUser', (email, otp) => {
    sendMail(email, 'IOTNO OTP Verification', 'OTP for IOTNO is ' + otp + '. Please enter this in the app registration page. Please do not share this otp number with anyone');
});



