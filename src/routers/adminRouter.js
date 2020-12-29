import express from 'express';
import { EventEmitter } from 'events';
import { Admin } from '../models/admin.js';
import { adminAuth } from '../middlewares/adminAuth.js';

export const adminRouter = express.Router();
const event = new EventEmitter();

adminRouter.post('/admin', async (req, res) => {
    try {
        let admin = new Admin(req.body);
        await admin.save();
        event.emit('addAdmin', admin);
        let token = await admin.getAuthToken();
        res.status(201).send({ admin, token });
    } catch (e) {
        res.status(400).send(e);
    }
})


adminRouter.post('/admin/login', async (req, res) => {
    try {
        let admin = await Admin.findByCredentials(req.body);
        let token = await admin.getAuthToken();
        res.send({ admin, token });
    } catch (e) {
        res.status(401).send('Invalid Credentials');
    }
});

adminRouter.patch('/admin/logout', adminAuth, async (req, res) => {
    try {
        req.admin.tokens = req.admin.tokens.filter((token) => {
            return token != req.token;
        });
        await req.admin.save();
        res.send();
    } catch (e) {
        res.status(401).send('Failed to Logout');
    }
});

event.on('addAdmin', (admin) => {
    sendMail(user.email, 'Welcome to Team IOTNO', 'Thank you for choosing team IOTNO. We hope you will' +
        'work seamlessly with us to make team IOTNO more prosperous');
})