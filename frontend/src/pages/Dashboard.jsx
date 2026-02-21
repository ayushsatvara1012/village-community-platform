import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { DollarSign, Users, TrendingUp, Download, CheckCircle, XCircle, Clock, Loader2, MapPin, Plus, Trash2, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
    const { user } = useAuth();
    const [villageCount, setVillageCount] = useState(0);
    const [stats, setStats] = useState({ total_collection: 0, current_balance: 0, top_donor: 'N/A' });
    const [chartData, setChartData] = useState([]);
    const [pendingMembers, setPendingMembers] = useState([]);
    const [actionId, setActionId] = useState(null);
    const [expandedMember, setExpandedMember] = useState(null);
    const [adminComment, setAdminComment] = useState('');
    const [villages, setVillages] = useState([]);
    const [memberCount, setMemberCount] = useState(0);
    const [newVillage, setNewVillage] = useState({ name: '', district: '' });
    const [addingVillage, setAddingVillage] = useState(false);
    const [deletingVillageId, setDeletingVillageId] = useState(null);

    const token = localStorage.getItem('village_app_token');

    const fetchVillages = () => {
        fetch('http://localhost:8000/villages/')
            .then(res => res.json())
            .then(data => {
                setVillages(data);
                setVillageCount(data.length);
            })
            .catch(err => console.error("Failed to fetch villages:", err));
    };

    const fetchMembers = () => {
        if (token) {
            fetch('http://localhost:8000/members/', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(res => res.ok ? res.json() : [])
                .then(data => setMemberCount(Array.isArray(data) ? data.length : 0))
                .catch(() => setMemberCount(0));
        }
    };

    const fetchPending = () => {
        if (token) {
            fetch('http://localhost:8000/members/pending', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(res => res.ok ? res.json() : [])
                .then(data => setPendingMembers(Array.isArray(data) ? data : []))
                .catch(() => setPendingMembers([]));
        }
    };

    useEffect(() => {
        fetchVillages();
        fetchMembers();

        fetch('http://localhost:8000/payments/stats')
            .then(res => res.json())
            .then(data => setStats(data))
            .catch(err => console.error("Failed to fetch stats:", err));

        fetch('http://localhost:8000/payments/history')
            .then(res => res.json())
            .then(data => {
                const chart = data.slice(0, 7).map((d) => ({
                    name: `Tx-${d.id}`,
                    amount: d.amount,
                }));
                setChartData(chart);
            })
            .catch(err => console.error("Failed to fetch payments:", err));

        fetchPending();
    }, []);

    const handleApprove = async (memberId) => {
        setActionId(memberId);
        try {
            const res = await fetch(`http://localhost:8000/members/${memberId}/approve`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ comment: adminComment || 'Application approved' })
            });
            if (res.ok) {
                setPendingMembers(prev => prev.filter(m => m.id !== memberId));
                setExpandedMember(null);
                setAdminComment('');
            } else {
                const err = await res.json();
                alert(err.detail || 'Approve failed');
            }
        } catch (err) {
            console.error("Approve failed:", err);
        } finally {
            setActionId(null);
        }
    };

    const handleReject = async (memberId) => {
        if (!adminComment.trim()) {
            alert('Please provide a reason for rejection');
            return;
        }
        setActionId(memberId);
        try {
            const res = await fetch(`http://localhost:8000/members/${memberId}/reject`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ comment: adminComment })
            });
            if (res.ok) {
                setPendingMembers(prev => prev.filter(m => m.id !== memberId));
                setExpandedMember(null);
                setAdminComment('');
            } else {
                const err = await res.json();
                alert(err.detail || 'Reject failed');
            }
        } catch (err) {
            console.error("Reject failed:", err);
        } finally {
            setActionId(null);
        }
    };

    const handleAddVillage = async () => {
        if (!newVillage.name || !newVillage.district) return;
        setAddingVillage(true);
        try {
            const res = await fetch('http://localhost:8000/villages/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newVillage)
            });
            if (res.ok) {
                setNewVillage({ name: '', district: '' });
                fetchVillages();
            } else {
                const err = await res.json();
                alert(err.detail || 'Failed to add village');
            }
        } catch (err) {
            console.error('Add village failed:', err);
        } finally {
            setAddingVillage(false);
        }
    };

    const handleDeleteVillage = async (villageId) => {
        if (!confirm('Delete this village?')) return;
        setDeletingVillageId(villageId);
        try {
            const res = await fetch(`http://localhost:8000/villages/${villageId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                fetchVillages();
            } else {
                const err = await res.json();
                alert(err.detail || 'Failed to delete village');
            }
        } catch (err) {
            console.error('Delete village failed:', err);
        } finally {
            setDeletingVillageId(null);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                    <p className="text-gray-500 dark:text-gray-400">Welcome back, {user?.full_name || 'User'}.</p>
                </div>
                {user?.status === 'member' && (
                    <Button variant="outline" className="gap-2">
                        <Download className="w-4 h-4" /> Download ID Card
                    </Button>
                )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Collection</h3>
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{stats.total_collection.toLocaleString()}</p>
                    <span className="text-xs text-green-600 dark:text-green-400 font-medium">Live</span>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Members</h3>
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{memberCount}</p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Villages</h3>
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <MapPin className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{villageCount}</p>
                </div>
            </div>

            {/* Charts & Admin Panels */}
            <div className={`grid grid-cols-1 ${user?.role === 'admin' ? 'lg:grid-cols-3' : 'lg:grid-cols-1'} gap-8`}>
                {/* Chart */}
                <div className={`${user?.role === 'admin' ? 'lg:col-span-2' : ''} bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700`}>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Recent Donations Trend</h3>
                    <div className="h-80 w-full">
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                                    <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: '#1f2937', color: '#fff', borderRadius: '8px', border: 'none' }} />
                                    <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">
                                No payment data yet
                            </div>
                        )}
                    </div>
                </div>

                {/* Pending Requests — Admin Only */}
                {user?.role === 'admin' && (
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Pending Requests</h3>
                            <span className="text-sm bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-1 rounded-full font-medium">
                                {pendingMembers.length}
                            </span>
                        </div>
                        <div className="space-y-3 max-h-[500px] overflow-y-auto">
                            {pendingMembers.length > 0 ? (
                                pendingMembers.map((member) => (
                                    <div key={member.id} className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                                        {/* Summary row */}
                                        <button
                                            onClick={() => {
                                                setExpandedMember(expandedMember === member.id ? null : member.id);
                                                setAdminComment('');
                                            }}
                                            className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                        >
                                            <img
                                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(member.full_name)}&background=random&size=40`}
                                                alt={member.full_name}
                                                className="w-10 h-10 rounded-full flex-shrink-0"
                                            />
                                            <div className="flex-1 min-w-0 text-left">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{member.full_name}</p>
                                                <p className="text-xs text-gray-500">{member.email}</p>
                                            </div>
                                            {expandedMember === member.id
                                                ? <ChevronUp className="w-4 h-4 text-gray-400" />
                                                : <ChevronDown className="w-4 h-4 text-gray-400" />
                                            }
                                        </button>

                                        {/* Expanded details */}
                                        {expandedMember === member.id && (
                                            <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                                                <div className="grid grid-cols-2 gap-2 py-3 text-sm">
                                                    <div>
                                                        <span className="text-gray-500 text-xs">Phone</span>
                                                        <p className="font-medium text-gray-900 dark:text-white">{member.phone_number || '—'}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500 text-xs">Profession</span>
                                                        <p className="font-medium text-gray-900 dark:text-white">{member.profession || '—'}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500 text-xs">Village</span>
                                                        <p className="font-medium text-gray-900 dark:text-white">{member.village?.name || '—'}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500 text-xs">Email</span>
                                                        <p className="font-medium text-gray-900 dark:text-white truncate">{member.email || '—'}</p>
                                                    </div>
                                                </div>

                                                {/* Comment field */}
                                                <div className="mb-3">
                                                    <label className="flex items-center gap-1 text-xs font-medium text-gray-500 mb-1">
                                                        <MessageSquare className="w-3 h-3" /> Comment
                                                    </label>
                                                    <textarea
                                                        value={adminComment}
                                                        onChange={(e) => setAdminComment(e.target.value)}
                                                        placeholder="Add a comment (required for rejection)..."
                                                        className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white"
                                                        rows="2"
                                                    />
                                                </div>

                                                {/* Action buttons */}
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        className="flex-1 bg-green-600 hover:bg-green-700 gap-1"
                                                        onClick={() => handleApprove(member.id)}
                                                        disabled={actionId === member.id}
                                                    >
                                                        {actionId === member.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        className="flex-1 bg-red-600 hover:bg-red-700 gap-1"
                                                        onClick={() => handleReject(member.id)}
                                                        disabled={actionId === member.id}
                                                    >
                                                        {actionId === member.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
                                                        Reject
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-gray-500 text-center py-8">No pending requests 🎉</p>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Village Management — Admin Only */}
            {user?.role === 'admin' && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mt-8">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-blue-600" />
                            Village Management
                        </h3>
                        <span className="text-sm text-gray-500">{villages.length} villages</span>
                    </div>

                    {/* Add Village Form */}
                    <div className="flex flex-col sm:flex-row gap-3 mb-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                        <input
                            type="text"
                            placeholder="Village Name"
                            value={newVillage.name}
                            onChange={(e) => setNewVillage(prev => ({ ...prev, name: e.target.value }))}
                            className="flex-1 px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none text-sm text-gray-900 dark:text-white"
                        />
                        <input
                            type="text"
                            placeholder="District"
                            value={newVillage.district}
                            onChange={(e) => setNewVillage(prev => ({ ...prev, district: e.target.value }))}
                            className="flex-1 px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none text-sm text-gray-900 dark:text-white"
                        />
                        <Button
                            onClick={handleAddVillage}
                            disabled={addingVillage || !newVillage.name || !newVillage.district}
                            className="gap-1 bg-green-600 hover:bg-green-700 whitespace-nowrap"
                        >
                            {addingVillage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                            Add Village
                        </Button>
                    </div>

                    {/* Villages List */}
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                        {villages.map(village => (
                            <div key={village.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{village.name}</p>
                                    <p className="text-xs text-gray-500">{village.district}</p>
                                </div>
                                <button
                                    onClick={() => handleDeleteVillage(village.id)}
                                    disabled={deletingVillageId === village.id}
                                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                                    title="Delete village"
                                >
                                    {deletingVillageId === village.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                </button>
                            </div>
                        ))}
                        {villages.length === 0 && (
                            <p className="text-sm text-gray-500 text-center py-4">No villages yet. Add one above.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
