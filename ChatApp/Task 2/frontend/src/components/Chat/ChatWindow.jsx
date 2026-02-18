import { useState, useEffect, useRef } from 'react';
import api from '../../utils/api';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import {
    Send,
    MoreVertical,
    Phone,
    Video,
    Smile,
    Paperclip,
    ImageIcon,
    Shield,
    CheckCheck,
    Loader2,
    User,
    Ban,
    Trash2,
    BellOff,
    Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import EmojiPicker from 'emoji-picker-react';
import Avatar from './Avatar';
import MessageList from './MessageList';

const ChatWindow = ({ user }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [showEmoji, setShowEmoji] = useState(false);
    const { socket, typingUsers } = useSocket();
    const { user: currentUser } = useAuth();
    const [sending, setSending] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const typingTimeoutRef = useRef(null);
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef(null);

    // Close menu on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        fetchMessages();
        const handleMessage = (message) => {
            if (!message || !message.sender || !message.recipient) return;

            const senderId = message.sender._id?.toString() || message.sender.toString();
            const recipientId = message.recipient._id?.toString() || message.recipient.toString();
            const currentChatId = user._id.toString();
            const myId = currentUser._id.toString();

            const isRelated =
                (senderId === currentChatId && recipientId === myId) ||
                (senderId === myId && recipientId === currentChatId);

            if (isRelated) {
                setMessages((prev) => [...prev, message]);
            }
        };

        socket?.on('newMessage', handleMessage);
        return () => socket?.off('newMessage', handleMessage);
    }, [user._id, socket]);

    const fetchMessages = async () => {
        try {
            const response = await api.get(`/messages/${user._id}`);
            if (response.success) setMessages(response.data);
        } catch (error) {
            console.error('[ChatWindow] fetchMessages error:', error);
        }
    };

    const handleSendMessage = async (e) => {
        if (e) e.preventDefault();
        if (!newMessage.trim() || sending) return;

        setSending(true);
        const messageData = {
            recipientId: user._id,
            content: newMessage,
        };

        try {
            const response = await api.post('/messages', messageData);
            if (response.success) {
                socket.emit('sendMessage', response.data);
                setMessages((prev) => [...prev, response.data]);
                setNewMessage('');
            }
        } catch (error) {
            console.error('[ChatWindow] send error:', error);
        } finally {
            setSending(false);
        }
    };

    const [callActive, setCallActive] = useState(false);
    const fileInputRef = useRef();

    const onEmojiClick = (emojiData) => {
        setNewMessage(prev => prev + emojiData.emoji);
        setShowEmoji(false);
    };

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            setSending(true);
            const response = await api.post('/messages/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.success) {
                const messageType = file.type.startsWith('image/') ? 'image' : 'file';
                const messageData = {
                    recipientId: user._id,
                    content: `Sent ${messageType}: ${file.name}`,
                    messageType,
                    fileUrl: response.data.fileUrl
                };

                const msgResponse = await api.post('/messages', messageData);
                if (msgResponse.success) {
                    socket.emit('sendMessage', msgResponse.data);
                    setMessages((prev) => [...prev, msgResponse.data]);
                }
            }
        } catch (error) {
            console.error('[ChatWindow] upload failed:', error);
            alert('File upload failed.');
        } finally {
            setSending(false);
        }
    };

    const toggleCall = () => {
        setCallActive(true);
        setTimeout(() => setCallActive(false), 5000);
    };

    const handleClearChat = () => {
        if (window.confirm('Clear conversation locally?')) {
            setMessages([]);
            setShowMenu(false);
        }
    };

    const handleBlockUser = () => {
        alert(`${user.name} blocked (Mock)`);
        setShowMenu(false);
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-[#09090b] relative overflow-hidden">
            <header className="h-16 flex items-center justify-between px-6 border-b border-[#27272a] bg-[#0c0c0e] shrink-0">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Avatar src={user.avatar} alt={user.name} />
                        <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${user.status === 'online' ? 'bg-emerald-500' : 'bg-zinc-500'} border-2 border-[#0c0c0e] rounded-full`}></div>
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-white">{user.name}</h3>
                            <Shield size={12} className="text-indigo-500" />
                        </div>
                        {typingUsers[user._id] ? (
                            <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider animate-pulse">Is Typing...</p>
                        ) : (
                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">{user.status || 'Offline'}</p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <button onClick={toggleCall} className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-white transition-all"><Phone size={18} /></button>
                    <button onClick={toggleCall} className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-white transition-all"><Video size={18} /></button>
                    <div className="w-px h-6 bg-zinc-800 mx-2"></div>

                    <div className="relative" ref={menuRef}>
                        <button onClick={() => setShowMenu(!showMenu)} className={`p-2 rounded-lg transition-all ${showMenu ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:bg-zinc-800 hover:text-white'}`}>
                            <MoreVertical size={18} />
                        </button>
                        <AnimatePresence>
                            {showMenu && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute right-0 mt-2 w-56 bg-[#18181b] border border-[#27272a] rounded-xl shadow-2xl z-[100] py-1.5 overflow-hidden"
                                >
                                    <div className="px-3 py-2 border-b border-[#27272a] mb-1">
                                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Chat Options</p>
                                    </div>
                                    <button className="w-full flex items-center gap-3 px-3 py-2 text-zinc-300 hover:bg-zinc-800 transition-colors text-sm font-medium"><div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400"><User size={16} /></div>View Profile</button>
                                    <button className="w-full flex items-center gap-3 px-3 py-2 text-zinc-300 hover:bg-zinc-800 transition-colors text-sm font-medium"><div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400"><Search size={16} /></div>Search Chat</button>
                                    <button className="w-full flex items-center gap-3 px-3 py-2 text-zinc-300 hover:bg-zinc-800 transition-colors text-sm font-medium"><div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400"><BellOff size={16} /></div>Mute Notifications</button>
                                    <div className="h-px bg-[#27272a] my-1"></div>
                                    <button onClick={handleClearChat} className="w-full flex items-center gap-3 px-3 py-2 text-zinc-300 hover:bg-zinc-800 transition-colors text-sm font-medium"><div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500"><Trash2 size={16} /></div>Clear Chat</button>
                                    <button onClick={handleBlockUser} className="w-full flex items-center gap-3 px-3 py-2 text-red-400 hover:bg-red-500/10 transition-colors text-sm font-bold"><div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500"><Ban size={16} /></div>Block {user.name}</button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </header>

            <MessageList messages={messages} currentUser={currentUser} />

            <div className="p-6 bg-[#0c0c0e] border-t border-[#27272a] shrink-0">
                <form onSubmit={handleSendMessage} className="bg-[#18181b] border border-[#27272a] rounded-2xl p-2 flex items-center gap-2 shadow-inner">
                    <div className="flex items-center gap-0.5 px-1">
                        <button type="button" onClick={() => setShowEmoji(!showEmoji)} className="p-2 hover:bg-zinc-800 rounded-xl text-zinc-500 hover:text-indigo-400 transition-all"><Smile size={20} /></button>
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 hover:bg-zinc-800 rounded-xl text-zinc-500 transition-all"><Paperclip size={20} /></button>
                        <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelect} />
                    </div>
                    <input
                        type="text"
                        placeholder="Type a message..."
                        className="flex-1 bg-transparent border-none text-white placeholder-zinc-500 focus:ring-0 text-sm py-2"
                        value={newMessage}
                        onChange={(e) => {
                            setNewMessage(e.target.value);
                            if (!isTyping) {
                                setIsTyping(true);
                                socket.emit('typing', { recipientId: user._id, isTyping: true });
                            }
                            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                            typingTimeoutRef.current = setTimeout(() => {
                                setIsTyping(false);
                                socket.emit('typing', { recipientId: user._id, isTyping: false });
                            }, 3000);
                        }}
                    />
                    <div className="flex items-center gap-1 pr-1">
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 hover:bg-zinc-800 rounded-xl text-zinc-500 transition-all hidden sm:block"><ImageIcon size={20} /></button>
                        <button type="submit" disabled={sending || !newMessage.trim()} className="w-10 h-10 bg-indigo-600 hover:bg-indigo-500 rounded-xl flex items-center justify-center text-white shadow-lg active:scale-95 transition-all disabled:opacity-50">
                            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send size={18} />}
                        </button>
                    </div>
                </form>
                <AnimatePresence>
                    {showEmoji && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute bottom-24 left-6 z-50 shadow-2xl rounded-2xl overflow-hidden border border-[#27272a]">
                            <EmojiPicker theme="dark" onEmojiClick={onEmojiClick} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <AnimatePresence>
                {callActive && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[100] bg-zinc-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center">
                        <div className="w-24 h-24 bg-indigo-600 rounded-full flex items-center justify-center mb-6 animate-pulse"><Phone className="text-white" size={40} /></div>
                        <h2 className="text-2xl font-bold text-white mb-2">Calling {user.name}...</h2>
                        <button onClick={() => setCallActive(false)} className="px-8 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition-all shadow-lg active:scale-95">End Session</button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ChatWindow;
