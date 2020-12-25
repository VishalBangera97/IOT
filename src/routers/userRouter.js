import express from 'express';
import request from 'request';
import { auth } from '../middlewares/auth.js';
import { User} from '../models/user.js';
import {Device} from '../models/device.js';

export const userRouter = express.Router();

userRouter.post('/users', async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
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

userRouter.patch('/users/logout', auth, async (req, res) => {
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

userRouter.patch('/users/logoutall', auth, async (req, res) => {
    try {
        req.user.tokens = undefined;
        await req.user.save();
        res.send();
    } catch (e) {
        res.status(500).send();
    }
});

