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
import jwt from 'jsonwebtoken';
import validator from 'validator';
import { config } from 'dotenv';
import bcrypt from 'bcryptjs';
config();
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("Please enter valid email id");
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
        }],
    status: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});
userSchema.virtual('devices', {
    ref: 'Device',
    localField: '_id',
    foreignField: 'userId'
});
userSchema.methods.generateAuthToken = function () {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const user = this;
        const token = jwt.sign({ _id: user._id.toString() }, process.env.SECRET_KEY);
        user.tokens = (_a = user.tokens) === null || _a === void 0 ? void 0 : _a.concat({ token });
        yield user.save();
        return token;
    });
};
userSchema.statics.findUserByCredentials = function ({ email, password }) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield User.findOne({ email, status: 'active' });
        if (!user) {
            throw new Error("Invalid Credentials");
        }
        const isMatch = yield bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error("Invalid Credentials");
        }
        return user;
    });
};
userSchema.methods.toJSON = function () {
    let userObject = this.toObject();
    delete userObject.password;
    delete userObject.tokens;
    return userObject;
};
userSchema.pre('save', function () {
    return __awaiter(this, void 0, void 0, function* () {
        let user = this;
        if (user.isModified('password')) {
            user.password = yield bcrypt.hash(user.password, 8);
        }
    });
});
export const User = mongoose.model('User', userSchema);
