import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const { user } = useAuth();
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [typingUsers, setTypingUsers] = useState({}); // userId -> { isTyping: boolean, roomId?: string }

    // Use ref for socket to avoid re-renders during initialization
    const socketRef = useRef();

    useEffect(() => {
        if (user) {
            const newSocket = io(import.meta.env.VITE_SERVER_URL || 'http://localhost:5000', {
                auth: {
                    token: localStorage.getItem('token'), // Fallback if cookie fails
                },
                withCredentials: true,
            });

            socketRef.current = newSocket;
            setSocket(newSocket);

            newSocket.on('connect_error', (err) => {
                console.error('Socket Connection Error:', err.message);
            });

            newSocket.on('getOnlineUsers', (userIds) => {
                setOnlineUsers(userIds);
            });

            newSocket.on('userStatus', ({ userId, status }) => {
                setOnlineUsers((prev) => {
                    if (status === 'online') return Array.from(new Set([...prev, userId]));
                    return prev.filter((id) => id !== userId);
                });
            });

            newSocket.on('displayTyping', (data) => {
                const { userId, isTyping } = data;
                setTypingUsers((prev) => ({
                    ...prev,
                    [userId]: isTyping
                }));
            });

            return () => {
                newSocket.close();
            };
        } else {
            if (socket) {
                socket.close();
                setSocket(null);
            }
        }
    }, [user]);

    return (
        <SocketContext.Provider value={{ socket, onlineUsers, typingUsers }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);
