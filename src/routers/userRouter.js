import express from 'express';
import { userAuth } from '../middlewares/userAuth.js';
import { User } from '../models/user.js';
import { sendMail } from '../mails/mail.js';
import { EventEmitter } from 'events';

export const userRouter = express.Router();
const event = new EventEmitter();

userRouter.post('/users', async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        event.emit('addUser', user);
        let token = await user.generateAuthToken();
        res.status(201).send({ user, token });
    } catch (e) {
        res.status(400).send(e);
    }
});

userRouter.post('/users/login', async (req, res) => {
    try {
        const user = await User.findUserByCredentials(req.body);
        let token = await user.generateAuthToken();
        res.send({ user, token });
    } catch (e) {
        res.status(401).send('Invalid Credentials')
    }
});

userRouter.patch('/users/logout', userAuth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token;
        })
        await req.user.save();
        res.send();
    } catch (e) {
        res.status(401).send();
    }
});

userRouter.patch('/users/logoutall', userAuth, async (req, res) => {
    try {
        req.user.tokens = undefined;
        await req.user.save();
        res.send();
    } catch (e) {
        res.status(500).send();
    }
});


event.on('addUser', (user) => {
    sendMail(user.email, 'Welcome to Team IOTNO', 'Thank you for choosing us and we will strive to do better');
});



