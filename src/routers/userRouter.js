import express from 'express';
import request from 'request';
import { auth } from '../middlewares/auth.js';
import { User } from '../models/user.js';

export const userRouter = express.Router();

var led = true;


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

userRouter.patch('/users/logout',auth,async(req,res)=>{
    try{
    req.user.tokens=req.user.tokens.filter((token)=>{
        return token.token !== req.token;
    })
    await req.user.save();
    res.send();
    }catch(e){
        res.status(401).send();
    }
});

userRouter.patch('/users/logoutall',auth,async(req,res)=>{
    try{
    req.user.tokens=undefined;
    await req.user.save();
    res.send();
    }catch(e){
      res.status(500).send();
    }
})

userRouter.patch('/bulb', auth, async (req, res) => {
    const User = req.user;
    const operations = Object.values(req.query);
    // let allowedOperations = [true, false];
    // let validOperation = operations.every((operation) => allowedOperations.includes(operation));
    // if (!validOperation) {
    //     return res.status(400).send('Invalid Operation');
    // }
    User.devices.bulb = req.query.status;
    await User.save();
    res.set('Content-Type', 'text/plain');
    res.send({ value: User.devices.bulb });
    // let host="192.168.4.1";
    // let url="/data/?value=1";
    // request(String("GET ") + url + " HTTP/1.1\r\n" + "Host: " + host + "\r\n" +"Connection: close\r\n\r\n");  
});




userRouter.get('/bulb',async (req, res) => {
    const user = await User.findById(req.query.userId);
    res.set('Content-Type', 'text/plain');// set the headers 
    if (user.devices.bulb) {
        res.send({ value: 1 });// if led is on or true, send value=1    
    } else {
        res.send({ value: 0 });//else send value = 0    
    }
});