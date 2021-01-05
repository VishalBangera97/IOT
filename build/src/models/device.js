import mongoose from 'mongoose';
const taskSchema = new mongoose.Schema({
    bulb: {
        status: {
            type: Boolean,
            required: true
        },
        graph: {
            type: Array
        },
        x: {
            type: Number,
            default: 0
        }
    },
    motor: {
        status: {
            type: Boolean,
            required: true
        },
        graph: {
            type: Array
        },
        x: {
            type: Number,
            default: 0
        }
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
        unique: true
    },
    status: {
        type: Boolean,
        required: true
    },
});
export const Device = mongoose.model('Device', taskSchema);
