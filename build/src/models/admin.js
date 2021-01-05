var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
const adminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Please enter valid Email Id');
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error("Password should not contain 'password'");
            }
        }
    },
    tokens: [{
            token: {
                type: String,
                required: true
            }
        }
    ]
});
adminSchema.statics.findByCredentials = function ({ email, password }) {
    return __awaiter(this, void 0, void 0, function* () {
        const admin = yield Admin.findOne({ email });
        if (!admin) {
            throw new Error('Invalid Credentials');
        }
        const isMatch = yield bcrypt.compare(password, admin.password);
        if (!isMatch) {
            throw new Error('Invalid Credentials');
        }
        return admin;
    });
};
adminSchema.methods.getAuthToken = function () {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const admin = this;
        let token = jwt.sign({ id: admin._id.toString() }, process.env.SECRET_KEY);
        admin.tokens = (_a = admin.tokens) === null || _a === void 0 ? void 0 : _a.concat({ token });
        yield admin.save();
        return token;
    });
};
adminSchema.methods.toJSON = function () {
    const admin = this;
    const adminObject = admin.toObject();
    delete adminObject.password;
    delete adminObject.tokens;
    return adminObject;
};
adminSchema.pre('save', function () {
    return __awaiter(this, void 0, void 0, function* () {
        let admin = this;
        if (admin.isModified('password')) {
            admin.password = yield bcrypt.hash(admin.password, 8);
        }
    });
});
export const Admin = mongoose.model('Admin', adminSchema);
