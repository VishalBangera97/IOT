import express from 'express';
import { userAuth } from '../middlewares/userAuth.js'
import { Device } from '../models/device.js';
import { adminAuth } from '../middlewares/adminAuth.js';
import { plotGraph } from '../graphs/graph.js';
import { sendMail } from '../mails/mail.js';
import { User } from '../models/user.js';


export const deviceRouter = express.Router();

//POST/devices
//approving registered user and adding device
deviceRouter.post('/devices', adminAuth, async (req, res) => {
    try {
        let user = await User.findById(req.body.userId);
        user.status = 'active'; //approving user
        if (!user) {
            throw new Error('Invalid User Id');
        }
        await user.save();
        let device = new Device(req.body); //adding new devices for the given user
        await device.save();
        res.status(201).send(device);
    } catch (e) {
        res.status(400).send(e);
    }
});

//PATCH/bulb?status=on
// on and off the bulb from user
deviceRouter.patch('/devices/bulb', userAuth, async (req, res) => {
    try {
        const device = await Device.findOne({ userId: req.user._id });
        device.bulb.status = req.query.status;
        await device.save();
        res.set('Content-Type', 'text/plain');
        res.send({ value: device.bulb.status });

    } catch (e) {
        res.status(500).send(e);
    }
});

//PATCH/devices/motor?status=on
//on and off the motor from user
deviceRouter.patch('/devices/motor', userAuth, async (req, res) => {
    try {
        let device = await Device.findOne({ userId: req.user._id });
        if (!device) {
            throw new Error('No Device Found');
        }
        device.motor.status = req.query.status;
        await device.save();
        res.send({ value: device.motor.status });
    } catch (e) {
        res.status(500).send();
    }
});

//GET/bulb?userId=as55
//get device status for node mcu
deviceRouter.get('/devices/bulb', async (req, res) => {
    try {
        const device = await Device.findOne({ userId: req.query.userId });
        res.set('Content-Type', 'text/plain');
        res.send({ bulbStatus: device.bulb.status });
    } catch (e) {
        res.status(500).send();
    }
});


// experimentals


deviceRouter.get('/devices/nodemcu', async (req, res) => {
    try {
        let host = req.query.host;
        let url = "/data";
        res.redirect(String("GET ") + url + " HTTP/1.1\r\n" + "Host: " + host + "\r\n" + "Connection: close\r\n\r\n");
    } catch (e) {
        res.status(501).send(e);
    }
});


//POST/devices/receiveBulbData?userId=''
//method to receive bulb data from nodemcu
deviceRouter.post('/devices/receiveBulbData', async (req, res) => {
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

//GET/devices/bulb/plotGraph
//method to plot graph of bulb data
deviceRouter.get('/devices/bulb/plotGraph', userAuth, async (req, res) => {
    try {
        let device = await Device.findOne({ userId: req.user._id });
        let result = await plotGraph('Bulb Graph', 'line', device.bulb.graph);
        if (!result) {
            throw new Error('No graph to plot');
        }
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
