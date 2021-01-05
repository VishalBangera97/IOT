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
        validate(value: string) {
            if (!validator.isEmail(value)) {
                throw new Error("Please enter valid email id");
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        validate(value: string) {
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

type IUser = {
    name: string;
    email: string;
    password?: string;
    tokens?: {
        token: string
    }[];
    status: string
}

export interface UserDocument extends IUser, mongoose.Document {
    generateAuthToken(): Promise<string>;

}

export interface UserModel extends mongoose.Model<UserDocument> {
    findUserByCredentials({ email, password }: { email: string, password: string }): Promise<UserDocument>;
}

userSchema.virtual('devices', {
    ref: 'Device',
    localField: '_id',
    foreignField: 'userId'
});

userSchema.methods.generateAuthToken = async function (this: UserDocument) {
    const user = this;
    const token = jwt.sign({ _id: user._id.toString() }, process.env.SECRET_KEY!);
    user.tokens = user.tokens?.concat({ token });
    await user.save();
    return token;
}

userSchema.statics.findUserByCredentials = async function ({ email, password }: { email: string, password: string }) {
    const user = await User.findOne({ email, status: 'active' });
    if (!user) {
        throw new Error("Invalid Credentials");
    }
    const isMatch = await bcrypt.compare(password, user.password!);
    if (!isMatch) {
        throw new Error("Invalid Credentials");
    }
    return user;

}

userSchema.methods.toJSON = function (this: UserDocument) {
    let userObject = this.toObject();
    delete userObject.password
    delete userObject.tokens;
    return userObject;
}

userSchema.pre<UserDocument>('save', async function () {
    let user = this;
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password!, 8);
    }
});

export const User = mongoose.model<UserDocument, UserModel>('User', userSchema);