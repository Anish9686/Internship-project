const Document = require('../models/Document');

const socketManager = (io) => {
    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        socket.on('get-document', async ({ documentId, user }) => {
            try {
                if (!documentId) return;

                const document = await findOrCreateDocument(documentId);
                if (!document) {
                    // Should verify document creation
                    return;
                }

                socket.join(documentId);
                socket.emit('load-document', { data: document.data, title: document.title });

                // Track active users
                socket.user = user;
                updateActiveUsers(documentId);

                socket.on('send-changes', (delta) => {
                    socket.broadcast.to(documentId).emit('receive-changes', delta);
                });

                socket.on('update-title', async (newTitle) => {
                    try {
                        await Document.findByIdAndUpdate(documentId, { title: newTitle });
                        socket.broadcast.to(documentId).emit('receive-title-update', newTitle);
                    } catch (err) {
                        console.error("Error updating title:", err);
                    }
                });

                socket.on('save-document', async (data) => {
                    try {
                        await Document.findByIdAndUpdate(documentId, { data });
                    } catch (err) {
                        console.error("Error saving document:", err);
                    }
                });

                socket.on('send-cursor-move', (range) => {
                    socket.broadcast.to(documentId).emit('receive-cursor-move', {
                        range,
                        id: user.id,
                        name: user.name
                    });
                });

                socket.on('disconnecting', () => {
                    const rooms = Array.from(socket.rooms);
                    rooms.forEach((room) => {
                        if (room !== socket.id) {
                            updateActiveUsers(room, socket.id);
                        }
                    });
                });
            } catch (error) {
                console.error("Error in get-document handler:", error);
                // Optionally emit an error to the client
            }
        });
    });

    function updateActiveUsers(documentId, excludingSocketId = null) {
        try {
            const clients = io.sockets.adapter.rooms.get(documentId);
            if (!clients) return;

            const users = Array.from(clients)
                .filter(id => id !== excludingSocketId)
                .map(id => io.sockets.sockets.get(id)?.user)
                .filter(u => u != null);

            io.to(documentId).emit('user-presence', users);
        } catch (error) {
            console.error("Error updating active users:", error);
        }
    }
};

async function findOrCreateDocument(id) {
    if (id == null) return;

    try {
        const document = await Document.findById(id);
        if (document) return document;

        // Create new document ensuring a valid Quill delta structure
        return await Document.create({
            _id: id,
            data: { ops: [{ insert: '\n' }] }
        });
    } catch (error) {
        console.error(`Error finding/creating document ${id}:`, error);
        return null;
    }
}

module.exports = socketManager;
