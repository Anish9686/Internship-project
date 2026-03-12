import mongoose from 'mongoose';

const messageSchema = mongoose.Schema(
    {
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        room: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Room',
        },
        content: {
            type: String,
            required: true,
        },
        messageType: {
            type: String,
            enum: ['text', 'image', 'file'],
            default: 'text',
        },
        fileUrl: {
            type: String,
        },
        readBy: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
    },
    {
        timestamps: true,
    }
);

const Message = mongoose.model('Message', messageSchema);

export default Message;
