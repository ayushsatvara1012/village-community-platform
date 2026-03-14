import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useState } from 'react';
import { Button } from '../components/ui/Button';
import { IndianRupee, Users, TrendingUp, Download, CheckCircle, XCircle, Clock, Loader2, MapPin, Plus, Trash2, Edit2, Save, X, ChevronDown, ChevronUp, MessageSquare, Filter } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import { DashboardSkeleton, StatsCardSkeleton } from '../components/skeletons/DashboardSkeletons';
import { initialsUrl } from '../utils/avatar';
import { useVillages, useAddVillage, useUpdateVillage, useDeleteVillage } from '../hooks/useVillages';
import { useMembers, usePendingMembers, useApproveMember, useRejectMember } from '../hooks/useMembers';
import { useStats, useChartData, useDonations } from '../hooks/usePayments';

export default function Dashboard() {
    const { user } = useAuth();
    const token = localStorage.getItem('village_app_token');

    // UI States
    const [expandedMember, setExpandedMember] = useState(null);
    const [adminComment, setAdminComment] = useState('');
    const [newVillage, setNewVillage] = useState({ name: '', district: '' });
    const [showAddVillageForm, setShowAddVillageForm] = useState(false);
    const [editingVillageId, setEditingVillageId] = useState(null);
    const [editingVillageData, setEditingVillageData] = useState({ name: '', district: '' });
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);

    // Filter States
    const [donationFilter, setDonationFilter] = useState({ sort_by: 'date', order: 'desc', start_date: '', end_date: '' });
    const [chartFilter, setChartFilter] = useState({ start_date: '', end_date: '', month: '', year: new Date().getFullYear().toString() });

    // Queries
    const { data: villages = [], isLoading: isLoadingVillages } = useVillages();
    const { data: memberData = [], isLoading: isLoadingMembers } = useMembers();
    const { data: stats = { total_collection: 0, current_balance: 0, top_donor: 'N/A' }, isLoading: isLoadingStats } = useStats();
    const { data: chartData = [], isLoading: isLoadingChart } = useChartData(chartFilter);
    const {
        data: donationsData,
        isLoading: isLoadingRecent,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage: isLoadingMoreDonations
    } = useDonations(donationFilter);
    const { data: pendingMembers = [], isLoading: isLoadingPending } = usePendingMembers(user?.role === 'admin');

    // Mutations
    const approveMutation = useApproveMember();
    const rejectMutation = useRejectMember();
    const addVillageMutation = useAddVillage();
    const updateVillageMutation = useUpdateVillage();
    const deleteVillageMutation = useDeleteVillage();

    const memberCount = Array.isArray(memberData) ? memberData.length : 0;
    const villageCount = villages.length;
    const recentDonations = donationsData?.pages.flat() || [];

    const applyFilter = (key, val) => {
        const newFilters = { ...donationFilter, [key]: val };
        setDonationFilter(newFilters);
        setShowFilterDropdown(false);
    };

    const loadMoreDonations = () => {
        fetchNextPage();
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        try {
            const cleanDate = dateStr.split('T')[0];
            const parts = cleanDate.split('-');
            if (parts.length === 3) {
                const [y, m, d] = parts;
                return `${d}/${m}/${y}`;
            }
            return dateStr;
        } catch (e) {
            return dateStr;
        }
    };

    if (isLoadingStats || isLoadingVillages || isLoadingMembers || (user?.role === 'admin' && isLoadingPending)) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
                <DashboardSkeleton isAdmin={user?.role === 'admin'} />
            </div>
        );
    }

    const handleApprove = async (memberId) => {
        try {
            await approveMutation.mutateAsync({ memberId, comment: adminComment });
            setExpandedMember(null);
            setAdminComment('');
        } catch (err) {
            alert(err.message);
        }
    };

    const handleReject = async (memberId) => {
        if (!adminComment.trim()) {
            alert('Please provide a reason for rejection');
            return;
        }
        try {
            await rejectMutation.mutateAsync({ memberId, comment: adminComment });
            setExpandedMember(null);
            setAdminComment('');
        } catch (err) {
            alert(err.message);
        }
    };

    const handleAddVillage = async () => {
        if (!newVillage.name || !newVillage.district) return;
        try {
            await addVillageMutation.mutateAsync(newVillage);
            setNewVillage({ name: '', district: '' });
            setShowAddVillageForm(false);
        } catch (err) {
            alert(err.message);
        }
    };

    const handleEditVillage = async () => {
        if (!editingVillageData.name || !editingVillageData.district) return;
        try {
            await updateVillageMutation.mutateAsync({ id: editingVillageId, data: editingVillageData });
            setEditingVillageId(null);
        } catch (err) {
            alert(err.message);
        }
    };

    const handleDeleteVillage = async (villageId) => {
        if (!confirm('Delete this village?')) return;
        try {
            await deleteVillageMutation.mutateAsync(villageId);
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div className="px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                    <p className="text-gray-500 dark:text-gray-400">Welcome back, {user?.full_name || 'User'}.</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Total Collection */}
                <div className="relative overflow-hidden bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 group hover:shadow-md transition-shadow">
                    <div className="absolute -right-2 -bottom-10 text-green-600/10 dark:text-green-400/10 group-hover:scale-110 transition-transform duration-500">
                        <IndianRupee size={160} strokeWidth={1} />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Collection</h3>
                        </div>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            ₹{stats.total_collection.toLocaleString()}
                            <span className="text-[10px] text-green-600 dark:text-green-400 font-bold bg-green-50 dark:bg-green-900/40 px-2 py-0.5 rounded-full border border-green-100 dark:border-green-800">LIVE</span>
                        </p>
                    </div>
                </div>

                {/* Total Members */}
                <div className="relative overflow-hidden bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 group hover:shadow-md transition-shadow">
                    <div className="absolute -right-2 -bottom-10 text-blue-600/10 dark:text-blue-400/10 group-hover:scale-110 transition-transform duration-500">
                        <Users size={160} strokeWidth={1} />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Members</h3>
                        </div>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">{memberCount.toLocaleString()}</p>
                    </div>
                </div>

                {/* Villages */}
                <div className="relative overflow-hidden bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 group hover:shadow-md transition-shadow">
                    <div className="absolute -right-2 -bottom-10 text-purple-600/10 dark:text-purple-400/10 group-hover:scale-110 transition-transform duration-500">
                        <MapPin size={160} strokeWidth={1} />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Villages</h3>
                        </div>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">{villageCount.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            <div className={`grid grid-cols-1 ${user?.role === 'admin' ? 'lg:grid-cols-5' : 'lg:grid-cols-1'} gap-6 sm:gap-8`}>
                {/* Chart */}
                <div className={`${user?.role === 'admin' ? 'lg:col-span-3' : ''} min-w-0 bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col h-[400px] sm:h-[420px]`}>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4 shrink-0">
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
                                <option value="1">Jan</option>
                                <option value="2">Feb</option>
                                <option value="3">Mar</option>
                                <option value="4">Apr</option>
                                <option value="5">May</option>
                                <option value="6">Jun</option>
                                <option value="7">Jul</option>
                                <option value="8">Aug</option>
                                <option value="9">Sep</option>
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
                    <div className="w-full flex-1 min-h-0">
                        {isLoadingChart ? (
                            <div className="flex items-center justify-center h-full">
                                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                            </div>
                        ) : chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorOverall" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorPersonal" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} strokeOpacity={0.5} />
                                    <XAxis
                                        dataKey="timestamp"
                                        stroke="#9ca3af"
                                        fontSize={10}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(val) => {
                                            const d = new Date(val);
                                            return `${d.getDate()} ${d.toLocaleString('default', { month: 'short' }).slice(0, 3)}`;
                                        }}
                                        minTickGap={30}
                                    />
                                    <YAxis
                                        stroke="#9ca3af"
                                        fontSize={10}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `₹${value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value}`}
                                    />
                                    <Tooltip
                                        content={({ active, payload, label }) => {
                                            if (active && payload && payload.length) {
                                                const data = payload[0].payload;
                                                return (
                                                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 rounded-xl shadow-xl backdrop-blur-md bg-opacity-95 dark:bg-opacity-95 min-w-[200px]">
                                                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 border-b border-gray-100 dark:border-gray-700 pb-1 flex justify-between">
                                                            <span>{new Date(label).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                                            <span className="opacity-50 font-normal">{new Date(label).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                        </p>

                                                        <div className="space-y-2">
                                                            <div className="flex flex-col">
                                                                <div className="flex justify-between items-center text-[10px] text-blue-500 font-bold uppercase tracking-wider mb-0.5">
                                                                    <span>Overall Status</span>
                                                                </div>
                                                                <div className="flex justify-between items-end">
                                                                    <span className="text-[9px] text-gray-400 italic">This Donation:</span>
                                                                    <span className="text-xs font-bold text-gray-900 dark:text-white">₹{data.donation_amount.toLocaleString()}</span>
                                                                </div>
                                                                <div className="flex justify-between items-end mt-0.5">
                                                                    <span className="text-[9px] text-gray-400 italic">Total Collection:</span>
                                                                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">₹{data.amount.toLocaleString()}</span>
                                                                </div>
                                                            </div>

                                                            <div className="flex flex-col border-t border-gray-50 dark:border-gray-700 pt-1.5">
                                                                <div className="flex justify-between items-center text-[10px] text-green-500 font-bold uppercase tracking-wider mb-0.5">
                                                                    <span>Personal Status</span>
                                                                </div>
                                                                <div className="flex justify-between items-end">
                                                                    <span className="text-[9px] text-gray-400 italic">My Contribution:</span>
                                                                    <span className="text-xs font-bold text-green-600 dark:text-green-400">₹{data.personal_amount.toLocaleString()}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Legend
                                        verticalAlign="top"
                                        align="right"
                                        height={36}
                                        iconType="circle"
                                        wrapperStyle={{ fontSize: '10px', paddingBottom: '10px' }}
                                        formatter={(value) => value === 'amount' ? 'Total Collection' : 'My Total Donations'}
                                    />
                                    <Area
                                        name="amount"
                                        type="monotone"
                                        dataKey="amount"
                                        stroke="#3b82f6"
                                        strokeWidth={3}
                                        fill="url(#colorOverall)"
                                        animationDuration={1500}
                                        activeDot={{ r: 4, strokeWidth: 0 }}
                                    />
                                    <Area
                                        name="personal_amount"
                                        type="monotone"
                                        dataKey="personal_amount"
                                        stroke="#10b981"
                                        strokeWidth={3}
                                        fill="url(#colorPersonal)"
                                        animationDuration={1500}
                                        activeDot={{ r: 4, strokeWidth: 0 }}
                                    />
                                </AreaChart>
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
                                                    value={donationFilter.start_date || ''}
                                                    onChange={e => setDonationFilter(prev => ({ ...prev, start_date: e.target.value }))}
                                                />
                                                <input
                                                    type="date"
                                                    className="w-full text-xs p-2 rounded border border-gray-200 dark:border-gray-700 dark:bg-gray-900"
                                                    value={donationFilter.end_date || ''}
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
                                        <div className="flex items-center gap-2">
                                            <a
                                                href={`${API_URL}/payments/${donation.id}/receipt`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline font-medium"
                                                title="Download Receipt"
                                            >
                                                <Download className="w-3 h-3" />
                                                <span>Receipt</span>
                                            </a>
                                            <span className="text-gray-300 dark:text-gray-600">•</span>
                                            <span>
                                                {new Date(donation.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500 text-center py-8">No recent donations yet 🕊️</p>
                        )}
                        {recentDonations.length > 0 && hasNextPage && (
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
                                                src={initialsUrl(member.full_name)}
                                                alt={member.full_name}
                                                className="w-12 h-12 rounded-full border-2 border-gray-100 dark:border-gray-700 shrink-0"
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
                                                    <span className="hidden sm:inline text-gray-300 dark:text-gray-600">•</span>
                                                    <span className="truncate">{formatDate(member.date_of_birth)}</span>
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
                                                    disabled={approveMutation.isPending && approveMutation.variables?.memberId === member.id}
                                                >
                                                    {approveMutation.isPending && approveMutation.variables?.memberId === member.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-1.5" />}
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
                                                    disabled={rejectMutation.isPending && rejectMutation.variables?.memberId === member.id}
                                                >
                                                    {rejectMutation.isPending && rejectMutation.variables?.memberId === member.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4 mr-1.5" />}
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
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                            Village Management
                        </h3>
                        <div className="flex items-center gap-2 sm:gap-3">
                            <span className="hidden sm:inline text-sm text-gray-500">{villages.length} villages</span>
                            <Button
                                size="sm"
                                variant={showAddVillageForm ? "outline" : "default"}
                                onClick={() => setShowAddVillageForm(!showAddVillageForm)}
                                className="px-2 sm:px-3 gap-1 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                            >
                                {showAddVillageForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                <span className="hidden sm:inline">{showAddVillageForm ? 'Cancel' : 'Add Village'}</span>
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
                            <div key={village.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors gap-3">
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
                                                    disabled={deleteVillageMutation.isPending && deleteVillageMutation.variables === village.id}
                                                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                                                    title="Delete village"
                                                >
                                                    {deleteVillageMutation.isPending && deleteVillageMutation.variables === village.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
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
