import mongoose, { Types } from 'mongoose';

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

type IDevice = {
    bulb: {
        status: string,
        graph: {
            x: number,
            y: number
        }[],
        x: number,
    }
    motor: {
        status: string,
        graph: {
            x: number,
            y: number
        }[],
        x: number,
    }
    userId: Types.ObjectId;
    status: boolean
}

export interface DeviceDocument extends IDevice, mongoose.Document { }

export const Device = mongoose.model<DeviceDocument>('Device', taskSchema);