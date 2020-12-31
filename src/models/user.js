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
        type: Boolean,
        required: true
    }
}, {
    timestamps: true
});

userSchema.virtual('devices', {
    ref: 'Device',
    localField: '_id',
    foreignField: 'userId'
})

userSchema.methods.generateAuthToken = async function () {
    const user = this;
    const token = jwt.sign({ _id: user._id.toString() }, process.env.SECRET_KEY);
    user.tokens = user.tokens.concat({ token });
    await user.save();
    return token;
}

userSchema.statics.findUserByCredentials = async function ({ email, password }) {
    const user = await User.findOne({ email, status: true });
    if (!user) {
        throw new Error("Invalid Credentials");
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error("Invalid Credentials");
    }
    return user;

}

userSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.toObject();
    delete userObject.password;
    delete userObject.tokens;
    delete userObject.status;
    return userObject;
}

userSchema.pre('save', async function () {
    let user = this;
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }
});

export const User = mongoose.model('User', userSchema);