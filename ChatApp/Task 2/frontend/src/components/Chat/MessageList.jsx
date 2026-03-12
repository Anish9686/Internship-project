import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileIcon, Image, Download } from 'lucide-react';
import Avatar from './Avatar';

const MessageList = ({ messages, currentUser }) => {
    const scrollRef = useRef();

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);

        if (date.toDateString() === today.toDateString()) return 'Today';
        if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
        return date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
    };

    return (
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#09090b]">
            {messages.map((msg, index) => {
                const isMe = msg.sender._id === currentUser._id;
                const prevMsg = messages[index - 1];
                const isFirstInGroup = !prevMsg || prevMsg.sender._id !== msg.sender._id;

                // Date separator logic
                const showDateSeparator = !prevMsg ||
                    new Date(prevMsg.createdAt).toDateString() !== new Date(msg.createdAt).toDateString();

                return (
                    <div key={msg._id || index}>
                        {showDateSeparator && (
                            <div className="flex justify-center my-8">
                                <span className="px-4 py-1.5 rounded-full bg-zinc-900/50 text-[11px] font-black text-zinc-500 uppercase tracking-[0.2em] border border-zinc-800/50 backdrop-blur-sm">
                                    {formatDate(msg.createdAt)}
                                </span>
                            </div>
                        )}

                        <motion.div
                            initial={{ opacity: 0, x: isMe ? -20 : 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`flex ${isMe ? 'justify-start' : 'justify-end'} group`}
                        >
                            <div className={`flex max-w-[80%] ${isMe ? 'flex-row' : 'flex-row-reverse'} items-end gap-2`}>
                                {/* Avatar display */}
                                {isFirstInGroup ? (
                                    <div className="mb-5">
                                        <Avatar src={msg.sender.avatar} alt={msg.sender.name} size="sm" />
                                    </div>
                                ) : (
                                    <div className="w-8" />
                                )}

                                <div className={`flex flex-col ${isMe ? 'items-start' : 'items-end'}`}>
                                    {isFirstInGroup && (
                                        <span className="text-[10px] font-black text-zinc-500 mb-1 px-1 uppercase tracking-widest">
                                            {isMe ? 'You' : msg.sender.name}
                                        </span>
                                    )}

                                    <div
                                        className={`relative px-4 py-3 rounded-2xl text-[13px] leading-relaxed shadow-xl transition-all hover:scale-[1.01] ${isMe
                                            ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-bl-none border border-indigo-500/30'
                                            : 'bg-[#18181b] text-zinc-100 border border-zinc-800/80 rounded-br-none shadow-black/20'
                                            } ${msg.isOptimistic ? 'opacity-70 italic' : ''}`}
                                    >
                                        {/* CSS Bubble Tail */}
                                        <div className={`absolute bottom-0 w-3 h-3 ${isMe
                                            ? '-left-1 bg-indigo-700 [clip-path:polygon(100%_0,0_100%,100%_100%)]'
                                            : '-right-1 bg-[#18181b] [clip-path:polygon(0_0,0_100%,100%_100%)]'
                                            }`} />

                                        {msg.messageType === 'image' && (
                                            <div className="mb-2 rounded-xl overflow-hidden border border-white/5 shadow-inner">
                                                <img src={msg.fileUrl} alt="uploaded" className="max-w-full h-auto block" />
                                            </div>
                                        )}
                                        {msg.messageType === 'file' && (
                                            <a
                                                href={msg.fileUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-3 mb-2 p-3 bg-black/40 rounded-xl border border-white/5 hover:bg-black/60 transition-all group/file"
                                            >
                                                <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center text-indigo-400 group-hover/file:scale-110 transition-transform">
                                                    <FileIcon size={20} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[11px] font-bold truncate pr-4 text-zinc-200">
                                                        {msg.content.replace('Sent file: ', '')}
                                                    </p>
                                                    <div className="flex items-center gap-1 mt-1 text-[9px] font-black text-indigo-400 uppercase tracking-widest opacity-70">
                                                        <span>Download</span>
                                                        <Download size={8} />
                                                    </div>
                                                </div>
                                            </a>
                                        )}

                                        <div className="relative z-10">
                                            {msg.messageType === 'text' ? msg.content : (msg.messageType !== 'text' && msg.content.includes('Sent ') ? null : msg.content)}
                                        </div>
                                    </div>

                                    <div className={`flex items-center gap-1.5 mt-1.5 px-1 opacity-0 group-hover:opacity-100 transition-opacity ${isMe ? 'flex-row' : 'flex-row-reverse'}`}>
                                        <span className="text-[9px] font-medium text-zinc-600">
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        {isMe && <div className="w-1 h-1 rounded-full bg-indigo-500/50" />}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                );
            })}
        </div>
    );
};

export default MessageList;
