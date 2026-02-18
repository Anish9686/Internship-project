import mongoose from 'mongoose';

const roomSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add a room name'],
            trim: true,
        },
        description: {
            type: String,
        },
        isGroup: {
            type: Boolean,
            default: false,
        },
        users: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        admin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        lastMessage: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Message',
        },
    },
    {
        timestamps: true,
    }
);

const Room = mongoose.model('Room', roomSchema);

export default Room;
