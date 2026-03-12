import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { Plus, FileText, LogOut, ChevronRight, Clock } from 'lucide-react';

const Dashboard = () => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            const { data } = await API.get('/documents');
            setDocuments(data);
        } catch (err) {
            console.error('Failed to fetch documents', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateDocument = async () => {
        try {
            const { data } = await API.post('/documents', { title: 'Untitled Document' });
            navigate(`/documents/${data._id}`);
        } catch (err) {
            console.error('Failed to create document', err);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Navbar */}
            <nav className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center space-x-2">
                    <div className="bg-blue-600 p-2 rounded-lg text-white">
                        <FileText size={24} />
                    </div>
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight">CollabDoc</h1>
                </div>
                <div className="flex items-center space-x-6">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
                        <p className="text-xs text-slate-500">{user?.email}</p>
                    </div>
                    <button
                        onClick={logout}
                        className="flex items-center space-x-2 text-slate-600 hover:text-red-600 transition-colors"
                    >
                        <LogOut size={20} />
                        <span className="text-sm font-medium">Logout</span>
                    </button>
                </div>
            </nav>

            <main className="max-w-6xl mx-auto p-6 space-y-8">
                {/* Hero Section */}
                <section className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Start a new document</h2>
                        <p className="text-slate-500 mt-1">Create blank or start from a template</p>
                    </div>
                    <button
                        onClick={handleCreateDocument}
                        className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-blue-200 transform hover:scale-105"
                    >
                        <Plus size={20} />
                        <span>Blank Document</span>
                    </button>
                </section>

                {/* Recent Documents */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-slate-900">Recent Documents</h3>
                        <span className="text-sm text-slate-400 font-medium">{documents.length} Items</span>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : documents.length === 0 ? (
                        <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-slate-200">
                            <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                                <FileText size={32} />
                            </div>
                            <h4 className="text-lg font-semibold text-slate-900">No documents yet</h4>
                            <p className="text-slate-500 mt-1">Get started by creating your first collaborative document.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {documents.map((doc) => (
                                <div
                                    key={doc._id}
                                    onClick={() => navigate(`/documents/${doc._id}`)}
                                    className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-blue-500 transition-all cursor-pointer group hover:shadow-xl hover:shadow-slate-200/50"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="bg-blue-50 p-3 rounded-xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                            <FileText size={24} />
                                        </div>
                                        <div className="text-slate-300">
                                            <ChevronRight size={20} />
                                        </div>
                                    </div>
                                    <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                                        {doc.title}
                                    </h4>
                                    <div className="flex items-center text-slate-400 text-xs mt-3">
                                        <Clock size={14} className="mr-1" />
                                        <span>Last edited {new Date(doc.updatedAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
};

export default Dashboard;
