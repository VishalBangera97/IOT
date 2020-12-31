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


adminSchema.statics.findByCredentials = async function ({ email, password }) {
    const admin = await Admin.findOne({ email });
    if (!admin) {
        throw new Error('Invalid Credentials');
    }
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
        throw new Error('Invalid Credentials');
    }
    return admin;

}

adminSchema.methods.getAuthToken = async function () {
    let admin = this;
    let token = jwt.sign({ id: admin._id.toString() }, process.env.SECRET_KEY);
    admin.tokens = admin.tokens.concat({ token });
    await admin.save();
    return token;
}

adminSchema.methods.toJSON = async function () {
    let admin = this;
    const adminObject = admin.toObject();
    delete adminObject.password;
    delete adminObject.tokens;
    return adminObject;
}

adminSchema.pre('save', async function () {
    let admin = this;
    if (admin.isModified('password')) {
        admin.password = await bcrypt.hash(admin.password, 8);
    }
});


export const Admin = mongoose.model('Admin', adminSchema);
