
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { Calendar, Megaphone, ArrowRight } from 'lucide-react';

export default function Home() {
    const [villageCount, setVillageCount] = useState(0);
    const [memberCount, setMemberCount] = useState(0);

    useEffect(() => {
        fetch('http://localhost:8000/villages/')
            .then(res => res.json())
            .then(data => setVillageCount(data.length))
            .catch(err => console.error("Failed to fetch village count:", err));

        fetch('http://localhost:8000/members/')
            .then(res => res.json())
            .then(data => setMemberCount(data.length))
            .catch(err => console.error("Failed to fetch member count:", err));
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-blue-900 to-slate-900 text-white py-24 sm:py-32">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497250681960-ef046c08a56e?q=80&w=2574&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className='text-3xl font-gujarati'>શ્રી દંઢાવ્ય પરગણા સતવારા કડિયા કેળવણી ઉત્તેજક મંડળ</h2>
                        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6">
                            <span className="text-blue-400">{villageCount} </span>ગામોનું સશક્તિકરણ
                        </h1>
                        <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto mb-10">
                            Uniting {memberCount}+ members under one digital roof. Join us in building a stronger, more connected community.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button size="lg" className="bg-blue-500 hover:bg-blue-600 text-lg px-8 py-3">
                                Become a Member
                            </Button>
                            <Button variant="outline" className="text-white border-white hover:bg-white/10 text-lg px-8 py-3">
                                Explore Directory
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Live Updates Ticker */}
            <div className="bg-yellow-500 text-black py-2 overflow-hidden whitespace-nowrap relative">
                <div className="animate-marquee inline-block font-bold">
                    📢 Annual General Meeting scheduled for March 15th at Community Hall  •  🎉 Congratulations to Village-A for achieving 100% literacy rate!  •  🌧️ Weather Alert: Heavy rains expected this weekend, stay safe!
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Leadership Card */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden col-span-1 lg:col-span-1 border border-gray-100 dark:border-gray-700"
                >
                    <div className="h-32 bg-blue-600"></div>
                    <div className="px-6 pb-6 -mt-16 flex flex-col items-center text-center">
                        <img
                            src="https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=2574&auto=format&fit=crop"
                            alt="Minister"
                            className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 object-cover shadow-md"
                        />
                        <h3 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">Hon. Minister Sharma</h3>
                        <p className="text-blue-600 font-medium">Community Leader</p>
                        <p className="mt-4 text-gray-600 dark:text-gray-300 text-sm italic">
                            "Together we build the foundation of a prosperous future. Every member counts, every village matters."
                        </p>
                    </div>
                </motion.div>

                {/* Bento Grid Features */}
                <div className="col-span-1 lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 flex flex-col justify-between hover:shadow-xl transition-shadow">
                        <div>
                            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg w-fit mb-4">
                                <Megaphone className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Latest Announcements</h3>
                            <p className="text-gray-600 dark:text-gray-400">Stay updated with the latest news, events, and community guidelines.</p>
                        </div>
                        <a href="#" className="mt-4 text-blue-600 font-medium flex items-center hover:underline">View all <ArrowRight className="w-4 h-4 ml-1" /></a>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 flex flex-col justify-between hover:shadow-xl transition-shadow">
                        <div>
                            <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg w-fit mb-4">
                                <Calendar className="w-6 h-6 text-green-600 dark:text-green-400" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Upcoming Events</h3>
                            <p className="text-gray-600 dark:text-gray-400">Join us for cultural festivals, sports meets, and social gatherings.</p>
                        </div>
                        <a href="#" className="mt-4 text-green-600 font-medium flex items-center hover:underline">Check Calendar <ArrowRight className="w-4 h-4 ml-1" /></a>
                    </div>

                    <div className="bg-indigo-600 p-6 rounded-2xl shadow-lg md:col-span-2 text-white flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="text-2xl font-bold mb-2">Support Your Community</h3>
                            <p className="text-indigo-100 mb-4 max-w-md">Your contributions help us maintain facilities, organize events, and support those in need.</p>
                            <Button variant="secondary" className="bg-white text-indigo-600 hover:bg-indigo-50">Donate Now</Button>
                        </div>
                        <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
