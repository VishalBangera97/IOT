import express from 'express';
import { auth } from '../middlewares/auth.js'
import { Device } from '../models/device.js';


export const deviceRouter = express.Router();

deviceRouter.post('/devices', async (req, res) => {
    try {
        const device = new Device(req.body);
        device.userId = req.query.userId;
        await device.save();
        res.status(201).send();
    } catch (e) {
        res.status(400).send();
    }
});

deviceRouter.patch('/bulb', auth, async (req, res) => {
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
        res.set('Content-Type', 'text/plain');// set the headers 
        res.send({ bulbStatus: device.bulb });// if led is on or true, send bulbStatus=true
    } catch (e) {
        res.status(500).send();
    }
});

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
        res.send(req.body.value);
    } catch (e) {
        res.status(501).send();
    }
});

deviceRouter.put('/receivePutData', async (req, res) => {
    try {
        data = req.query.data;
        res.send(req.query.data);
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
