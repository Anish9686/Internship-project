import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await api.get('/auth/profile');
                if (response.success) {
                    setUser(response.data);
                }
            } catch (error) {
                // Not logged in, silent fail
            } finally {
                setLoading(false);
            }
        };
        checkAuth();
    }, []);

    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            if (response.success) {
                setUser(response.data.user);
                toast.success('Welcome back!');
                return true;
            }
        } catch (error) {
            toast.error(error);
            return false;
        }
    };

    const register = async ({ name, email, password }) => {
        try {
            const response = await api.post('/auth/register', { name, email, password });
            if (response.success) {
                setUser(response.data.user);
                toast.success('Registration successful!');
                return true;
            }
        } catch (error) {
            toast.error(error);
            return false;
        }
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
            setUser(null);
            toast.success('Logged out');
        } catch (error) {
            toast.error('Logout failed');
        }
    };

    return (
        <AuthContext.Provider value={{ user, setUser, loading, login, register, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
