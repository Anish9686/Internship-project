import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Mail, Lock, Loader2, ShieldCheck, LogIn } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const success = await login(email, password);
        setLoading(false);
        if (success) navigate('/');
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-[#09090b]">
            <motion.div
                initial={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="bg-[#18181b] border border-zinc-800 rounded-3xl p-10 shadow-2xl">
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-600/20">
                            <LogIn className="text-white w-8 h-8" />
                        </div>
                        <h1 className="text-3xl font-bold text-white tracking-tight text-center">
                            Sign in to Account
                        </h1>
                        <p className="text-zinc-400 mt-2 text-center">
                            Welcome back. Please enter your details.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300 ml-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-indigo-500 transition-colors" />
                                <input
                                    type="email"
                                    required
                                    placeholder="Enter your email"
                                    className="real-input pl-12"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-sm font-medium text-zinc-300">Password</label>
                                <a href="#" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300">Forgot password?</a>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-indigo-500 transition-colors" />
                                <input
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    className="real-input pl-12"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-real w-full flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    "Continue to Chat"
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-8 flex items-center gap-3 justify-center text-xs text-zinc-500">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        <span>Secure, encrypted authentication session</span>
                    </div>
                </div>

                <p className="text-zinc-500 text-sm text-center mt-8">
                    Don't have an identity yet?{' '}
                    <Link to="/register" className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors">
                        Create one now
                    </Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Login;
