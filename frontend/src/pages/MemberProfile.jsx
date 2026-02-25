import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, Loader2, Mail, Phone, Briefcase, MapPin, ChevronDown, ChevronRight, ArrowLeft, X,
    RotateCcw, Plus, Trash2
} from 'lucide-react';

const API_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://127.0.0.1:8000' : 'https://village-community-platform.onrender.com');

function TreeNode({ node, depth = 0 }) {
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
                className={`relative group bg-white dark:bg-gray-800 rounded-2xl shadow-sm border-2 ${genderBorder} p-3 sm:p-4 min-w-[140px] sm:min-w-[180px] max-w-[200px] text-center transition-all hover:shadow-md ${isSelf ? 'ring-2 ring-blue-50 ring-offset-4 dark:ring-offset-gray-900 z-10' : ''}`}
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

                {/* Additional Info */}
                <div className="mt-2 hidden sm:block">
                    {node.age && (
                        <p className="text-[10px] text-gray-400">Age: {node.age}</p>
                    )}
                    {node.profession && (
                        <p className="text-[10px] text-gray-400 truncate italic">"{node.profession}"</p>
                    )}
                </div>

                {/* Linked User Indicator */}
                {node.linked_user_id && !isSelf && (
                    <a
                        href={`/members/${node.linked_user_id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center justify-center gap-1 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded w-full no-underline transition-colors"
                        title="View Community Profile"
                    >
                        See Profile <ChevronRight className="w-3 h-3" />
                    </a>
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
                    <div className="w-0.5 h-8 bg-linear-to-b from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600"></div>

                    <div className="flex items-start mt-0 relative">
                        {node.children.map((child, index) => (
                            <div key={child.id} className="flex flex-col items-center relative px-2 sm:px-6">
                                {node.children.length > 1 && (
                                    <div className="absolute top-0 left-0 right-0 flex h-0.5">
                                        <div className={`flex-1 ${index === 0 ? 'bg-transparent' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                                        <div className={`flex-1 ${index === node.children.length - 1 ? 'bg-transparent' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                                    </div>
                                )}
                                <div className="w-0.5 h-8 bg-gray-300 dark:bg-gray-600 z-10"></div>
                                <TreeNode node={child} depth={depth + 1} />
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
    const [flatList, setFlatList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Zoom/Pan state
    const [zoomScale, setZoomScale] = useState(0.85);
    const containerRef = useRef(null);
    const [lastTouchDistance, setLastTouchDistance] = useState(null);
    const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });

    const token = localStorage.getItem('village_app_token');
    const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return dateStr;
            const d = date.getDate().toString().padStart(2, '0');
            const m = (date.getMonth() + 1).toString().padStart(2, '0');
            const y = date.getFullYear();
            return `${d}/${m}/${y}`;
        } catch (e) {
            return dateStr;
        }
    };

    const fetchProfileData = async () => {
        try {
            const [memberRes, treeRes, listRes] = await Promise.all([
                fetch(`${API_URL}/members/${id}`, { headers }),
                fetch(`${API_URL}/family/tree/${id}`, { headers }),
                fetch(`${API_URL}/family/user-family/${id}`, { headers })
            ]);

            if (!memberRes.ok) throw new Error('Failed to load member profile');

            const memberData = await memberRes.json();
            memberData.photo = `https://api.dicebear.com/7.x/avataaars/svg?seed=${memberData.id}`;

            setMember(memberData);

            if (treeRes.ok) setTree(await treeRes.json());
            if (listRes.ok) setFlatList(await listRes.json());
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


    const handleTouchStart = (e) => {
        if (e.touches.length === 2) {
            const dist = Math.hypot(
                e.touches[0].pageX - e.touches[1].pageX,
                e.touches[0].pageY - e.touches[1].pageY
            );
            setLastTouchDistance(dist);
        }
    };

    const handleTouchMove = (e) => {
        if (e.touches.length === 2 && lastTouchDistance) {
            const dist = Math.hypot(
                e.touches[0].pageX - e.touches[1].pageX,
                e.touches[0].pageY - e.touches[1].pageY
            );
            const delta = dist - lastTouchDistance;
            if (Math.abs(delta) > 2) {
                setZoomScale(s => Math.min(Math.max(s + delta * 0.005, 0.2), 1.5));
                setLastTouchDistance(dist);
            }
        }
    };

    const handleTouchEnd = () => setLastTouchDistance(null);
    const resetView = () => {
        setZoomScale(0.85);
        setDragPosition({ x: 0, y: 0 });
    };


    if (loading) {
        return <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900"><Loader2 className="w-10 h-10 animate-spin text-blue-600" /></div>;
    }

    if (error || !member) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex justify-center pt-20 px-4">
                <div className="text-center max-w-sm">
                    <div className="w-20 h-20 bg-gray-200 dark:bg-gray-800 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <Users className="w-10 h-10 text-gray-400" />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Member Not Found</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-8">{error || "This profile doesn't exist or has been removed."}</p>
                    <Button onClick={() => navigate('/members')} className="w-full h-14 rounded-2xl font-bold">Back to Directory</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-7xl mx-auto">
                {/* Back button */}
                <button
                    onClick={() => navigate('/members')}
                    className="flex items-center text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-all mb-8 font-black uppercase tracking-widest text-[10px]"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Directory
                </button>

                {/* Profile Header */}
                <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl overflow-hidden mb-12 border border-white dark:border-gray-700/50 relative">
                    <div className="h-48 sm:h-64 bg-linear-to-r from-blue-600 to-indigo-700 relative overflow-hidden">
                        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent"></div>
                    </div>

                    <div className="relative px-6 sm:px-10 lg:px-12 pb-10">
                        <div className="-mt-20 sm:-mt-24 flex flex-col lg:flex-row items-center lg:items-end gap-6 lg:gap-10">
                            <div className="relative group">
                                <motion.div whileHover={{ scale: 1.02 }} className="relative">
                                    <img
                                        src={member.photo}
                                        alt={member.full_name}
                                        className="w-36 h-36 sm:w-44 sm:h-44 rounded-[2.5rem] border-8 border-white dark:border-gray-800 shadow-[0_20px_50px_rgba(0,0,0,0.3)] bg-white dark:bg-gray-700 object-cover relative z-10"
                                    />
                                    <div className="absolute -inset-2 bg-linear-to-tr from-blue-500 to-indigo-500 rounded-[2.8rem] blur-xl opacity-20 transition-opacity translate-y-2"></div>
                                </motion.div>
                            </div>

                            <div className="text-center lg:text-left flex-1 pt-4 self-center lg:self-end">
                                <div className="flex flex-col lg:flex-row items-center lg:items-baseline gap-3 mb-2">
                                    <h1 className="text-4xl sm:text-5xl font-black text-black dark:text-white tracking-tight leading-none">
                                        {member.full_name}
                                    </h1>
                                    <span className="px-3 py-1 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                                        MEMBER
                                    </span>
                                </div>

                                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-3 mt-4 text-sm font-semibold text-gray-500 dark:text-gray-400">
                                    <span className="flex items-center gap-2 group cursor-default">
                                        <Mail className="w-4 h-4 text-blue-500" />
                                        {member.email}
                                    </span>
                                    {member.profession && (
                                        <span className="flex items-center gap-2 group cursor-default">
                                            <Briefcase className="w-4 h-4 text-purple-500" />
                                            {member.profession}
                                        </span>
                                    )}
                                    <span className="flex items-center gap-2 group cursor-default">
                                        <MapPin className="w-4 h-4 text-rose-500" />
                                        {member.village?.name || "Village Not Set"}
                                    </span>
                                    {member.date_of_birth && (
                                        <span className="flex items-center gap-2 group cursor-default">
                                            <div className="p-1 px-2 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                                                Born: {formatDate(member.date_of_birth)}
                                            </div>
                                        </span>
                                    )}
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
                                Family Lineage
                            </h2>
                            <p className="hidden sm:block text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Exploring the heritage of {member.full_name}
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="hidden sm:flex items-center gap-1 px-3 py-2 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 text-[10px] font-bold text-gray-500">
                                <span>{(zoomScale * 100).toFixed(0)}%</span>
                            </div>
                        </div>
                    </div>

                    <div
                        ref={containerRef}
                        className="flex-1 relative overflow-hidden bg-gray-50/50 dark:bg-gray-900/30 touch-none cursor-grab active:cursor-grabbing"
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                    >
                        {tree ? (
                            <>
                                <motion.div
                                    drag
                                    dragConstraints={{ left: -1200, right: 1200, top: -800, bottom: 1200 }}
                                    dragElastic={0.15}
                                    dragMomentum={false}
                                    animate={{
                                        scale: zoomScale,
                                        x: dragPosition.x,
                                        y: dragPosition.y
                                    }}
                                    transition={{
                                        scale: { duration: 0.3 },
                                        x: { duration: dragPosition.x === 0 ? 0.5 : 0 },
                                        y: { duration: dragPosition.y === 0 ? 0.5 : 0 }
                                    }}
                                    onDragEnd={(e, info) => {
                                        setDragPosition({
                                            x: dragPosition.x + info.offset.x,
                                            y: dragPosition.y + info.offset.y
                                        });
                                    }}
                                    className="absolute inset-0 flex items-start justify-center p-8 pt-12"
                                    style={{ transformOrigin: 'center center' }}
                                >
                                    <div className="min-w-fit flex flex-col items-center justify-center">
                                        <TreeNode node={tree} />
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
                                        <div className="relative w-5 h-5">
                                            <div className="absolute top-1/2 left-0 w-5 h-0.5 bg-current rounded-full" />
                                        </div>
                                    </button>
                                    <button
                                        onClick={resetView}
                                        title="Reset View"
                                        className="w-10 h-10 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                                    >
                                        <RotateCcw className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="absolute bottom-6 left-6 text-[10px] font-black uppercase tracking-widest text-gray-400 grid gap-2 pointer-events-none">
                                    <div className="flex gap-2 items-center">
                                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                        <span>Male</span>
                                        <div className="w-2 h-2 rounded-full bg-pink-500 ml-2"></div>
                                        <span>Female</span>
                                    </div>
                                    <span>• Drag or Pinch to navigate</span>
                                </div>
                            </>
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 p-8 text-center">
                                <Users className="w-20 h-20 mx-auto mb-6 opacity-10" />
                                <h3 className="text-xl font-bold text-gray-600 dark:text-gray-400">Hidden Heritage</h3>
                                <p className="text-sm mt-2 max-w-xs">This member has not yet published their family lineage.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
