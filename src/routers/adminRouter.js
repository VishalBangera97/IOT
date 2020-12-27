import express from 'express';
import { Admin } from '../models/admin.js';
import { adminAuth } from '../middlewares/adminAuth.js';

export const adminRouter = express.Router();


adminRouter.post('/admin', async (req, res) => {
    try {
        let admin = new Admin(req.body);
        await admin.save();
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