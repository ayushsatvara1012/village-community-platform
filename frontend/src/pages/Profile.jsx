import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Users, Plus, Trash2, Loader2, AlertCircle, X,
    ChevronDown, ChevronRight, Mail, Phone, Briefcase, MapPin
} from 'lucide-react';

const API_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://127.0.0.1:8000' : 'https://village-community-platform.onrender.com');

const RELATIONS = ['Father', 'Mother', 'Spouse', 'Son', 'Daughter', 'Brother', 'Sister', 'Grandfather', 'Grandmother', 'Uncle', 'Aunt'];

function TreeNode({ node, onDelete, depth = 0 }) {
    const [expanded, setExpanded] = useState(true);
    const hasChildren = node.children && node.children.length > 0;
    const isSelf = node.relation === 'Self';

    const genderColor = node.gender === 'female'
        ? 'from-pink-500 to-rose-500'
        : 'from-blue-500 to-indigo-500';

    const genderBorder = node.gender === 'female'
        ? 'border-pink-200 dark:border-pink-900/50'
        : 'border-blue-200 dark:border-blue-900/50';

    return (
        <div className="flex flex-col items-center">
            {/* Node card */}
            <motion.div
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className={`relative group bg-white dark:bg-gray-800 rounded-2xl shadow-sm border-2 ${genderBorder} p-3 sm:p-4 min-w-[140px] sm:min-w-[180px] max-w-[200px] text-center transition-all hover:shadow-md ${isSelf ? 'ring-2 ring-blue-500 ring-offset-4 dark:ring-offset-gray-900 z-10' : ''}`}
            >
                {/* Avatar */}
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-linear-to-br ${genderColor} flex items-center justify-center mx-auto mb-2 shadow-inner`}>
                    <span className="text-white text-base sm:text-lg font-bold">
                        {node.name.charAt(0).toUpperCase()}
                    </span>
                </div>

                {/* Info */}
                <div className="space-y-0.5">
                    <h4 className="font-bold text-gray-900 dark:text-white text-xs sm:text-sm truncate px-1">{node.name}</h4>
                    <span className="inline-block px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-tight">
                        {node.relation}
                    </span>
                </div>

                {/* Additional Info (Desktop or larger scale) */}
                <div className="mt-2 hidden sm:block">
                    {node.age && (
                        <p className="text-[10px] text-gray-400">Age: {node.age}</p>
                    )}
                    {node.profession && (
                        <p className="text-[10px] text-gray-400 truncate italic">"{node.profession}"</p>
                    )}
                </div>

                {/* Delete button — hidden for Self */}
                {!isSelf && (
                    <button
                        onClick={() => onDelete(node.id)}
                        className="absolute -top-2 -right-2 w-7 h-7 bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg active:scale-95"
                        title="Remove member"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                )}

                {/* Expand toggle */}
                {hasChildren && (
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full flex items-center justify-center text-gray-400 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors z-10 shadow-sm"
                    >
                        {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    </button>
                )}
            </motion.div>

            {/* Children with connecting lines */}
            {hasChildren && expanded && (
                <div className="flex flex-col items-center mt-0">
                    {/* Vertical connector from parent */}
                    <div className="w-0.5 h-8 bg-linear-to-b from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600"></div>

                    {/* Child nodes with relative horizontal connectors */}
                    <div className="flex items-start mt-0 relative">
                        {node.children.map((child, index) => (
                            <div key={child.id} className="flex flex-col items-center relative px-2 sm:px-6">
                                {/* Horizontal bridge — self-aligning and flush */}
                                {node.children.length > 1 && (
                                    <div className="absolute top-0 left-0 right-0 flex h-0.5">
                                        <div className={`flex-1 ${index === 0 ? 'bg-transparent' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                                        <div className={`flex-1 ${index === node.children.length - 1 ? 'bg-transparent' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                                    </div>
                                )}

                                {/* Vertical connector to child */}
                                <div className="w-0.5 h-8 bg-gray-300 dark:bg-gray-600 z-10"></div>
                                <TreeNode node={child} onDelete={onDelete} depth={depth + 1} />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function Profile() {
    const { user } = useAuth();
    const [tree, setTree] = useState(null);
    const [flatList, setFlatList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [zoomScale, setZoomScale] = useState(0.85); // Default smaller for better overview

    // Add form state
    const [newMember, setNewMember] = useState({
        name: '',
        relation: 'Spouse',
        gender: 'male',
        age: '',
        profession: '',
        linked_sabhasad_id: ''
    });

    const token = localStorage.getItem('village_app_token');
    const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

    const fetchFamily = async () => {
        try {
            const [treeRes, listRes] = await Promise.all([
                fetch(`${API_URL}/family/tree`, { headers }),
                fetch(`${API_URL}/family/`, { headers })
            ]);
            if (treeRes.ok) setTree(await treeRes.json());
            if (listRes.ok) setFlatList(await listRes.json());
        } catch (err) {
            console.error('Failed to fetch family:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchFamily(); }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        try {
            const payload = {
                ...newMember,
                parent_id: newMember.parent_id ? parseInt(newMember.parent_id) : undefined,
                age: newMember.age ? parseInt(newMember.age) : undefined,
                linked_sabhasad_id: newMember.linked_sabhasad_id || undefined
            };
            const res = await fetch(`${API_URL}/family/`, {
                method: 'POST', headers, body: JSON.stringify(payload)
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.detail || 'Failed to add family member');
            }
            setShowAddModal(false);
            setNewMember({ name: '', relation: 'Spouse', parent_id: null, gender: 'male', age: '', profession: '', linked_sabhasad_id: '' });
            await fetchFamily();
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Remove this family member?')) return;
        try {
            await fetch(`${API_URL}/family/${id}`, { method: 'DELETE', headers });
            await fetchFamily();
        } catch (err) {
            console.error('Delete failed:', err);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Profile Header */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden mb-8 border border-white/20 dark:border-gray-700/30">
                    <div className="h-32 bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 relative">
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnYtNGgydjRoNHYySDR2NGgtMnYtNHptLTIyIDBoLTJ2LTRoMnYtNGgydjRoNHYySDR2NGgtMnYtNHoiLz48L2c+PC9nPg')] opacity-30"></div>
                    </div>
                    <div className="relative px-8 pb-8">
                        <div className="-mt-16 flex flex-col sm:flex-row items-center sm:items-end gap-6">
                            <div className="relative group">
                                <img
                                    src={user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + user?.name}
                                    alt={user?.name}
                                    className="w-32 h-32 rounded-3xl border-4 border-white dark:border-gray-800 shadow-2xl bg-white dark:bg-gray-700 object-cover"
                                />
                                <div className="absolute inset-0 rounded-3xl bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                            </div>
                            <div className="text-center sm:text-left flex-1 pt-2">
                                <h1 className="text-3xl font-black bg-linear-to-br from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">{user?.name}</h1>
                                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-6 gap-y-2 mt-2 text-sm text-gray-500 dark:text-gray-400">
                                    <span className="flex items-center gap-1.5 font-medium"><Mail className="w-4 h-4 text-blue-500" />{user.email || "No email"}</span>
                                    {user.phone_number && <span className="flex items-center gap-1.5 font-medium"><Phone className="w-4 h-4 text-green-500" />{user.phone_number}</span>}
                                    <span className="flex items-center gap-1.5 font-medium"><MapPin className="w-4 h-4 text-rose-500" />{user.village?.name || "Village Not Set"}</span>
                                </div>
                                <div className="mt-4 flex items-center justify-center sm:justify-start gap-3">
                                    <div className="font-mono text-xs bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-200 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-600">
                                        ID: <span className="font-bold">{user.sabhasad_id || "PENDING"}</span>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${user?.status === 'member' ? 'bg-green-500 text-white'
                                        : user?.status === 'pending' ? 'bg-amber-500 text-white'
                                            : 'bg-gray-500 text-white'
                                        }`}>
                                        {user?.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Family Tree Section */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-white/20 dark:border-gray-700/30 overflow-hidden flex flex-col h-[600px] sm:h-[700px]">
                    <div className="p-6 sm:p-8 shrink-0 flex items-center justify-between border-b border-gray-100 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm z-20">
                        <div>
                            <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                                    <Users className="w-6 h-6 text-blue-600" />
                                </div>
                                Family Tree
                            </h2>
                            <p className="hidden sm:block text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {flatList.length} total nodes in your lineage
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Zoom Stats */}
                            <div className="hidden sm:flex items-center gap-1 px-3 py-2 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 text-[10px] font-bold text-gray-500">
                                <span>{(zoomScale * 100).toFixed(0)}%</span>
                            </div>

                            <Button
                                onClick={() => { setShowAddModal(true); setError(''); }}
                                className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20 h-10 w-10 sm:h-auto sm:w-auto p-0 sm:px-6 sm:py-2.5 rounded-xl border-none gap-2 flex items-center justify-center font-bold"
                            >
                                <Plus className="w-5 h-5" />
                                <span className="hidden sm:inline">Add Member</span>
                            </Button>
                        </div>
                    </div>

                    {/* Tree visualization with Zoom/Pan */}
                    <div className="flex-1 relative overflow-hidden bg-gray-50/50 dark:bg-gray-900/30 touch-none cursor-grab active:cursor-grabbing">
                        {loading ? (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                            </div>
                        ) : tree ? (
                            <>
                                <motion.div
                                    drag
                                    dragConstraints={{ left: -1500, right: 1500, top: -1500, bottom: 1500 }}
                                    style={{
                                        scale: zoomScale,
                                        transformOrigin: 'top center'
                                    }}
                                    className="absolute left-0 right-0 top-12 flex justify-center p-8 transition-none"
                                >
                                    <div className="min-w-fit">
                                        <TreeNode node={tree} onDelete={handleDelete} />
                                    </div>
                                </motion.div>

                                {/* Zoom Controls */}
                                <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-30">
                                    <button
                                        onClick={() => setZoomScale(s => Math.min(s + 0.1, 1.5))}
                                        className="w-10 h-10 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                                    >
                                        <Plus className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => setZoomScale(s => Math.max(s - 0.1, 0.2))}
                                        className="w-10 h-10 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                                    >
                                        <Trash2 className="w-5 h-5 rotate-45" style={{ transform: 'rotate(45deg)' }} /> {/* Using Trash2 rotated as a minus since I need a simple minus */}
                                        <div className="w-4 h-0.5 bg-current absolute rounded-full" /> {/* Simpler minus */}
                                    </button>
                                    <button
                                        onClick={() => setZoomScale(0.85)}
                                        className="w-10 h-10 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors font-black text-xs"
                                    >
                                        1:1
                                    </button>
                                </div>

                                <div className="absolute bottom-6 left-6 text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2 pointer-events-none">
                                    <div className="flex gap-1">
                                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                        <span>Male</span>
                                    </div>
                                    <div className="flex gap-1">
                                        <div className="w-2 h-2 rounded-full bg-pink-500"></div>
                                        <span>Female</span>
                                    </div>
                                    <span className="ml-2">• Pinch or drag to navigate</span>
                                </div>
                            </>
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 p-8 text-center">
                                <Users className="w-20 h-20 mx-auto mb-6 opacity-10" />
                                <h3 className="text-xl font-bold text-gray-600 dark:text-gray-400">Empty Lineage</h3>
                                <p className="text-sm mt-2 max-w-xs">Your family tree is waiting to be built. Start by adding your first relative.</p>
                                <Button
                                    onClick={() => setShowAddModal(true)}
                                    className="mt-6 bg-blue-600/10 hover:bg-blue-600/20 text-blue-600 border-none px-8"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Get Started
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add Member Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-md w-full p-8 relative border border-white/20 dark:border-gray-700/30"
                        >
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            <div className="text-center mb-8">
                                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <User className="w-8 h-8 text-blue-600" />
                                </div>
                                <h2 className="text-2xl font-black text-gray-900 dark:text-white">Add Family Member</h2>
                                <p className="text-sm text-gray-500 mt-1">Expanding your community lineage</p>
                            </div>

                            {error && (
                                <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 text-red-700 dark:text-red-400 text-sm flex items-center gap-3">
                                    <AlertCircle className="w-5 h-5 shrink-0" />
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleAdd} className="space-y-5">
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 ml-1">Full Name *</label>
                                    <input
                                        type="text" required
                                        value={newMember.name}
                                        onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white transition-all"
                                        placeholder="Full name of member"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 ml-1">Relation *</label>
                                        <select
                                            value={newMember.relation}
                                            onChange={(e) => setNewMember({ ...newMember, relation: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white transition-all"
                                        >
                                            {RELATIONS.map(r => <option key={r} value={r}>{r}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 ml-1">Gender</label>
                                        <select
                                            value={newMember.gender}
                                            onChange={(e) => setNewMember({ ...newMember, gender: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white transition-all"
                                        >
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 ml-1">Age</label>
                                        <input
                                            type="number"
                                            value={newMember.age}
                                            onChange={(e) => setNewMember({ ...newMember, age: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white transition-all"
                                            placeholder="Optional"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 ml-1">Profession</label>
                                        <input
                                            type="text"
                                            value={newMember.profession}
                                            onChange={(e) => setNewMember({ ...newMember, profession: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white transition-all"
                                            placeholder="Optional"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 ml-1">Attach Under Parent</label>
                                    <select
                                        value={newMember.parent_id || ''}
                                        onChange={(e) => setNewMember({ ...newMember, parent_id: e.target.value || null })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white transition-all font-medium"
                                    >
                                        <option value="">— Primary Root (Under You) —</option>
                                        {flatList.map(m => (
                                            <option key={m.id} value={m.id}>{m.name} ({m.relation})</option>
                                        ))}
                                    </select>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-500/20 border-none text-base font-black rounded-xl"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                                    <span className="ml-2">{isSubmitting ? 'Processing...' : 'Add to Family Tree'}</span>
                                </Button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
