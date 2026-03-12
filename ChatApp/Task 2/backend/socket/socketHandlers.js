import Message from '../models/messageModel.js';
import User from '../models/userModel.js';

const socketHandlers = (io) => {
    const users = new Map(); // userId -> socketId

    io.on('connection', (socket) => {
        const userId = socket.user._id.toString();
        users.set(userId, socket.id);
        console.log(`User connected: ${socket.user.name} (${socket.id})`);

        // Update user status to online
        User.findByIdAndUpdate(userId, { status: 'online' }).exec();
        io.emit('userStatus', { userId, status: 'online' });

        // Send full list of online users to the new connection
        socket.emit('getOnlineUsers', Array.from(users.keys()));

        // Join personal room for private messaging
        socket.join(userId);

        // Send Message
        socket.on('sendMessage', async (data) => {
            const { recipientId, content, messageType, fileUrl, roomId } = data;

            try {
                const message = await Message.create({
                    sender: userId,
                    recipient: recipientId,
                    room: roomId,
                    content,
                    messageType: messageType || 'text',
                    fileUrl,
                });

                const populatedMessage = await Message.findById(message._id)
                    .populate('sender', 'name avatar');

                if (roomId) {
                    io.to(roomId).emit('newMessage', populatedMessage);
                } else {
                    // Send to both recipient and sender's separate devices
                    io.to(recipientId).to(userId).emit('newMessage', populatedMessage);
                }
            } catch (error) {
                console.error('Socket error (sendMessage):', error);
            }
        });

        // Typing Indicator
        socket.on('typing', (data) => {
            const { recipientId, roomId, isTyping } = data;
            if (roomId) {
                socket.to(roomId).emit('displayTyping', { userId, isTyping, roomId });
            } else {
                socket.to(recipientId).emit('displayTyping', { userId, isTyping });
            }
        });

        // Join Room
        socket.on('joinRoom', (roomId) => {
            socket.join(roomId);
            console.log(`User ${userId} joined room ${roomId}`);
        });

        // Disconnect
        socket.on('disconnect', () => {
            users.delete(userId);
            console.log(`User disconnected: ${socket.id}`);

            User.findByIdAndUpdate(userId, { status: 'offline', lastSeen: Date.now() }).exec();
            io.emit('userStatus', { userId, status: 'offline' });
        });
    });
};

export default socketHandlers;
