import express from 'express';
import { userAuth } from '../middlewares/userAuth.js'
import { Device } from '../models/device.js';
import { adminAuth } from '../middlewares/adminAuth.js';
import { plotGraph } from '../graphs/graph.js';
import { sendMail } from '../mails/mail.js';


export const deviceRouter = express.Router();

//adding new device to a new user
deviceRouter.post('/devices', adminAuth, async (req, res) => {
    try {
        const device = new Device(req.body);
        await device.save();
        res.status(201).send(device);
    } catch (e) {
        res.status(400).send(e);
    }
});

// on and off the device from user
deviceRouter.patch('/bulb', userAuth, async (req, res) => {
    try {
        const device = await Device.findOne({ userId: req.user._id });
        device.bulb.status = req.query.status;
        await device.save();
        res.set('Content-Type', 'text/plain');
        res.send({ value: device.bulb.status });

    } catch (e) {
        res.status(500).send();
    }
});

//get device status for node mcu
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
        res.redirect(String("GET ") + url + " HTTP/1.1\r\n" + "Host: " + host + "\r\n" + "Connection: close\r\n\r\n");
    } catch (e) {
        res.status(501).send(e);
    }
});

deviceRouter.post('/receiveBulbData', async (req, res) => {
    try {
        const device = await Device.findOne({ userId: req.query.userId });
        let x = device.bulb.x;
        let graph = device.bulb.graph;
        let data = req.body.value;
        //incrementing x value whenever new value is pushed into array and data is converted from string to number
        graph.push({
            x: x++,
            y: Number(data)
        });
        if (graph.length == 10) {
            //removes the first element of the array
            graph.shift();

            //here the value for x for all elements is decreased by 1 for plotting graph as 0 ... 9  every time irrespective of elements removed from array
            graph = graph.map((value) => {
                return { x: value.x - 1, y: value.y };
            });
            x--; // x will be 10 whenever the array size become 10. This value will be given to the next added element and that wll be decreased inside the previous loop to 9 again
        }
        device.graph = graph;
        device.bulb.x = x;
        await device.save();
        res.send('Server received the value : ' + data);
    } catch (e) {
        res.status(500).send(e);
    }
});


deviceRouter.get('/plotGraph', userAuth, async (req, res) => {
    try {
        let device = await Device.findOne({ userId: req.user._id });
        let result = await plotGraph('Bulb Graph', 'line', device.bulb.graph);
        res.set('Content-Type', 'image/png');
        let attachments = [{
            filename: 'graph.png',
            content: result,
            contentType: 'image/png'
        }]
        sendMail(req.user.email, 'Report of Data', 'This report has data of last 10 values', attachments);
        res.send(result);
    } catch (e) {
        res.status(500).send(e);
    }
});
