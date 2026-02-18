import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { Search, LogOut, MessageSquare, Plus, Bell, MoreHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Avatar from './Avatar';

const Sidebar = ({ onUserSelect, selectedUser }) => {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const { user, logout } = useAuth();
    const { onlineUsers } = useSocket();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/users');
            if (response.success) setUsers(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <aside className="w-[320px] flex flex-col h-full bg-[#09090b] border-r border-[#27272a] relative z-20">
            {/* User Profile Section */}
            <div className="p-6 border-b border-[#27272a] bg-[#0c0c0e]">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Avatar src={user.avatar} alt={user.name} />
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-[#09090b] rounded-full"></div>
                        </div>
                        <div className="flex flex-col">
                            <h2 className="text-sm font-bold text-white leading-none mb-1">{user.name}</h2>
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Available</span>
                        </div>
                    </div>
                    <button onClick={logout} className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-white transition-all">
                        <LogOut size={18} />
                    </button>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                    <input
                        type="text"
                        placeholder="Search chats..."
                        className="w-full bg-[#18181b] border border-[#27272a] rounded-xl py-2 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-indigo-500 transition-all"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                <div className="px-4 py-3">
                    <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.15em]">Direct Messages</h3>
                </div>

                <div className="space-y-1">
                    {filteredUsers.map((u) => (
                        <button
                            key={u._id}
                            onClick={() => onUserSelect(u)}
                            className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all duration-200 group ${selectedUser?._id === u._id
                                ? 'bg-indigo-600/10 border border-indigo-500/20'
                                : 'hover:bg-zinc-800/50 border border-transparent'
                                }`}
                        >
                            <div className="relative flex-shrink-0">
                                <Avatar
                                    src={u.avatar}
                                    alt={u.name}
                                    size="lg"
                                    className={selectedUser?._id === u._id ? 'border-indigo-500' : ''}
                                />
                                {onlineUsers.includes(u._id) && (
                                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-[#09090b] rounded-full"></div>
                                )}
                            </div>

                            <div className="flex-1 text-left min-w-0">
                                <div className="flex justify-between items-center mb-0.5">
                                    <p className={`text-sm font-semibold truncate ${selectedUser?._id === u._id ? 'text-indigo-400' : 'text-zinc-200'}`}>
                                        {u.name}
                                    </p>
                                    <span className="text-[10px] font-medium text-zinc-500">
                                        {onlineUsers.includes(u._id) ? 'Online' : '1d ago'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <p className="text-xs text-zinc-500 truncate font-medium">
                                        {onlineUsers.includes(u._id) ? 'Ready to sync...' : 'Identity offline'}
                                    </p>
                                    {onlineUsers.includes(u._id) && (
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
                                    )}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Bottom Section */}
            <div className="p-4 border-t border-[#27272a] bg-[#0c0c0e]">
                <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/10">
                    <Plus size={16} />
                    <span>Start New Conversation</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
