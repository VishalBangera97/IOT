import express from 'express';
import { userAuth } from '../middlewares/userAuth.js'
import { Device } from '../models/device.js';
import fs from 'fs'
import { adminAuth } from '../middlewares/adminAuth.js';


export const deviceRouter = express.Router();

deviceRouter.post('/devices', adminAuth, async (req, res) => {
    try {
        const device = new Device(req.body);
        await device.save();
        res.status(201).send(device);
    } catch (e) {
        res.status(400).send();
    }
});

deviceRouter.patch('/bulb', userAuth, async (req, res) => {
    try {
        const device = await Device.findOne({ userId: req.user._id });
        device.bulb = req.query.status;
        await device.save();
        res.set('Content-Type', 'text/plain');
        res.send({ value: device.bulb });

    } catch (e) {
        res.status(500).send();
    }
});

deviceRouter.get('/bulb', async (req, res) => {
    try {
        const device = await Device.findOne({ userId: req.query.userId });
        res.set('Content-Type', 'text/plain');
        res.send({ bulbStatus: device.bulb });
    } catch (e) {
        res.status(500).send();
    }
});



// experimentals
deviceRouter.get('/nodemcu', async (req, res) => {
    try {
        let host = req.query.host;
        let url = "/data";
        console.log('here')
        res.redirect(String("GET ") + url + " HTTP/1.1\r\n" + "Host: " + host + "\r\n" + "Connection: close\r\n\r\n");
    } catch (e) {
        res.status(501).send(e);
    }
});

let data;

deviceRouter.post('/receivePostData', async (req, res) => {
    try {
        data = req.body.value;
        fs.appendFile('data.txt', data);
        res.send('Server received the value : ' + data);
    } catch (e) {
        res.status(501).send();
    }
});

deviceRouter.get('/data', async (req, res) => {
    try {
        console.log(data)
        res.send(data);
    } catch (e) {
        res.status(500).send();
    }
})
