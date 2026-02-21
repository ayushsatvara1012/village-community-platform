import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Users, Plus, Trash2, Loader2, AlertCircle, X,
    ChevronDown, ChevronRight, Mail, Phone, Briefcase, MapPin
} from 'lucide-react';

const API_URL = 'http://localhost:8000';

const RELATIONS = ['Father', 'Mother', 'Spouse', 'Son', 'Daughter', 'Brother', 'Sister', 'Grandfather', 'Grandmother', 'Uncle', 'Aunt'];

function TreeNode({ node, onDelete, depth = 0 }) {
    const [expanded, setExpanded] = useState(true);
    const hasChildren = node.children && node.children.length > 0;
    const isSelf = node.relation === 'Self';

    const genderColor = node.gender === 'female'
        ? 'from-pink-500 to-rose-500'
        : 'from-blue-500 to-indigo-500';

    const genderBorder = node.gender === 'female'
        ? 'border-pink-300 dark:border-pink-700'
        : 'border-blue-300 dark:border-blue-700';

    return (
        <div className="flex flex-col items-center">
            {/* Node card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: depth * 0.1 }}
                className={`relative group bg-white dark:bg-gray-800 rounded-xl shadow-lg border-2 ${genderBorder} p-4 min-w-[160px] max-w-[200px] text-center transition-shadow hover:shadow-xl ${isSelf ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-900' : ''}`}
            >
                {/* Avatar */}
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${genderColor} flex items-center justify-center mx-auto mb-2 shadow-md`}>
                    <span className="text-white text-lg font-bold">
                        {node.name.charAt(0).toUpperCase()}
                    </span>
                </div>

                {/* Name */}
                <h4 className="font-bold text-gray-900 dark:text-white text-sm truncate">{node.name}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{node.relation}</p>

                {node.age && (
                    <p className="text-xs text-gray-400 mt-1">Age: {node.age}</p>
                )}
                {node.profession && (
                    <p className="text-xs text-gray-400 truncate">{node.profession}</p>
                )}

                {/* Delete button — hidden for Self */}
                {!isSelf && node.id !== 0 && (
                    <button
                        onClick={() => onDelete(node.id)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                        title="Remove"
                    >
                        <X className="w-3 h-3" />
                    </button>
                )}

                {/* Expand toggle */}
                {hasChildren && (
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors z-10 shadow"
                    >
                        {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                    </button>
                )}
            </motion.div>

            {/* Children with connecting lines */}
            {hasChildren && expanded && (
                <div className="flex flex-col items-center mt-1">
                    {/* Vertical connector from parent */}
                    <div className="w-0.5 h-6 bg-gray-300 dark:bg-gray-600"></div>

                    {/* Horizontal connector bar */}
                    {node.children.length > 1 && (
                        <div className="relative w-full flex justify-center">
                            <div
                                className="h-0.5 bg-gray-300 dark:bg-gray-600"
                                style={{
                                    width: `${Math.max((node.children.length - 1) * 200, 100)}px`
                                }}
                            ></div>
                        </div>
                    )}

                    {/* Child nodes */}
                    <div className="flex gap-8 items-start">
                        {node.children.map((child) => (
                            <div key={child.id} className="flex flex-col items-center">
                                {/* Vertical connector to child */}
                                <div className="w-0.5 h-6 bg-gray-300 dark:bg-gray-600"></div>
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
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-8">
                    <div className="h-32 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative">
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnYtNGgydjRoNHYySDR2NGgtMnYtNHptLTIyIDBoLTJ2LTRoMnYtNGgydjRoNHYySDR2NGgtMnYtNHoiLz48L2c+PC9nPg')] opacity-30"></div>
                    </div>
                    <div className="relative px-8 pb-8">
                        <div className="-mt-16 flex flex-col sm:flex-row items-center sm:items-end gap-4">
                            <img
                                src={user?.avatar}
                                alt={user?.name}
                                className="w-28 h-28 rounded-2xl border-4 border-white dark:border-gray-800 shadow-xl bg-gray-200"
                            />
                            <div className="text-center sm:text-left flex-1 pt-2 sm:pt-4">
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{user?.name}</h1>
                                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                                    <span className="flex items-center gap-1"><Mail className="w-4 h-4" />{user.email || "No email"}</span>
                                    {user.phone_number && <span className="flex items-center gap-1"><Phone className="w-4 h-4" />{user.phone_number}</span>}
                                    {user.profession && <span className="flex items-center gap-1"><Briefcase className="w-4 h-4" />{user.profession}</span>}
                                    {user.village && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{user.village.name}</span>}
                                </div>
                                <div className="mt-4 font-mono text-sm bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 px-4 py-2 rounded-lg inline-block">
                                    Sabhasad ID: <strong>{user.sabhasad_id || "Not Assigned"}</strong>
                                </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${user?.status === 'member' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                : user?.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                                }`}>
                                {user?.status}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Family Tree Section */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Users className="w-6 h-6 text-blue-600" />
                                Family Tree
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {flatList.length} member{flatList.length !== 1 ? 's' : ''} added
                            </p>
                        </div>
                        <Button
                            onClick={() => { setShowAddModal(true); setError(''); }}
                            className="bg-blue-600 hover:bg-blue-700 border-none gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Add Member
                        </Button>
                    </div>

                    {/* Tree visualization */}
                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                        </div>
                    ) : tree ? (
                        <div className="overflow-x-auto pb-8">
                            <div className="flex justify-center min-w-fit py-4">
                                <TreeNode node={tree} onDelete={handleDelete} />
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-16 text-gray-400">
                            <Users className="w-16 h-16 mx-auto mb-4 opacity-30" />
                            <p className="text-lg">No family members added yet.</p>
                            <p className="text-sm mt-1">Click "Add Member" to start building your family tree.</p>
                        </div>
                    )}
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
                            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8 relative"
                        >
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            <div className="text-center mb-6">
                                <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mx-auto mb-3">
                                    <User className="w-7 h-7 text-blue-600" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add Family Member</h2>
                            </div>

                            {error && (
                                <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleAdd} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name *</label>
                                    <input
                                        type="text" required
                                        value={newMember.name}
                                        onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white"
                                        placeholder="Enter name"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Relation *</label>
                                        <select
                                            value={newMember.relation}
                                            onChange={(e) => setNewMember({ ...newMember, relation: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white"
                                        >
                                            {RELATIONS.map(r => <option key={r} value={r}>{r}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gender</label>
                                        <select
                                            value={newMember.gender}
                                            onChange={(e) => setNewMember({ ...newMember, gender: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white"
                                        >
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Age (Optional)</label>
                                        <input
                                            type="number"
                                            value={newMember.age}
                                            onChange={(e) => setNewMember({ ...newMember, age: e.target.value })}
                                            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Profession (Optional)</label>
                                        <input
                                            type="text"
                                            value={newMember.profession}
                                            onChange={(e) => setNewMember({ ...newMember, profession: e.target.value })}
                                            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                                        />
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Link Community Sabhasad ID (Optional)</label>
                                    <input
                                        type="text"
                                        value={newMember.linked_sabhasad_id}
                                        onChange={(e) => setNewMember({ ...newMember, linked_sabhasad_id: e.target.value })}
                                        placeholder="e.g. SAB-0001"
                                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">If this relative is registered in the app, enter their unique Sabhasad ID to link their accounts.</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Parent (attach under)</label>
                                    <select
                                        value={newMember.parent_id || ''}
                                        onChange={(e) => setNewMember({ ...newMember, parent_id: e.target.value || null })}
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white"
                                    >
                                        <option value="">— Root level (under you) —</option>
                                        {flatList.map(m => (
                                            <option key={m.id} value={m.id}>{m.name} ({m.relation})</option>
                                        ))}
                                    </select>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 border-none text-lg"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Plus className="w-5 h-5 mr-2" />}
                                    {isSubmitting ? 'Adding...' : 'Add to Family Tree'}
                                </Button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
