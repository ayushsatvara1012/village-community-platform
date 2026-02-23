import { useState, useEffect } from 'react';
import { Search, MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Members() {
    const [selectedVillage, setSelectedVillage] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [members, setMembers] = useState([]);
    const [villages, setVillages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('village_app_token');
            const [membersRes, villagesRes] = await Promise.all([
                fetch('http://127.0.0.1:8000/members/', {
                    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                }),
                fetch('http://127.0.0.1:8000/villages/')
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

    const filteredMembers = members.filter((member) => {
        const matchesVillage = selectedVillage ? member.village_id === selectedVillage : true;
        const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (member.profession && member.profession.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesVillage && matchesSearch;
    });

    if (loading) {
        return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
    }

    return (
        <div className="flex flex-col md:flex-row min-h-[calc(100vh-64px)] bg-gray-50 dark:bg-gray-900">
            {/* Sidebar - Village List */}
            <aside className="w-full md:w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 md:h-[calc(100vh-64px)] md:sticky md:top-16 md:overflow-y-auto shrink-0">
                <div
                    className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center cursor-pointer md:cursor-auto bg-gray-50/50 dark:bg-gray-900/50 md:bg-transparent"
                    onClick={() => {
                        if (window.innerWidth < 768) {
                            setIsSidebarOpen(!isSidebarOpen);
                        }
                    }}
                >
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Villages ({villages.length})</h2>
                    <div className="md:hidden text-gray-500">
                        {isSidebarOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                </div>

                <div className={`${isSidebarOpen ? 'block' : 'hidden'} md:block transition-all duration-300`}>
                    <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                        <button
                            onClick={() => { setSelectedVillage(null); setIsSidebarOpen(false); }}
                            className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${!selectedVillage ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}`}
                        >
                            All Villages
                        </button>
                    </div>
                    <div className="p-2 space-y-1 max-h-64 overflow-y-auto md:max-h-none">
                        {villages.map((village) => (
                            <button
                                key={village.id}
                                onClick={() => { setSelectedVillage(village.id); setIsSidebarOpen(false); }}
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
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-8">
                <div className="max-w-6xl mx-auto">
                    {/* Header & Search */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {selectedVillage
                                    ? villages.find(v => v.id === selectedVillage)?.name
                                    : 'All Members'}
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400">Showing {filteredMembers.length} members</p>
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

                    {/* Members Grid */}
                    {filteredMembers.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredMembers.map((member) => (
                                <Link
                                    to={`/members/${member.id}`}
                                    key={member.id}
                                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all transform hover:-translate-y-1 block cursor-pointer"
                                >
                                    <div className="h-24 bg-linear-to-r from-blue-400 to-indigo-500"></div>
                                    <div className="px-5 pb-5 -mt-12 flex flex-col items-center">
                                        <img
                                            src={member.photo}
                                            alt={member.name}
                                            className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-800 object-cover bg-gray-200"
                                        />
                                        <h3 className="mt-3 font-semibold text-lg text-gray-900 dark:text-white text-center">{member.name}</h3>
                                        <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">{member.profession}</p>

                                        <div className="mt-4 w-full flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 py-2 rounded-lg">
                                            <MapPin className="w-4 h-4" />
                                            <span className="truncate max-w-[120px]">
                                                {villages.find(v => v.id === member.village_id)?.name || 'Unknown Village'}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
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
