import { useCallback, useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Quill from 'quill';
import QuillCursors from 'quill-cursors';
import 'quill/dist/quill.snow.css';
import { io } from 'socket.io-client';
import { ArrowLeft, Cloud, CloudOff, FileText, Share2, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

Quill.register('modules/cursors', QuillCursors);

const SAVE_INTERVAL_MS = 2000;
const TOOLBAR_OPTIONS = [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ font: [] }],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['bold', 'italic', 'underline'],
    [{ color: [] }, { background: [] }],
    [{ script: 'sub' }, { script: 'super' }],
    [{ align: [] }],
    ['image', 'blockquote', 'code-block'],
    ['clean'],
];

const Editor = () => {
    const { id: documentId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [socket, setSocket] = useState();
    const [quill, setQuill] = useState();
    const [cursors, setCursors] = useState();
    const [isSaving, setIsSaving] = useState(false);
    const [title, setTitle] = useState('Loading...');
    const [activeUsers, setActiveUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const wrapperRef = useRef(null);

    // Initialize Socket
    useEffect(() => {
        const s = io('http://localhost:5000');
        setSocket(s);

        return () => {
            s.disconnect();
        };
    }, []);

    // Initialize Quill
    useEffect(() => {
        if (!wrapperRef.current) return;

        const editor = document.createElement('div');
        wrapperRef.current.innerHTML = '';
        wrapperRef.current.append(editor);

        const q = new Quill(editor, {
            theme: 'snow',
            modules: {
                toolbar: TOOLBAR_OPTIONS,
                cursors: {
                    transformOnTextChange: true,
                },
            },
        });
        q.disable();
        q.setText('Loading document...');
        setQuill(q);
        setCursors(q.getModule('cursors'));
    }, []);

    // Load Document
    useEffect(() => {
        if (socket == null || quill == null) return;

        const loadHandler = ({ data, title }) => {
            const content = (data && Object.keys(data).length > 0) ? data : { ops: [{ insert: '\n' }] };
            quill.setContents(content);
            quill.enable();
            setTitle(title);
            setLoading(false);
        };

        socket.once('load-document', loadHandler);
        socket.emit('get-document', { documentId, user: { name: user.name, id: user._id } });

        // Timeout fallback
        const timeout = setTimeout(() => {
            if (loading) {
                // Check if we are still loading after 5 seconds
                // This might mean socket connection failed or document doesn't exist
                console.warn("Document load timeout");
            }
        }, 5000);

        return () => clearTimeout(timeout);
    }, [socket, quill, documentId, user, loading]);

    // Handle Title Update
    useEffect(() => {
        if (socket == null) return;

        const handler = (newTitle) => {
            setTitle(newTitle);
        };
        socket.on('receive-title-update', handler);

        return () => {
            socket.off('receive-title-update', handler);
        };
    }, [socket]);

    const handleTitleChange = (e) => {
        const newTitle = e.target.value;
        setTitle(newTitle);
        socket.emit('update-title', newTitle);
    };

    // User Presence & Cursors
    useEffect(() => {
        if (socket == null || quill == null || cursors == null) return;

        const presenceHandler = (users) => {
            setActiveUsers(users);
            // Remove cursors for users who left
            const activeIds = new Set(users.map(u => u.id));
            cursors.cursors().forEach(cursor => {
                if (!activeIds.has(cursor.id)) {
                    cursors.removeCursor(cursor.id);
                }
            });
        };

        const cursorMoveHandler = ({ range, id, name }) => {
            if (id === user._id) return;
            cursors.createCursor(id, name, 'blue');
            cursors.moveCursor(id, range);
        };

        const selectionChangeHandler = (range, oldRange, source) => {
            if (source === 'user') {
                socket.emit('send-cursor-move', range);
            }
        };

        socket.on('user-presence', presenceHandler);
        socket.on('receive-cursor-move', cursorMoveHandler);
        quill.on('selection-change', selectionChangeHandler);

        return () => {
            socket.off('user-presence', presenceHandler);
            socket.off('receive-cursor-move', cursorMoveHandler);
            quill.off('selection-change', selectionChangeHandler);
        };
    }, [socket, quill, cursors, user]);

    // Send Changes
    useEffect(() => {
        if (socket == null || quill == null) return;

        const handler = (delta, oldDelta, source) => {
            if (source !== 'user') return;
            socket.emit('send-changes', delta);
            setIsSaving(true);
        };
        quill.on('text-change', handler);

        return () => {
            quill.off('text-change', handler);
        };
    }, [socket, quill]);

    // Receive Changes
    useEffect(() => {
        if (socket == null || quill == null) return;

        const handler = (delta) => {
            quill.updateContents(delta);
        };
        socket.on('receive-changes', handler);

        return () => {
            socket.off('receive-changes', handler);
        };
    }, [socket, quill]);

    // Autosave
    useEffect(() => {
        if (socket == null || quill == null) return;

        const interval = setInterval(() => {
            socket.emit('save-document', quill.getContents());
            setIsSaving(false);
        }, SAVE_INTERVAL_MS);

        return () => {
            clearInterval(interval);
        };
    }, [socket, quill]);

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle size={32} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
                    <p className="text-gray-500 mb-6">{error}</p>
                    <button
                        onClick={() => navigate('/')}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                        Go back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Editor Header */}
            <nav className="bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-between sticky top-0 z-20">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => navigate('/')}
                        className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex items-center space-x-2">
                        <div className="text-blue-600">
                            <FileText size={24} />
                        </div>
                        <div>
                            <input
                                type="text"
                                value={title}
                                onChange={handleTitleChange}
                                className="text-lg font-bold text-slate-900 bg-transparent border-none focus:ring-0 p-0 w-full"
                                placeholder="Untitled Document"
                            />
                            <div className="flex items-center space-x-2">
                                {isSaving ? (
                                    <span className="flex items-center text-[10px] text-slate-400 font-medium">
                                        <CloudOff size={12} className="mr-1" /> Saving...
                                    </span>
                                ) : (
                                    <span className="flex items-center text-[10px] text-green-500 font-medium">
                                        <Cloud size={12} className="mr-1" /> Saved to Cloud
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-3">
                    <div className="flex -space-x-1 overflow-hidden mr-4">
                        {activeUsers
                            .filter(u => u.id !== user._id) // Don't show myself in the active list
                            .map((u, i) => (
                                <div
                                    key={i}
                                    title={u.name}
                                    className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-indigo-500 flex items-center justify-center text-white text-[10px] font-bold"
                                >
                                    {u.name.charAt(0)}
                                </div>
                            ))}
                    </div>
                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(window.location.href);
                            alert("Link copied to clipboard!");
                        }}
                        className="flex items-center space-x-2 bg-blue-50 text-blue-600 hover:bg-blue-100 px-4 py-2 rounded-lg font-semibold transition-colors"
                    >
                        <Share2 size={18} />
                        <span>Share</span>
                    </button>
                    <div
                        title={`Logged in as ${user.name}`}
                        className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs ring-2 ring-white shadow-sm cursor-pointer"
                    >
                        {user.name.charAt(0)}
                    </div>
                </div>
            </nav>

            {/* Editor Container */}
            <div className="flex-1 overflow-auto p-4 md:p-8 flex justify-center relative">
                {loading && (
                    <div className="absolute inset-0 z-30 bg-slate-50/80 flex items-center justify-center backdrop-blur-sm">
                        <div className="flex flex-col items-center">
                            <Loader2 size={48} className="text-blue-600 animate-spin mb-4" />
                            <p className="text-slate-500 font-medium">Loading document...</p>
                        </div>
                    </div>
                )}
                <div
                    className="bg-white w-full max-w-[850px] min-h-[1100px] shadow-2xl shadow-slate-200 border border-slate-200 rounded-sm"
                    ref={wrapperRef}
                ></div>
            </div>

            <style>{`
        .ql-container.ql-snow {
          border: none !important;
          font-family: 'Inter', sans-serif !important;
          font-size: 16px !important;
        }
        .ql-toolbar.ql-snow {
          border: none !important;
          border-bottom: 1px solid #e2e8f0 !important;
          padding: 8px 16px !important;
          position: sticky;
          top: 0;
          background: white;
          z-index: 10;
        }
        .ql-editor {
          padding: 50px 70px !important;
          min-height: 1100px !important;
        }
      `}</style>
        </div>
    );
};

export default Editor;
