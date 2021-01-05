var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import express from 'express';
import { EventEmitter } from 'events';
import { Admin } from '../models/admin.js';
import { User } from '../models/user.js';
import { adminAuth } from '../middlewares/adminAuth.js';
import { sendMail } from '../mails/mail.js';
export const adminRouter = express.Router();
const event = new EventEmitter();
//POST/admin
//method to add a new admin
adminRouter.post('/admin', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let admin = new Admin(req.body);
        yield admin.save();
        let token = yield admin.getAuthToken();
        event.emit('addAdmin', admin);
        res.status(201).send({ admin, token });
    }
    catch (e) {
        res.status(400).send(e);
    }
}));
//POST/admin/login
//method to login admin
adminRouter.post('/admin/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let admin = yield Admin.findByCredentials(req.body);
        let token = yield admin.getAuthToken();
        res.send({ admin, token });
    }
    catch (e) {
        res.status(401).send('Invalid Credentials');
    }
}));
//PATCH/admin/logout
//method to logout admin
adminRouter.patch('/admin/logout', adminAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        req.admin.tokens = (_a = req.admin.tokens) === null || _a === void 0 ? void 0 : _a.filter((token) => {
            return token != req.token;
        });
        yield req.admin.save();
        res.send();
    }
    catch (e) {
        res.status(401).send('Failed to Logout');
    }
}));
//GET/admin/users?status:true or false
//GET/admin/users?limit=10&skip=0
//GET/admin/users?sortyBy=createdAt:asc
//method to get users
adminRouter.get('/admin/users', adminAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield User.find({ status: req.query.status }).skip(parseInt(req.query.skip)).limit(parseInt(req.query.limit)).sort({ createdAt: req.query.sortBy });
        res.send(users);
    }
    catch (e) {
        res.status(500).send(e);
    }
}));
//PATCH/admins/users?userId=''&status=deactive or active or rejectF 
//method which allows admin to deactive/activate a user account either temporary or permanent
adminRouter.patch('/admin/users', adminAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let user = yield User.findById(req.query.userId);
        if (!user) {
            throw new Error('No user found');
        }
        user.status = req.query.status;
        yield user.save();
        res.send(user);
    }
    catch (e) {
        res.status(500).send(e);
    }
}));
event.on('addAdmin', (admin) => {
    sendMail(admin.email, 'Welcome to Team IOTNO', 'Thank you for choosing team IOTNO. We hope you will' +
        'work seamlessly with us to make team IOTNO more prosperous', []);
});
