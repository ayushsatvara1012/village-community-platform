import { useState, useEffect } from 'react';
import { MapPin, Loader2, Search } from 'lucide-react';

export default function Villages() {
    const [villages, setVillages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchVillages();
    }, []);

    const fetchVillages = () => {
        setLoading(true);
        fetch('http://127.0.0.1:8000/villages/')
            .then(res => res.json())
            .then(data => {
                // Sort alphabetically by name
                const sorted = data.sort((a, b) => a.name.localeCompare(b.name));
                setVillages(sorted);
            })
            .catch(err => console.error("Failed to fetch villages:", err))
            .finally(() => setLoading(false));
    };

    const filteredVillages = villages.filter(v =>
        v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (v.district && v.district.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="bg-gray-50 dark:bg-gray-950 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">
                        Community Directory
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Explore the network of villages affiliated with our community across regions.
                    </p>
                </div>

                {/* Search Bar */}
                <div className="max-w-xl mx-auto mb-10 relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-11 pr-4 py-3 border border-gray-200 dark:border-gray-800 rounded-2xl leading-5 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-shadow shadow-sm"
                        placeholder="Search for a village or district..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                        {filteredVillages.map((village) => {
                            const initial = village.name ? village.name.charAt(0).toUpperCase() : '?';

                            return (
                                <div
                                    key={village.id}
                                    className="relative overflow-hidden bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-300 group flex flex-col justify-center min-h-[140px] p-5"
                                >
                                    {/* Giant background initial overflowing the card */}
                                    <div className="absolute -bottom-6 -right-4 text-9xl font-black text-gray-50 dark:text-gray-800/50 select-none z-0 transform group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-500">
                                        {initial}
                                    </div>

                                    {/* Content layer */}
                                    <div className="relative z-10">
                                        <h3 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100 font-gujarati mb-1">
                                            {village.name}
                                        </h3>
                                        {village.district && (
                                            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 font-medium">
                                                <MapPin className="w-3 h-3 mr-1 opacity-70" />
                                                <span>{village.district}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {!loading && filteredVillages.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-gray-500 dark:text-gray-400 text-lg">No villages found matching "{searchQuery}".</p>
                    </div>
                )}
            </div>
        </div>
    );
}
