import { useState, useRef } from 'react';
import { Send, Smile, Paperclip } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import EmojiPicker from 'emoji-picker-react';
import { motion, AnimatePresence } from 'framer-motion';

const MessageInput = ({ onSend, recipientId }) => {
    const [text, setText] = useState('');
    const [showEmoji, setShowEmoji] = useState(false);
    const { socket } = useSocket();
    const typingTimeoutRef = useRef(null);

    const handleTextChange = (e) => {
        setText(e.target.value);

        // Typing Indicator Logic
        if (socket) {
            socket.emit('typing', { recipientId, isTyping: true });

            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

            typingTimeoutRef.current = setTimeout(() => {
                socket.emit('typing', { recipientId, isTyping: false });
            }, 2000);
        }
    };

    const handleEmojiClick = (emojiData) => {
        setText(prev => prev + emojiData.emoji);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!text.trim()) return;
        onSend(text);
        setText('');
        setShowEmoji(false);
        if (socket) socket.emit('typing', { recipientId, isTyping: false });
    };

    return (
        <div className="p-4 bg-white/5 border-t border-white/10 relative">
            <AnimatePresence>
                {showEmoji && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute bottom-20 left-4 z-50 shadow-2xl"
                    >
                        <EmojiPicker
                            theme="dark"
                            onEmojiClick={handleEmojiClick}
                            width={300}
                            height={400}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setShowEmoji(!showEmoji)}
                        className="p-2 hover:bg-white/10 rounded-full text-white/50 transition-colors"
                    >
                        <Smile size={20} />
                    </button>
                    <button
                        type="button"
                        className="p-2 hover:bg-white/10 rounded-full text-white/50 transition-colors"
                    >
                        <Paperclip size={20} />
                    </button>
                </div>

                <input
                    type="text"
                    placeholder="Type a message..."
                    className="glass-input flex-1 py-2"
                    value={text}
                    onChange={handleTextChange}
                />

                <button
                    type="submit"
                    className="p-3 bg-primary-600 hover:bg-primary-500 rounded-xl text-white shadow-lg shadow-primary-600/20 active:scale-95 transition-all"
                >
                    <Send size={18} />
                </button>
            </form>
        </div>
    );
};

export default MessageInput;
