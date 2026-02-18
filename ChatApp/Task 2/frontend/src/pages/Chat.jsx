import { useState, useEffect } from 'react';
import Sidebar from '../components/Chat/Sidebar';
import ChatWindow from '../components/Chat/ChatWindow';
import { useSocket } from '../context/SocketContext';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Sparkles, Shield, User } from 'lucide-react';

const Chat = () => {
    const [selectedUser, setSelectedUser] = useState(null);
    const { socket } = useSocket();

    return (
        <div className="h-screen w-full flex bg-[#09090b] text-white overflow-hidden">
            {/* Main Application Container */}
            <div className="flex w-full h-full relative z-10">
                {/* Left Sidebar - Solid and Professional */}
                <Sidebar onUserSelect={setSelectedUser} selectedUser={selectedUser} />

                {/* Main Content Area */}
                <main className="flex-1 flex flex-col bg-[#09090b] relative">
                    <AnimatePresence mode="wait">
                        {selectedUser ? (
                            <motion.div
                                key={selectedUser._id}
                                initial={{ opacity: 1 }}
                                className="h-full flex flex-col"
                            >
                                <ChatWindow user={selectedUser} />
                            </motion.div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-[#111111]">
                                <div className="w-24 h-24 bg-indigo-600/10 border border-indigo-500/20 rounded-3xl flex items-center justify-center mb-8">
                                    <MessageSquare className="text-indigo-500" size={48} />
                                </div>

                                <div className="max-w-md space-y-4">
                                    <h2 className="text-3xl font-bold text-white tracking-tight">
                                        Select a conversation
                                    </h2>
                                    <p className="text-zinc-400 leading-relaxed">
                                        Choose a person from the sidebar to start a real-time secure chat.
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mt-12 max-w-sm w-full font-medium">
                                    <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col items-center">
                                        <Shield className="text-indigo-500 mb-2" size={20} />
                                        <span className="text-[11px] text-zinc-500 uppercase tracking-widest">Encrypted</span>
                                    </div>
                                    <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col items-center">
                                        <User className="text-indigo-500 mb-2" size={20} />
                                        <span className="text-[11px] text-zinc-500 uppercase tracking-widest">Verified</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
};

export default Chat;
