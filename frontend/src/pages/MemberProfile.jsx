import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { motion } from 'framer-motion';
import {
    Users, Loader2, Mail, Phone, Briefcase, MapPin, ChevronDown, ChevronRight, ArrowLeft, X
} from 'lucide-react';

const API_URL = 'http://localhost:8000';

function TreeNode({ node, depth = 0, onDelete }) {
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
                className={`relative group bg-white dark:bg-gray-800 rounded-xl shadow-lg border-2 ${genderBorder} p-4 min-w-[160px] max-w-[200px] text-center ${isSelf ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-900' : ''}`}
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

                {/* Linked User Indicator */}
                {node.linked_user_id && !isSelf && (
                    <a
                        href={`/members/${node.linked_user_id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center justify-center gap-1 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded w-full no-underline"
                        title="View Community Profile"
                    >
                        See Profile <ChevronRight className="w-3 h-3" />
                    </a>
                )}

                {/* Delete button (only if onDelete is provided and not Self) */}
                {onDelete && !isSelf && node.id !== 0 && (
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
                                <TreeNode node={child} depth={depth + 1} onDelete={onDelete} />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function MemberProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const [member, setMember] = useState(null);
    const [tree, setTree] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const token = localStorage.getItem('village_app_token');
    const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

    const fetchProfileData = async () => {
        try {
            const [memberRes, treeRes] = await Promise.all([
                fetch(`${API_URL}/members/${id}`, { headers }),
                fetch(`${API_URL}/family/tree/${id}`, { headers })
            ]);

            if (!memberRes.ok) throw new Error('Failed to load member profile');

            const memberData = await memberRes.json();
            memberData.photo = `https://ui-avatars.com/api/?name=${encodeURIComponent(memberData.full_name)}&background=random`;

            setMember(memberData);

            if (treeRes.ok) {
                setTree(await treeRes.json());
            }
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfileData();
    }, [id]);

    const handleDelete = async (memberId) => {
        if (!confirm('Remove this family member?')) return;
        try {
            const res = await fetch(`${API_URL}/family/${memberId}`, { method: 'DELETE', headers });
            if (res.ok) {
                await fetchProfileData();
            } else {
                const err = await res.json();
                console.error('Delete failed:', err);
                alert(`Failed to delete: ${err.detail || 'Unknown error'}`);
            }
        } catch (err) {
            console.error('Delete failed:', err);
        }
    };

    // Determine if current user can delete (they are the owner, or they are an admin)
    const canDelete = currentUser && (currentUser.role === 'admin' || currentUser.id === parseInt(id));

    if (loading) {
        return <div className="flex justify-center items-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
    }

    if (error || !member) {
        return (
            <div className="min-h-[calc(100vh-64px)] bg-gray-50 dark:bg-gray-900 flex justify-center pt-20">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Profile Not Found</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">{error || "This member doesn't exist or you don't have access."}</p>
                    <Button onClick={() => navigate('/members')}>Back to Directory</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Back button */}
                <button
                    onClick={() => navigate('/members')}
                    className="flex items-center text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors mb-6 font-medium"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Directory
                </button>

                {/* Profile Header */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-8">
                    <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600 relative opacity-80"></div>
                    <div className="relative px-8 pb-8">
                        <div className="-mt-16 flex flex-col sm:flex-row items-center sm:items-end gap-4">
                            <img
                                src={member.photo}
                                alt={member.full_name}
                                className="w-28 h-28 rounded-2xl border-4 border-white dark:border-gray-800 shadow-xl bg-gray-200"
                            />
                            <div className="text-center sm:text-left flex-1 pt-2 sm:pt-4">
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{member.full_name}</h1>
                                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                                    <span className="flex items-center gap-1"><Mail className="w-4 h-4" />{member.email}</span>
                                    {member.profession && <span className="flex items-center gap-1"><Briefcase className="w-4 h-4" />{member.profession}</span>}
                                    {member.village && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{member.village.name}</span>}
                                </div>
                            </div>
                            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                Registered Member
                            </span>
                        </div>
                    </div>
                </div>

                {/* Family Tree Section */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                    <div className="mb-8 border-b border-gray-100 dark:border-gray-700 pb-4">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Users className="w-6 h-6 text-blue-600" />
                            Family Tree
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {member.full_name}'s family structure
                        </p>
                    </div>

                    {/* Tree visualization */}
                    {tree && (tree.children.length > 0 || tree.id === 0) ? (
                        <div className="overflow-x-auto pb-8">
                            <div className="flex justify-center min-w-fit py-4">
                                <TreeNode node={tree} onDelete={canDelete ? handleDelete : undefined} />
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-16 text-gray-400">
                            <Users className="w-16 h-16 mx-auto mb-4 opacity-30" />
                            <p className="text-lg">No family members found.</p>
                            <p className="text-sm mt-1">This member hasn't added anyone to their family tree yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
