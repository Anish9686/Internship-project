import Message from '../models/messageModel.js';
import Room from '../models/roomModel.js';
import logger from '../config/logger.js';

class MessageService {
    async sendMessage(senderId, messageData) {
        const { content, recipient, roomId, messageType, fileUrl, recipientId } = messageData;

        const message = await Message.create({
            sender: senderId,
            recipient: recipient || recipientId,
            room: roomId,
            content,
            messageType: messageType || 'text',
            fileUrl,
        });

        if (roomId) {
            await Room.findByIdAndUpdate(roomId, { lastMessage: message._id });
        }

        logger.info(`Message sent from ${senderId} to ${recipient || roomId}`);
        return await message.populate('sender', 'name avatar');
    }

    async getMessages(userId, targetId) {
        // targetId can be a userId or a roomId
        return await Message.find({
            $or: [
                { sender: userId, recipient: targetId },
                { sender: targetId, recipient: userId },
                { room: targetId },
            ],
        })
            .sort({ createdAt: 1 })
            .populate('sender', 'name avatar');
    }

    async markAsRead(userId, targetId) {
        return await Message.updateMany(
            {
                $or: [
                    { sender: targetId, recipient: userId },
                    { room: targetId }
                ],
                readBy: { $ne: userId }
            },
            {
                $push: { readBy: userId }
            }
        );
    }
}

export default new MessageService();
