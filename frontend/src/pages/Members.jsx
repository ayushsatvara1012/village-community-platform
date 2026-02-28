import { useState, useEffect } from 'react';
import { Search, MapPin, ChevronDown, ChevronUp, Briefcase, Edit2, Check, X, Loader2, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Members() {
    const [selectedVillage, setSelectedVillage] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [members, setMembers] = useState([]);
    const [villages, setVillages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { user: currentUser } = useAuth();
    const [editingPosition, setEditingPosition] = useState(null);
    const [selectedPosition, setSelectedPosition] = useState(null);
    const [newPosition, setNewPosition] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('village_app_token');
            const [membersRes, villagesRes] = await Promise.all([
                fetch((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://127.0.0.1:8000' : 'https://village-community-platform.onrender.com') + '/members/', {
                    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                }),
                fetch((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://127.0.0.1:8000' : 'https://village-community-platform.onrender.com') + '/villages/')
            ]);

            if (membersRes.ok && villagesRes.ok) {
                const membersData = await membersRes.json();
                const villagesData = await villagesRes.json();

                // Enhance members data with UI avatar if photo is missing
                const enhancedMembers = membersData.map(member => ({
                    ...member,
                    name: member.full_name, // Map full_name to name
                    photo: `https://ui-avatars.com/api/?name=${encodeURIComponent(member.full_name)}&background=random`,
                    profession: member.profession || 'Member' // Fallback
                }));

                // Calculate member counts for villages locally for now
                const villageCounts = {};
                enhancedMembers.forEach(m => {
                    if (m.village_id) {
                        villageCounts[m.village_id] = (villageCounts[m.village_id] || 0) + 1;
                    }
                });

                const enhancedVillages = villagesData.map(v => ({
                    ...v,
                    member_count: villageCounts[v.id] || 0
                }));

                setMembers(enhancedMembers);
                setVillages(enhancedVillages);
            }
        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePosition = async (memberId) => {
        try {
            setIsUpdating(true);
            const token = localStorage.getItem('village_app_token');
            const res = await fetch(((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://127.0.0.1:8000' : 'https://village-community-platform.onrender.com') + `/members/${memberId}/position`), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ position: newPosition })
            });

            if (res.ok) {
                const updatedUser = await res.json();
                setMembers(prev => prev.map(m => m.id === memberId ? { ...m, position: updatedUser.position } : m));
                setEditingPosition(null);
            }
        } catch (error) {
            console.error("Failed to update position:", error);
        } finally {
            setIsUpdating(false);
        }
    };

    const uniquePositions = [...new Set(members.filter(m => m.position).map(m => m.position))].sort();

    // selectedPosition: null = all members (initial), 'ALL_POSITIONS' = members with any position, or a specific position string
    const filteredMembers = members.filter((member) => {
        const matchesVillage = selectedVillage ? member.village_id === selectedVillage : true;
        let matchesPosition = true;
        if (selectedPosition === 'ALL_POSITIONS') {
            matchesPosition = !!member.position; // only members with any position
        } else if (selectedPosition) {
            matchesPosition = member.position === selectedPosition;
        }
        const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (member.profession && member.profession.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesVillage && matchesSearch && matchesPosition;
    });

    if (loading) {
        return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
    }

    return (
        <div className="flex flex-col lg:flex-row min-h-[calc(100vh-64px)] bg-gray-50 dark:bg-gray-900">
            {/* Sidebar - Village List */}
            <aside className="w-full lg:w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 lg:h-[calc(100vh-64px)] lg:sticky lg:top-16 lg:overflow-y-auto shrink-0 transition-all duration-300">
                <div
                    className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center cursor-pointer lg:cursor-auto bg-gray-50/50 dark:bg-gray-900/50 lg:bg-transparent"
                    onClick={() => {
                        if (window.innerWidth < 1024) {
                            setIsSidebarOpen(!isSidebarOpen);
                        }
                    }}
                >
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Villages ({villages.length})</h2>
                    <div className="lg:hidden text-gray-500">
                        {isSidebarOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                </div>

                <div className={`${isSidebarOpen ? 'block' : 'hidden'} lg:block transition-all duration-300`}>
                    <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                        <button
                            onClick={() => { setSelectedVillage(null); setSelectedPosition(null); setIsSidebarOpen(false); }}
                            className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${!selectedVillage && selectedPosition === null
                                ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                                }`}
                        >
                            All Villages
                        </button>
                    </div>
                    <div className="p-2 space-y-1 max-h-64 overflow-y-auto lg:max-h-none">
                        {villages.map((village) => (
                            <button
                                key={village.id}
                                onClick={() => { setSelectedVillage(village.id); setSelectedPosition(null); setIsSidebarOpen(false); }}
                                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex justify-between items-center ${selectedVillage === village.id
                                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                                    }`}
                            >
                                <span className="truncate flex-1">{village.name}</span>
                                <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full text-gray-500 dark:text-gray-400 ml-2">
                                    {village.member_count}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Main Body - Position Sorting/Filtering */}
                    <div className="mt-4 border-t border-gray-100 dark:border-gray-700">
                        <div className="p-4 bg-gray-50/50 dark:bg-gray-900/50">
                            <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                                <Briefcase className="w-4 h-4 text-blue-600" />
                                Main body
                            </h2>
                            <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-tighter">Official Positions</p>
                        </div>
                        <div className="p-2 space-y-1">
                            <button
                                onClick={() => { setSelectedPosition('ALL_POSITIONS'); setSelectedVillage(null); setIsSidebarOpen(false); }}
                                className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${selectedPosition === 'ALL_POSITIONS'
                                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                                    }`}
                            >
                                All Positions
                            </button>
                            {uniquePositions.map((pos) => (
                                <button
                                    key={pos}
                                    onClick={() => { setSelectedPosition(pos); setSelectedVillage(null); setIsSidebarOpen(false); }}
                                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex justify-between items-center ${selectedPosition === pos
                                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                        : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    <span className="truncate flex-1">{pos}</span>
                                    <span className="text-xs bg-blue-100 dark:bg-blue-900/50 px-2 py-0.5 rounded-full text-blue-600 dark:text-blue-400 ml-2 font-bold">
                                        {members.filter(m => m.position === pos).length}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-6 lg:p-10 transition-all duration-300">
                <div className="max-w-7xl mx-auto">
                    {/* Header & Search */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {selectedPosition === 'ALL_POSITIONS'
                                    ? 'Main Body'
                                    : selectedPosition
                                        ? selectedPosition
                                        : selectedVillage
                                            ? villages.find(v => v.id === selectedVillage)?.name
                                            : 'All Members'}
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">
                                {selectedPosition === 'ALL_POSITIONS'
                                    ? `${filteredMembers.length} members with official positions`
                                    : `Showing ${filteredMembers.length} members`}
                            </p>
                        </div>
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name or profession..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Members Grid - Column on laptop, Row on mobile/tablet */}
                    {filteredMembers.length > 0 ? (
                        <div className="flex flex-col gap-3 lg:grid lg:grid-cols-3 xl:grid-cols-4 lg:gap-6">
                            {filteredMembers.map((member) => (
                                <div
                                    key={member.id}
                                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all transform hover:-translate-y-0.5 relative group/card"
                                >
                                    {/* --- Mobile/Tablet: Horizontal Row Layout --- */}
                                    <div className="lg:hidden">
                                        <Link to={`/members/${member.id}`} className="flex items-center gap-4 p-3 pr-12">
                                            <img
                                                src={member.photo}
                                                alt={member.name}
                                                className="w-14 h-14 rounded-full border-2 border-white dark:border-gray-700 object-cover bg-gray-200 shadow-md shrink-0"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-base text-gray-900 dark:text-white truncate">{member.name}</h3>
                                                {member.position ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 mt-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-[10px] font-black uppercase tracking-wider border border-blue-200 dark:border-blue-800">
                                                        <ShieldCheck className="w-2.5 h-2.5" />
                                                        {member.position}
                                                    </span>
                                                ) : (
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{member.profession}</p>
                                                )}
                                                <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-400 dark:text-gray-500">
                                                    <MapPin className="w-3 h-3" />
                                                    <span className="truncate">{villages.find(v => v.id === member.village_id)?.name || 'Unknown Village'}</span>
                                                </div>
                                            </div>
                                        </Link>
                                    </div>

                                    {/* --- Laptop+: Vertical Column Card Layout --- */}
                                    <div className="hidden lg:block">
                                        <Link to={`/members/${member.id}`} className="block">
                                            <div className="h-24 bg-linear-to-r from-blue-400 to-indigo-500"></div>
                                            <div className="px-5 pb-5 -mt-12 flex flex-col items-center">
                                                <img
                                                    src={member.photo}
                                                    alt={member.name}
                                                    className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-800 object-cover bg-gray-200 shadow-md"
                                                />
                                                <div className="mt-3 flex flex-col items-center gap-1 w-full text-center">
                                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white truncate w-full">{member.name}</h3>
                                                    {member.position ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-[10px] font-black uppercase tracking-wider border border-blue-200 dark:border-blue-800">
                                                            <ShieldCheck className="w-3 h-3" />
                                                            {member.position}
                                                        </span>
                                                    ) : (
                                                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{member.profession}</p>
                                                    )}
                                                </div>
                                                <div className="mt-4 w-full flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 py-2 rounded-lg border border-transparent group-hover/card:border-gray-200 dark:group-hover/card:border-gray-700 transition-colors">
                                                    <MapPin className="w-4 h-4" />
                                                    <span className="truncate max-w-[120px]">{villages.find(v => v.id === member.village_id)?.name || 'Unknown Village'}</span>
                                                </div>
                                            </div>
                                        </Link>
                                    </div>

                                    {/* Admin Position Quick Edit */}
                                    {currentUser?.role === 'admin' && (
                                        <div className="absolute top-2 right-2 z-10">
                                            {editingPosition === member.id ? (
                                                <div className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-xl border border-blue-200 dark:border-blue-800 flex items-center gap-2 animate-in fade-in zoom-in duration-200">
                                                    <input
                                                        type="text"
                                                        value={newPosition}
                                                        onChange={(e) => setNewPosition(e.target.value)}
                                                        className="w-28 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                                                        placeholder="Enter position..."
                                                        autoFocus
                                                    />
                                                    <button
                                                        onClick={() => handleUpdatePosition(member.id)}
                                                        disabled={isUpdating}
                                                        className="p-1.5 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors disabled:opacity-50"
                                                    >
                                                        {isUpdating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingPosition(null)}
                                                        className="p-1.5 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        setEditingPosition(member.id);
                                                        setNewPosition(member.position || '');
                                                    }}
                                                    title="Assign Position"
                                                    className="p-2 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-lg border border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 transition-all opacity-100 lg:opacity-0 lg:group-hover/card:opacity-100 backdrop-blur-sm"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">No members found</h3>
                            <p className="text-gray-500 dark:text-gray-400 mt-1">Try adjusting your search or filters.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
