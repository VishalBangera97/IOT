import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
    bulb:{
        type:Boolean
    },
    motor:{
        type:Boolean
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'User'
    }
});

export const Device= mongoose.model('Device',taskSchema);