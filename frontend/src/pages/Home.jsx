
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { Calendar, Megaphone, ArrowRight, BookOpen, Heart, Users, Trophy, HandHeart, Sparkles } from 'lucide-react';
import { Footer } from '../components/layout/Footer';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';

export default function Home() {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    // Optimistic initial values — hero renders immediately with placeholders.
    // Real counts fill in when API responds (no blocking gate).
    const [villageCount, setVillageCount] = useState('...');
    const [memberCount, setMemberCount] = useState('...');

    useEffect(() => {
        fetch(`${API_URL}/villages/`)
            .then(res => res.json())
            .then(data => setVillageCount(data.length))
            .catch(err => console.error("Failed to fetch village count:", err));

        fetch(`${API_URL}/members/`)
            .then(res => res.json())
            .then(data => setMemberCount(data.length))
            .catch(err => console.error("Failed to fetch member count:", err));
        // No image preloading — CSS background images don't block rendering.
        // The /bg-sat.webp LCP preload hint is now in index.html <head>.
    }, []);

    // Hero renders immediately — no blocking FullScreenLoader gate.


    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-blue-900 to-slate-900 text-white py-16 sm:py-24 md:py-32">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497250681960-ef046c08a56e?q=80&w=2574&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className='text-3xl mb-5 tracking-wide  font-gujarati'>શ્રી સથવારા કડિયા <span className='text-orange-500'>પ્રગતિ મંડળ</span> , અમદાવાદ</h2>
                        <h1 className="text-4xl leading sm:text-6xl font-bold font-gujarati tracking-tight mb-6">
                            <span className="text-blue-400">{villageCount} </span>ગામોનું અમદાવાદ-ગાંધીનગર રહેવાસીઓનું સશક્તિકરણ
                        </h1>
                        <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto mb-10">
                            Uniting {memberCount}+ members under one digital roof. Join us in building a stronger, more connected community.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            {user?.status === 'member' ? (
                                <Button
                                    size="lg"
                                    className="bg-blue-500 hover:bg-blue-600 text-lg px-8 py-3"
                                    onClick={() => navigate('/villages')}
                                >
                                    Explore Directory
                                </Button>
                            ) : (
                                <>
                                    <Button
                                        size="lg"
                                        className="bg-blue-500 hover:bg-blue-600 text-lg px-8 py-3"
                                        onClick={() => {
                                            if (!isAuthenticated) {
                                                navigate('/register');
                                            } else if (user.status === 'pending') {
                                                navigate('/apply');
                                            } else if (user.status === 'approved') {
                                                navigate('/pay');
                                            }
                                        }}
                                    >
                                        Become a Member
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="text-white border-white hover:bg-white/10 text-lg px-8 py-3"
                                        onClick={() => navigate('/villages')}
                                    >
                                        Explore Directory
                                    </Button>
                                </>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Live Updates Ticker */}
            <div className="bg-orange-500 text-white py-2 overflow-hidden whitespace-nowrap relative">
                <div className="animate-marquee inline-block font-bold">
                    📢 Annual General Meeting scheduled for March 15th at Community Hall  •  🎉 Congratulations to Village-A for achieving 100% literacy rate!  •  🌧️ Weather Alert: Heavy rains expected this weekend, stay safe!
                </div>
            </div>

            {/* Community History Section */}
            <section className="py-20 bg-white dark:bg-gray-950 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col lg:flex-row items-center gap-12">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="lg:w-1/2"
                        >
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-sm font-semibold mb-6">
                                <BookOpen className="w-4 h-4" />
                                Our Heritage
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6 font-gujarati">
                                સથવારા સમાજ અને તેનો ભવ્ય ઈતિહાસ
                            </h2>
                            <div className="space-y-4 text-gray-600 dark:text-gray-400 leading-relaxed">
                                <p className='font-gujarati text-lg'>
                                    સથવારા સમુદાય, જેને સતવારા કડિયા તરીકે પણ ઓળખવામાં આવે છે, તે ગુજરાતમાં સમૃદ્ધ સાંસ્કૃતિક અને સ્થાપત્ય વારસો ધરાવે છે. પરંપરાગત રીતે પથ્થરકામ અને ચણતરમાં તેમની અસાધારણ કારીગરી માટે જાણીતા, આ સમુદાયે આપણા પ્રદેશમાં કેટલીક સૌથી પ્રતિષ્ઠિત રચનાઓના નિર્માણમાં મુખ્ય ભૂમિકા ભજવી છે.
                                </p>
                                <p className='font-gujarati text-lg'>
                                    સદીઓથી આપણા પૂર્વજો આ પ્રદેશના વિકાસની કરોડરજ્જુ હતા. આજે, જ્યારે આપણે આપણા પરંપરાગત મૂળનું સન્માન કરીએ છીએ, ત્યારે આપણો સમુદાય વ્યાવસાયિકો, ઉદ્યોગસાહસિકો અને વિદ્વાનોના વિવિધ જૂથમાં વિકસિત થયો છે જેઓ આપણા સાંસ્કૃતિક મૂલ્યો અને એકતા જાળવી રાખીને રાષ્ટ્રના વિકાસમાં યોગદાન આપી રહ્યા છે.
                                </p>
                            </div>
                            <Button
                                className="mt-8 bg-orange-600 hover:bg-orange-700"
                                onClick={() => navigate('/history')}
                            >
                                સમગ્ર ઇતિહાસ
                            </Button>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="lg:w-1/2 relative"
                        >
                            <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl">
                                <img
                                    src="/Gujarat_Road_Network_Map_India.jpg"
                                    alt="Community Heritage"
                                    width={800}
                                    height={800}
                                    loading="lazy"
                                    decoding="async"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="absolute -bottom-6 -left-6 bg-blue-600 text-white p-8 rounded-2xl shadow-xl hidden sm:block">
                                <div className="text-4xl font-bold">100+</div>
                                <div className="text-sm font-medium">Years of Legacy</div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Social Initiatives Section */}
            <section className="py-24 bg-stone-50 dark:bg-gray-950 relative overflow-hidden">
                {/* Subtle Classic Background Texture */}
                <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-20">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-bold mb-6"
                        >
                            <Heart className="w-4 h-4" />
                            Community Impact
                        </motion.div>
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mb-6 tracking-tight"
                        >
                            Social Initiatives & Work
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed"
                        >
                            Our commitment to the community goes beyond infrastructure. We focus on social welfare, traditional values, and empowering every generation.
                        </motion.p>
                    </div>

                    <div className="space-y-12 sm:space-y-32">
                        {[
                            {
                                title: "આર્થિક સહાય (Funeral Support)",
                                desc: "મંડળમાં જે કોઈ ઉમ્મેદવાર હોય તેમનું અવસાન થાય તો સભ્યોએ તે સભ્યને પરિવારને આર્થિક સહાય પેટે રૂપિયા ૧૦૦/- પ્રતિ સભ્ય આપવાના રહે, જેમાં ૨૦૦ સભ્યો છે તો પ્રતિ વ્યક્તિ રૂપિયા ૧૦૦/- લેખે રૂપિયા ૨૦,૦૦૦/- થાય. જે રકમ અવસાન પામનાર વ્યક્તિના વારસાદર ને ચેક દ્વારા સહાય કરવામાં આવશે. ",
                                icon: HandHeart,
                                image: "/funeral-img.webp",
                                color: "red",
                                stats: "શ્રી સોશિયલ સથવારા કડિયા સેવા ટ્રસ્ટ, અમદાવાદ",
                                accent: "border-red-500/30 bg-red-500/5"
                            },
                            {
                                title: "યુવા મેળો (Matrimonial Event)",
                                desc: "યુવા મેળો આપણા યુવાનો માટે એક આધુનિક સેતુ (પુલ) સમાન છે, જે જીવનસાથીની પસંદગી માટે એક આદરણીય અને વ્યવસ્થિત મંચ પૂરો પાડે છે. અમે આપણી નવી પેઢીને આપણા સમાન વારસામાં સુસંગત જીવનસાથી શોધવામાં મદદ કરીએ છીએ.",
                                icon: Sparkles,
                                image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2669&auto=format&fit=crop",
                                color: "orange",
                                stats: "Annual Youth Convention",
                                accent: "border-orange-500/30 bg-orange-500/5"
                            },
                            {
                                title: "સમૂહ લગન (Group Marriages)",
                                desc: "અમારી મુખ્ય પહેલનો ઉદ્દેશ્ય લગ્નોને સરળ બનાવવાનો અને પરિવારો પરનો આર્થિક બોજ ઘટાડવાનો છે. સમૂહ લગ્નોનું આયોજન કરીને, અમે એકતાની ઉજવણી કરીએ છીએ અને સામુદાયિક ટેકો તથા સાદગી જેવા પરંપરાગત મૂલ્યોને પ્રોત્સાહન આપીએ છીએ.",
                                icon: Users,
                                image: "https://d1zpvjny0s6omk.cloudfront.net/media/fileupload/2015/09/28/PYE_3523.jpg",
                                color: "blue",
                                stats: "500+ પરિવારોને આશીર્વાદ",
                                accent: "border-blue-500/30 bg-blue-500/5"
                            },
                            // {
                            //     title: "Educational Motivation & Awards",
                            //     desc: "Education is the foundation of progress. We recognize and reward our brightest students with prizes and scholarships, encouraging a culture of academic excellence and continuous learning for the next generation.",
                            //     icon: Trophy,
                            //     image: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEh9NstGwxc4Wt9DHE5mNDUBuCkBJbRWWDuGcSy4qwcY08d89krGi-MTu-R_pUc9AjS0Fgrs4FvMyle4HyYjgLzxJUplYYXRNUbx19keRzeA2TyGT3RuDLoRH2yDe48Ooimo1JNy2jlk0yVk/s1600/how-to-motivate-students.jpg",
                            //     color: "yellow",
                            //     stats: "1000+ Students Awarded",
                            //     accent: "border-yellow-500/30 bg-yellow-500/5"
                            // }
                        ].map((item, idx) => (
                            <div key={idx}>
                                {/* Desktop Version: Alternating Image/Text */}
                                <motion.div
                                    initial={{ opacity: 0, y: 50 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.8 }}
                                    className={`hidden lg:flex ${idx % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-12 lg:gap-20`}
                                >
                                    <div className="w-full lg:w-1/2 relative group">
                                        <div className={`absolute -inset-4 bg-${item.color}-500/10 rounded-4xl blur-2xl group-hover:bg-${item.color}-500/20 transition-all duration-500`}></div>
                                        <div className="relative aspect-4/3 rounded-3xl overflow-hidden shadow-2xl">
                                            <img
                                                src={item.image}
                                                alt={item.title}
                                                width={800}
                                                height={600}
                                                loading="lazy"
                                                decoding="async"
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                            <div className="absolute bottom-6 left-6 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                                <span className="bg-white/20 backdrop-blur-md px-4 py-1 rounded-full text-lg font-bold border border-white/30">
                                                    {item.stats}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="w-full lg:w-1/2 space-y-6">
                                        <div className={`w-14 h-14 rounded-2xl bg-${item.color}-100 dark:bg-${item.color}-900/40 flex items-center justify-center`}>
                                            <item.icon className={`w-8 h-8 text-${item.color}-600 dark:text-${item.color}-400`} />
                                        </div>
                                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                                            {item.title}
                                        </h3>
                                        <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                                            {item.desc}
                                        </p>
                                        <div className="pt-4">
                                            <Button variant="outline" className={`border-${item.color}-200 hover:bg-${item.color}-50 text-${item.color}-700 dark:border-${item.color}-900 dark:text-${item.color}-300 dark:hover:bg-${item.color}-900/20`}>
                                                Learn More <ArrowRight className="w-4 h-4 ml-2" />
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Mobile Version: Aesthetic Blurred Image Card */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6 }}
                                    className="lg:hidden relative overflow-hidden rounded-[2.5rem] shadow-xl border border-white/20 min-h-[480px] flex flex-col group"
                                >
                                    {/* Blurred Backdrop Image */}
                                    <div className="absolute inset-0 z-0">
                                        <img
                                            src={item.image}
                                            alt=""
                                            width={800}
                                            height={600}
                                            loading="lazy"
                                            decoding="async"
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-10"></div>
                                        <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/50 to-black/10 z-20"></div>
                                    </div>

                                    {/* Content Overlay — fills full card height */}
                                    <div className="relative z-30 flex flex-col justify-between flex-1 p-6">
                                        {/* Top: Icon + Title + Description */}
                                        <div className="space-y-3">
                                            <div className={`w-12 h-12 rounded-xl bg-white/10 backdrop-blur-lg flex items-center justify-center border border-white/20`}>
                                                <item.icon className={`w-6 h-6 text-white`} />
                                            </div>
                                            <h3 className="text-3xl font-bold text-white tracking-tight leading-tight">
                                                {item.title}
                                            </h3>
                                            <p className="text-gray-200 text-sm leading-relaxed line-clamp-5">
                                                {item.desc}
                                            </p>
                                        </div>

                                        {/* Bottom: Stats badge + Button — column on mobile */}
                                        <div className="flex flex-col gap-3 pt-5">
                                            <span className="text-xs font-bold text-white/70 uppercase tracking-widest px-3 py-2 rounded-full border border-white/10 bg-white/5 text-center">
                                                {item.stats}
                                            </span>
                                            <Button size="sm" className="w-full bg-white text-black hover:bg-gray-100 rounded-full">
                                                Learn More <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 lg:grid-cols-2 gap-8">

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

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg md:col-span-2 border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="text-2xl font-bold mb-2">Support Your Community</h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md">Your contributions help us maintain facilities, organize events, and support those in need.</p>
                            <Button variant="secondary" className="bg-white dark:bg-gray-800 border dark:border-orange-800 text-orange-600 hover:bg-red-200">Donate Now</Button>
                        </div>
                        <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
