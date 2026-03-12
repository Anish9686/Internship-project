import React, { useState, useRef, useEffect } from 'react';
import { Bell, User, LogOut, Settings as SettingsIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const profileRef = useRef(null);
    const notifRef = useRef(null);

    // Get initials (first letter of first and last name if available, else first two chars)
    const getInitials = (name) => {
        if (!name) return 'U';
        const parts = name.trim().split(' ');
        if (parts.length > 1) {
            return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setShowProfile(false);
            }
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    return (
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
            <div className="flex items-center md:hidden">
                <span className="text-xl font-bold text-gray-900">Tracklytics</span>
            </div>

            <div className="flex-1"></div>

            <div className="flex items-center space-x-4">
                <div className="relative" ref={notifRef}>
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors relative"
                    >
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                    </button>

                    {showNotifications && (
                        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50">
                            <div className="px-4 py-2 border-b border-gray-100">
                                <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                            </div>
                            <div className="px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 cursor-pointer border-b border-gray-50">
                                <p className="font-medium text-gray-900">Weekly Report Available</p>
                                <p className="text-xs mt-1 text-gray-500">Your productivity score is up by 15% this week.</p>
                            </div>
                            <div className="px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 cursor-pointer">
                                <p className="font-medium text-gray-900">Goal Reached</p>
                                <p className="text-xs mt-1 text-gray-500">You achieved your 5h productive time goal today!</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="relative" ref={profileRef}>
                    <div
                        onClick={() => setShowProfile(!showProfile)}
                        className="flex items-center space-x-3 border-l border-gray-200 pl-4 cursor-pointer"
                    >
                        <div className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-medium shadow-sm text-sm tracking-wider">
                            {user ? getInitials(user.name) : 'U'}
                        </div>
                        <div className="hidden md:block text-sm">
                            <p className="font-medium text-gray-700">{user ? user.name : 'Guest'}</p>
                            <p className="text-gray-500 text-xs">{user ? user.email : ''}</p>
                        </div>
                    </div>

                    {showProfile && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
                            <button
                                onClick={() => {
                                    setShowProfile(false);
                                    navigate('/settings');
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                                <SettingsIcon className="w-4 h-4 mr-2" />
                                Settings
                            </button>
                            <div className="border-t border-gray-100 my-1"></div>
                            <button
                                onClick={() => {
                                    logout();
                                    navigate('/login');
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Navbar;
