import express from 'express';
import { EventEmitter } from 'events';
import { Admin } from '../models/admin.js';
import { User } from '../models/user.js';
import { adminAuth } from '../middlewares/adminAuth.js';
import { sendMail } from '../mails/mail.js';

export const adminRouter = express.Router();
const event = new EventEmitter();

adminRouter.post('/admin', async (req, res) => {
    try {
        let admin = new Admin(req.body);
        await admin.save();
        let token = await admin.getAuthToken();
        event.emit('addAdmin', admin);
        res.status(201).send({ admin, token });
    } catch (e) {
        res.status(400).send(e);
    }
});


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

//GET/admin/users?status:true or false
//GET/admin/users?limit=10&skip=0
//GET/admin/users?sortyBy=createdAt:asc
adminRouter.get('/admin/users', adminAuth, async (req, res) => {
    try {
        const users = await User.find({ status:req.query.status }).skip(parseInt(req.query.skip)).limit(parseInt(req.query.limit)).sort({ createdAt: req.query.sortBy });
        res.send(users);
    } catch (e) {
        res.status(500).send(e);
    }
});

adminRouter.delete('admin/users', adminAuth, async (req, res) => {
    try {
        let user = await User.findById(req.query.userId);
        if (!user) {
            throw new Error('No user found');
        }
        user.status = false;
        await user.save();
        res.send(user);
    } catch (e) {
        res.status(500).send(e);
    }
})

event.on('addAdmin', (admin) => {
    sendMail(admin.email, 'Welcome to Team IOTNO', 'Thank you for choosing team IOTNO. We hope you will' +
        'work seamlessly with us to make team IOTNO more prosperous');
});