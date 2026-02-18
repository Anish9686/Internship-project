import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Lock, User, Loader2, ShieldCheck, Zap } from 'lucide-react';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const success = await register({ name, email, password });
        setLoading(false);
        if (success) navigate('/');
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-[#09090b]">
            <motion.div
                initial={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md"
            >
                <div className="bg-[#18181b] border border-zinc-800 rounded-3xl p-10 shadow-2xl">
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-600/20">
                            <UserPlus className="text-white w-8 h-8" />
                        </div>
                        <h1 className="text-3xl font-bold text-white tracking-tight text-center">
                            Create Identity
                        </h1>
                        <p className="text-zinc-400 mt-2 text-center">
                            Join the secure communication network.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300 ml-1">Full Name</label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. John Doe"
                                className="real-input"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300 ml-1">Email Address</label>
                            <input
                                type="email"
                                required
                                placeholder="name@example.com"
                                className="real-input"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300 ml-1">Secure Password</label>
                            <input
                                type="password"
                                required
                                placeholder="Min. 6 characters"
                                className="real-input"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-real w-full flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    "Initialize Identity"
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-8 flex items-center gap-3 justify-center text-[11px] text-zinc-500 uppercase tracking-widest font-bold">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        <span>E2E Encrypted Protocol</span>
                    </div>
                </div>

                <p className="text-zinc-500 text-sm text-center mt-8 font-medium">
                    Already have an identity?{' '}
                    <Link to="/login" className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors">
                        Sign back in
                    </Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Register;
