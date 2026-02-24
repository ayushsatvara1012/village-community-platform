import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { IndianRupee, Users, TrendingUp, Download, CheckCircle, XCircle, Clock, Loader2, MapPin, Plus, Trash2, Edit2, Save, X, ChevronDown, ChevronUp, MessageSquare, Filter } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { FullScreenLoader } from '../components/ui/FullScreenLoader';

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
    const [showAddVillageForm, setShowAddVillageForm] = useState(false);
    const [deletingVillageId, setDeletingVillageId] = useState(null);
    const [editingVillageId, setEditingVillageId] = useState(null);
    const [editingVillageData, setEditingVillageData] = useState({ name: '', district: '' });

    const [recentDonations, setRecentDonations] = useState([]);
    const [donationsOffset, setDonationsOffset] = useState(0);
    const [hasMoreDonations, setHasMoreDonations] = useState(true);
    const [donationFilter, setDonationFilter] = useState({ sort_by: 'date', order: 'desc', start_date: '', end_date: '' });
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const [chartFilter, setChartFilter] = useState({ start_date: '', end_date: '', month: '', year: new Date().getFullYear().toString() });

    // Loading states for FullScreenLoader
    const [isLoadingStats, setIsLoadingStats] = useState(true);
    const [isLoadingVillages, setIsLoadingVillages] = useState(true);
    const [isLoadingMembers, setIsLoadingMembers] = useState(true);
    const [isLoadingChart, setIsLoadingChart] = useState(true);
    const [isLoadingRecent, setIsLoadingRecent] = useState(true);
    const [isLoadingMoreDonations, setIsLoadingMoreDonations] = useState(false);
    const [isLoadingPending, setIsLoadingPending] = useState(user?.role === 'admin');

    const token = localStorage.getItem('village_app_token');

    const fetchVillages = () => {
        setIsLoadingVillages(true);
        fetch((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://127.0.0.1:8000' : 'https://village-community-platform.onrender.com') + '/villages/')
            .then(res => res.json())
            .then(data => {
                setVillages(data);
                setVillageCount(data.length);
            })
            .catch(err => console.error("Failed to fetch villages:", err))
            .finally(() => setIsLoadingVillages(false));
    };

    const fetchMembers = () => {
        setIsLoadingMembers(true);
        if (token) {
            fetch((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://127.0.0.1:8000' : 'https://village-community-platform.onrender.com') + '/members/', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(res => res.ok ? res.json() : [])
                .then(data => setMemberCount(Array.isArray(data) ? data.length : 0))
                .catch(() => setMemberCount(0))
                .finally(() => setIsLoadingMembers(false));
        } else {
            setIsLoadingMembers(false);
        }
    };

    const fetchPending = () => {
        setIsLoadingPending(true);
        if (token) {
            fetch((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://127.0.0.1:8000' : 'https://village-community-platform.onrender.com') + '/members/pending', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(res => res.ok ? res.json() : [])
                .then(data => setPendingMembers(Array.isArray(data) ? data : []))
                .catch(() => setPendingMembers([]))
                .finally(() => setIsLoadingPending(false));
        } else {
            setIsLoadingPending(false);
        }
    };

    const fetchChartData = (filters) => {
        setIsLoadingChart(true);
        const params = new URLSearchParams();
        if (filters.start_date) params.append('start_date', filters.start_date);
        if (filters.end_date) params.append('end_date', filters.end_date);
        if (filters.month) params.append('month', filters.month);
        if (filters.year) params.append('year', filters.year);

        fetch(`${window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://127.0.0.1:8000' : 'https://village-community-platform.onrender.com'}/payments/chart?${params.toString()}`)
            .then(res => res.json())
            .then(data => setChartData(data))
            .catch(err => console.error("Failed to fetch chart data:", err))
            .finally(() => setIsLoadingChart(false));
    };

    const fetchDonations = (offset, filters) => {
        if (offset === 0) setIsLoadingRecent(true);
        else setIsLoadingMoreDonations(true);

        const params = new URLSearchParams({ limit: 10, offset });
        if (filters.sort_by) params.append('sort_by', filters.sort_by);
        if (filters.order) params.append('order', filters.order);
        if (filters.start_date) params.append('start_date', filters.start_date);
        if (filters.end_date) params.append('end_date', filters.end_date);

        fetch(`${window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://127.0.0.1:8000' : 'https://village-community-platform.onrender.com'}/payments/recent-donations?${params.toString()}`)
            .then(res => res.json())
            .then(data => {
                if (offset === 0) {
                    setRecentDonations(data);
                } else if (data.length > 0) {
                    setRecentDonations(prev => [...prev, ...data]);
                }

                if (data.length < 10) setHasMoreDonations(false);
                else setHasMoreDonations(true);

                setDonationsOffset(offset);
            })
            .catch(err => console.error("Failed to fetch donations:", err))
            .finally(() => {
                setIsLoadingRecent(false);
                setIsLoadingMoreDonations(false);
            });
    };

    useEffect(() => {
        fetchVillages();
        fetchMembers();

        setIsLoadingStats(true);
        fetch((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://127.0.0.1:8000' : 'https://village-community-platform.onrender.com') + '/payments/stats')
            .then(res => res.json())
            .then(data => setStats(data))
            .catch(err => console.error("Failed to fetch stats:", err))
            .finally(() => setIsLoadingStats(false));

        fetchDonations(0, donationFilter);
        fetchChartData(chartFilter);
        if (user?.role === 'admin') {
            fetchPending();
        } else {
            setIsLoadingPending(false);
        }
    }, [user?.role]);

    const applyFilter = (key, val) => {
        const newFilters = { ...donationFilter, [key]: val };
        setDonationFilter(newFilters);
        setDonationsOffset(0);
        fetchDonations(0, newFilters);
        setShowFilterDropdown(false);
    };

    const loadMoreDonations = () => {
        fetchDonations(donationsOffset + 10, donationFilter);
    };

    if (isLoadingStats || isLoadingVillages || isLoadingMembers || isLoadingPending) {
        return <FullScreenLoader message="Loading dashboard data..." />;
    }

    const handleApprove = async (memberId) => {
        setActionId(memberId);
        try {
            const res = await fetch(`${window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://127.0.0.1:8000' : 'https://village-community-platform.onrender.com'}/members/${memberId}/approve`, {
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
            const res = await fetch(`${window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://127.0.0.1:8000' : 'https://village-community-platform.onrender.com'}/members/${memberId}/reject`, {
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
            const res = await fetch((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://127.0.0.1:8000' : 'https://village-community-platform.onrender.com') + '/villages/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newVillage)
            });
            if (res.ok) {
                setNewVillage({ name: '', district: '' });
                setShowAddVillageForm(false);
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

    const handleEditVillage = async () => {
        if (!editingVillageData.name || !editingVillageData.district) return;
        try {
            const res = await fetch(`${window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://127.0.0.1:8000' : 'https://village-community-platform.onrender.com'}/villages/${editingVillageId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(editingVillageData)
            });
            if (res.ok) {
                setEditingVillageId(null);
                fetchVillages();
            } else {
                const err = await res.json();
                alert(err.detail || 'Failed to update village');
            }
        } catch (err) {
            console.error('Update village failed:', err);
        }
    };

    const handleDeleteVillage = async (villageId) => {
        if (!confirm('Delete this village?')) return;
        setDeletingVillageId(villageId);
        try {
            const res = await fetch(`${window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://127.0.0.1:8000' : 'https://village-community-platform.onrender.com'}/villages/${villageId}`, {
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
        <div className="px-4 sm:px-6 lg:px-8 py-8">
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
                <div className="bg-[url('/Users/ayushsatvara/.gemini/antigravity/playground/outer-planck/frontend/src/assets/indian-rupee.svg')] bg-no-repeat bg-top-right bg-size-[180px] dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Collection</h3>
                        {/* <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <IndianRupee className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div> */}
                    </div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        ₹{stats.total_collection.toLocaleString()}
                        <span className="text-xs text-green-600 dark:text-green-400 font-medium bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">Live</span>
                    </p>
                </div>

                <div className="bg-[url('/Users/ayushsatvara/.gemini/antigravity/playground/outer-planck/frontend/src/assets/users.svg')] bg-no-repeat bg-top-right bg-size-[180px] dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Members</h3>
                        {/* <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div> */}
                    </div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{memberCount}</p>
                </div>

                <div className="bg-[url('/Users/ayushsatvara/.gemini/antigravity/playground/outer-planck/frontend/src/assets/map-pin.svg')] bg-no-repeat bg-top-right bg-size-[180px] dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Villages</h3>
                        {/* <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <MapPin className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div> */}
                    </div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{villageCount}</p>
                </div>
            </div>

            <div className={`grid grid-cols-1 ${user?.role === 'admin' ? 'lg:grid-cols-5' : 'lg:grid-cols-1'} gap-6 sm:gap-8`}>
                {/* Chart */}
                <div className={`${user?.role === 'admin' ? 'lg:col-span-3' : ''} min-w-0 bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col h-auto lg:h-[420px]`}>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4 flex-shrink-0">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Donations Trend (INR vs Date)</h3>
                        <div className="flex flex-wrap items-center gap-2">
                            <select
                                className="text-xs p-1.5 rounded border border-gray-200 dark:border-gray-700 dark:bg-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                value={chartFilter.month}
                                onChange={e => {
                                    const newF = { ...chartFilter, month: e.target.value, start_date: '', end_date: '' };
                                    setChartFilter(newF);
                                    fetchChartData(newF);
                                }}
                            >
                                <option value="">All Months</option>
                                <option value="01">Jan</option>
                                <option value="02">Feb</option>
                                <option value="03">Mar</option>
                                <option value="04">Apr</option>
                                <option value="05">May</option>
                                <option value="06">Jun</option>
                                <option value="07">Jul</option>
                                <option value="08">Aug</option>
                                <option value="09">Sep</option>
                                <option value="10">Oct</option>
                                <option value="11">Nov</option>
                                <option value="12">Dec</option>
                            </select>
                            <select
                                className="text-xs p-1.5 rounded border border-gray-200 dark:border-gray-700 dark:bg-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                value={chartFilter.year}
                                onChange={e => {
                                    const newF = { ...chartFilter, year: e.target.value, start_date: '', end_date: '' };
                                    setChartFilter(newF);
                                    fetchChartData(newF);
                                }}
                            >
                                <option value="">All Years</option>
                                <option value="2025">2025</option>
                                <option value="2026">2026</option>
                                <option value="2027">2027</option>
                                <option value="2028">2028</option>
                            </select>
                            <div className="flex flex-wrap sm:flex-nowrap items-center gap-1 border border-gray-200 dark:border-gray-700 rounded px-1 dark:bg-gray-900 focus-within:ring-1 focus-within:ring-blue-500 w-full sm:w-auto mt-2 sm:mt-0">
                                <input
                                    type="date"
                                    className="text-xs p-1 bg-transparent border-none outline-none w-28 text-gray-600 dark:text-gray-300"
                                    value={chartFilter.start_date}
                                    onChange={e => {
                                        const newF = { ...chartFilter, start_date: e.target.value, month: '', year: '' };
                                        setChartFilter(newF);
                                        fetchChartData(newF);
                                    }}
                                />
                                <span className="text-gray-400 text-xs">to</span>
                                <input
                                    type="date"
                                    className="text-xs p-1 bg-transparent border-none outline-none w-28 text-gray-600 dark:text-gray-300"
                                    value={chartFilter.end_date}
                                    onChange={e => {
                                        const newF = { ...chartFilter, end_date: e.target.value, month: '', year: '' };
                                        setChartFilter(newF);
                                        fetchChartData(newF);
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="w-full flex-1 min-h-[300px] sm:min-h-0">
                        {isLoadingChart ? (
                            <div className="flex items-center justify-center h-full">
                                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                            </div>
                        ) : chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        stroke="#9ca3af"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(val) => {
                                            const d = new Date(val);
                                            return `${d.getDate()} ${d.toLocaleString('default', { month: 'short' }).slice(0, 3)}`;
                                        }}
                                    />
                                    <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ backgroundColor: '#1f2937', color: '#fff', borderRadius: '8px', border: 'none' }}
                                        labelFormatter={(label) => new Date(label).toLocaleDateString()}
                                    />
                                    <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">
                                No donation data matches these dates
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Donations - Visible to All */}
                <div className={`${user?.role === 'admin' ? 'lg:col-span-2' : ''} bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 min-w-0 flex flex-col h-full max-h-[420px] relative`}>
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Clock className="w-5 h-5 text-green-500" />
                            Recent Donations
                        </h3>
                        <div className="relative">
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2 text-xs"
                                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                            >
                                <Filter className="w-4 h-4" /> Filter
                            </Button>

                            {/* Filter Dropdown */}
                            {showFilterDropdown && (
                                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-10 p-4">
                                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Sort & Filter</h4>
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-2 gap-2">
                                            <Button
                                                size="sm"
                                                variant={donationFilter.sort_by === 'date' && donationFilter.order === 'desc' ? 'default' : 'outline'}
                                                className="text-xs justify-center"
                                                onClick={() => { setDonationFilter(prev => ({ ...prev, sort_by: 'date', order: 'desc' })) }}
                                            >Newest</Button>
                                            <Button
                                                size="sm"
                                                variant={donationFilter.sort_by === 'date' && donationFilter.order === 'asc' ? 'default' : 'outline'}
                                                className="text-xs justify-center"
                                                onClick={() => { setDonationFilter(prev => ({ ...prev, sort_by: 'date', order: 'asc' })) }}
                                            >Oldest</Button>
                                            <Button
                                                size="sm"
                                                variant={donationFilter.sort_by === 'amount' && donationFilter.order === 'desc' ? 'default' : 'outline'}
                                                className="text-xs justify-center"
                                                onClick={() => { setDonationFilter(prev => ({ ...prev, sort_by: 'amount', order: 'desc' })) }}
                                            >High Amount</Button>
                                            <Button
                                                size="sm"
                                                variant={donationFilter.sort_by === 'amount' && donationFilter.order === 'asc' ? 'default' : 'outline'}
                                                className="text-xs justify-center"
                                                onClick={() => { setDonationFilter(prev => ({ ...prev, sort_by: 'amount', order: 'asc' })) }}
                                            >Low Amount</Button>
                                        </div>

                                        <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                                            <label className="text-xs text-gray-500 mb-1 block">Custom Date Range</label>
                                            <div className="flex flex-col gap-2">
                                                <input
                                                    type="date"
                                                    className="w-full text-xs p-2 rounded border border-gray-200 dark:border-gray-700 dark:bg-gray-900"
                                                    value={donationFilter.start_date}
                                                    onChange={e => setDonationFilter(prev => ({ ...prev, start_date: e.target.value }))}
                                                />
                                                <input
                                                    type="date"
                                                    className="w-full text-xs p-2 rounded border border-gray-200 dark:border-gray-700 dark:bg-gray-900"
                                                    value={donationFilter.end_date}
                                                    onChange={e => setDonationFilter(prev => ({ ...prev, end_date: e.target.value }))}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex gap-2 pt-2">
                                            <Button
                                                size="sm"
                                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                                                onClick={() => applyFilter('sort_by', donationFilter.sort_by)}
                                            >Apply</Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="flex-1"
                                                onClick={() => {
                                                    const resetFilters = { sort_by: 'date', order: 'desc', start_date: '', end_date: '' };
                                                    setDonationFilter(resetFilters);
                                                    setDonationsOffset(0);
                                                    fetchDonations(0, resetFilters);
                                                    setShowFilterDropdown(false);
                                                }}
                                            >Clear</Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                        {isLoadingRecent ? (
                            <div className="flex items-center justify-center p-8">
                                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                            </div>
                        ) : recentDonations.length > 0 ? (
                            recentDonations.map((donation) => (
                                <div key={donation.id} className="flex flex-col p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-gray-100 dark:border-gray-700">
                                    <div className="flex justify-between items-start mb-1">
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate pr-2">
                                            {donation.donor_name}
                                        </p>
                                        <p className="text-sm font-bold text-green-600 dark:text-green-400 whitespace-nowrap">
                                            ₹{donation.amount.toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                                        <span className="bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full capitalize">
                                            {donation.purpose.replace('_', ' ')}
                                        </span>
                                        <span>
                                            {new Date(donation.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500 text-center py-8">No recent donations yet 🕊️</p>
                        )}
                        {recentDonations.length > 0 && hasMoreDonations && (
                            <div className="pt-2 pb-1">
                                <Button
                                    variant="outline"
                                    className="w-full py-2 text-sm text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                    onClick={loadMoreDonations}
                                    disabled={isLoadingMoreDonations}
                                >
                                    {isLoadingMoreDonations ? (
                                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Loading...</>
                                    ) : (
                                        'Load More Donations'
                                    )}
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Pending Requests — Admin Only */}
                {user?.role === 'admin' && (
                    <div className="lg:col-span-5 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 min-w-0 flex flex-col h-full max-h-[600px]">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Pending Requests</h3>
                            <span className="text-sm bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-1 rounded-full font-medium">
                                {pendingMembers.length}
                            </span>
                        </div>
                        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                            {pendingMembers.length > 0 ? (
                                pendingMembers.map((member) => (
                                    <div key={member.id} className="group flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 transition-all hover:shadow-md dark:hover:bg-gray-800/80">
                                        {/* Profile Info */}
                                        <div className="flex items-center gap-4 flex-1 min-w-0 w-full">
                                            <img
                                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(member.full_name)}&background=random&size=48`}
                                                alt={member.full_name}
                                                className="w-12 h-12 rounded-full border-2 border-gray-100 dark:border-gray-700 flex-shrink-0"
                                            />
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">{member.full_name}</h4>
                                                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 whitespace-nowrap">
                                                        {member.village?.name || 'No Village'}
                                                    </span>
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 flex flex-wrap items-center gap-x-2 gap-y-1">
                                                    <span className="truncate">{member.email}</span>
                                                    <span className="hidden sm:inline text-gray-300 dark:text-gray-600">•</span>
                                                    <span>{member.phone_number || 'No Phone'}</span>
                                                    <span className="hidden sm:inline text-gray-300 dark:text-gray-600">•</span>
                                                    <span className="truncate">{member.profession || '—'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Controls */}
                                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full xl:w-auto mt-2 xl:mt-0 pt-3 xl:pt-0 border-t border-gray-100 dark:border-gray-700 xl:border-none shrink-0">
                                            {/* Contextual Input */}
                                            <div className="relative flex-1 sm:w-48 xl:w-56">
                                                <input
                                                    type="text"
                                                    value={expandedMember === member.id ? adminComment : ''}
                                                    onChange={(e) => {
                                                        setExpandedMember(member.id);
                                                        setAdminComment(e.target.value);
                                                    }}
                                                    onFocus={() => {
                                                        if (expandedMember !== member.id) {
                                                            setExpandedMember(member.id);
                                                            setAdminComment('');
                                                        }
                                                    }}
                                                    placeholder="Reason for rejection..."
                                                    className="w-full text-xs px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all text-gray-900 dark:text-white"
                                                />
                                            </div>

                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white font-medium px-4 shadow-sm"
                                                    onClick={() => handleApprove(member.id)}
                                                    disabled={actionId === member.id}
                                                >
                                                    {actionId === member.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-1.5" />}
                                                    Approve
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="flex-1 sm:flex-none border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 font-medium px-4 shadow-none"
                                                    onClick={() => {
                                                        if (expandedMember !== member.id || !adminComment.trim()) {
                                                            alert('Please provide a reason for rejection in the comment box next to the buttons.');
                                                            setExpandedMember(member.id);
                                                        } else {
                                                            handleReject(member.id);
                                                        }
                                                    }}
                                                    disabled={actionId === member.id}
                                                >
                                                    {actionId === member.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4 mr-1.5" />}
                                                    Reject
                                                </Button>
                                            </div>
                                        </div>
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
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 col-start-2 mt-8">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-blue-600" />
                            Village Management
                        </h3>
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-500">{villages.length} villages</span>
                            <Button
                                size="sm"
                                variant={showAddVillageForm ? "outline" : "default"}
                                onClick={() => setShowAddVillageForm(!showAddVillageForm)}
                                className="gap-1 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                            >
                                {showAddVillageForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                {showAddVillageForm ? 'Cancel' : 'Add Village'}
                            </Button>
                        </div>
                    </div>

                    {/* Add Village Form */}
                    {showAddVillageForm && (
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-6 p-3 sm:p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700">
                            <input
                                type="text"
                                placeholder="Village Name"
                                value={newVillage.name}
                                onChange={(e) => setNewVillage(prev => ({ ...prev, name: e.target.value }))}
                                className="flex-1 px-4 py-2.5 sm:py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none text-sm text-gray-900 dark:text-white"
                                autoFocus
                            />
                            <input
                                type="text"
                                placeholder="District"
                                value={newVillage.district}
                                onChange={(e) => setNewVillage(prev => ({ ...prev, district: e.target.value }))}
                                className="flex-1 px-4 py-2.5 sm:py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none text-sm text-gray-900 dark:text-white"
                            />
                            <Button
                                onClick={handleAddVillage}
                                disabled={addingVillage || !newVillage.name || !newVillage.district}
                                className="gap-1 bg-green-600 hover:bg-green-700 whitespace-nowrap justify-center py-2.5 sm:py-2"
                            >
                                {addingVillage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Save Village
                            </Button>
                        </div>
                    )}

                    {/* Villages List */}
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                        {villages.map(village => (
                            <div key={village.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors gap-3">
                                {editingVillageId === village.id ? (
                                    <div className="flex-1 flex flex-col sm:flex-row gap-2">
                                        <input
                                            type="text"
                                            value={editingVillageData.name}
                                            onChange={(e) => setEditingVillageData(prev => ({ ...prev, name: e.target.value }))}
                                            className="flex-1 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                        />
                                        <input
                                            type="text"
                                            value={editingVillageData.district}
                                            onChange={(e) => setEditingVillageData(prev => ({ ...prev, district: e.target.value }))}
                                            className="flex-1 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                        />
                                        <div className="flex items-center gap-1">
                                            <Button size="sm" onClick={handleEditVillage} className="bg-green-600 hover:bg-green-700 px-2 py-1.5">
                                                <Save className="w-4 h-4" />
                                            </Button>
                                            <Button size="sm" variant="outline" onClick={() => setEditingVillageId(null)} className="px-2 py-1.5">
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                                {village.name}
                                            </p>
                                            <p className="text-xs text-gray-500">{village.district} • {village.member_count || 0} members</p>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => {
                                                    setEditingVillageId(village.id);
                                                    setEditingVillageData({ name: village.name, district: village.district });
                                                }}
                                                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            {village.member_count === 0 && (
                                                <button
                                                    onClick={() => handleDeleteVillage(village.id)}
                                                    disabled={deletingVillageId === village.id}
                                                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                                                    title="Delete village"
                                                >
                                                    {deletingVillageId === village.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                                </button>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                        {villages.length === 0 && (
                            <p className="text-sm text-gray-500 text-center py-4">No villages yet. Add one above.</p>
                        )}
                    </div>
                </div>
            )
            }
        </div >
    );
}
