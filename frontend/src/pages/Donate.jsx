import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Heart, Share2, Loader2, AlertCircle, HandHeart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Donate() {
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [showGeneralDonate, setShowGeneralDonate] = useState(false);
    const [donationAmount, setDonationAmount] = useState('');
    const [isDonating, setIsDonating] = useState(false);
    const [donationSuccess, setDonationSuccess] = useState(false);
    const [error, setError] = useState('');
    const { user } = useAuth();

    const API_URL = 'http://localhost:8000';

    useEffect(() => {
        fetch(`${API_URL}/events/`)
            .then(res => res.json())
            .then(data => setEvents(data))
            .catch(err => console.error("Failed to fetch events:", err));
    }, []);

    const openRazorpayCheckout = (orderData, description, onSuccess) => {
        const token = localStorage.getItem('village_app_token');
        const options = {
            key: orderData.razorpay_key_id,
            amount: orderData.amount * 100,
            currency: orderData.currency,
            name: 'Village Community',
            description,
            order_id: orderData.order_id,
            prefill: {
                name: user?.full_name || user?.name || '',
                email: user?.email || '',
            },
            theme: { color: '#DC2626' },
            method: { upi: true, card: true, netbanking: true, wallet: true },
            handler: async function (response) {
                try {
                    await onSuccess(response, token);
                    setDonationSuccess(true);
                    setTimeout(() => {
                        setSelectedEvent(null);
                        setShowGeneralDonate(false);
                        setDonationAmount('');
                        setDonationSuccess(false);
                        setError('');
                    }, 3000);
                } catch (verifyError) {
                    console.error('Verification error:', verifyError);
                    setError(verifyError.message || 'Payment verification failed. Please contact support.');
                }
                setIsDonating(false);
            },
            modal: {
                ondismiss: function () {
                    setIsDonating(false);
                    setError('Payment was cancelled.');
                }
            }
        };
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response) {
            setIsDonating(false);
            setError(response.error?.description || 'Payment failed. Please try again.');
        });
        rzp.open();
    };

    const handleDonate = async () => {
        const amount = parseFloat(donationAmount);
        if (!amount || amount <= 0) return setError('Please enter a valid amount.');
        setError('');
        setIsDonating(true);

        const token = localStorage.getItem('village_app_token');

        try {
            const orderRes = await fetch(`${API_URL}/events/${selectedEvent.id}/donate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ amount }),
            });

            if (!orderRes.ok) {
                const errData = await orderRes.json();
                throw new Error(errData.detail || 'Failed to create payment order');
            }

            const orderData = await orderRes.json();

            openRazorpayCheckout(orderData, `Donation for ${orderData.event_title}`, async (response, tkn) => {
                const verifyRes = await fetch(`${API_URL}/events/${selectedEvent.id}/verify-donation`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${tkn}`
                    },
                    body: JSON.stringify({
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_signature: response.razorpay_signature,
                        amount: amount,
                    }),
                });

                if (!verifyRes.ok) {
                    const errData = await verifyRes.json();
                    throw new Error(errData.detail || 'Payment verification failed');
                }

                const verifyData = await verifyRes.json();
                setEvents(prev => prev.map(e =>
                    e.id === selectedEvent.id ? { ...e, raised: verifyData.new_total } : e
                ));
            });

        } catch (error) {
            console.error('Donation error:', error);
            setError(error.message || 'Something went wrong.');
            setIsDonating(false);
        }
    };

    const handleGeneralDonate = async () => {
        const amount = parseFloat(donationAmount);
        if (!amount || amount <= 0) return setError('Please enter a valid amount.');
        setError('');
        setIsDonating(true);

        const token = localStorage.getItem('village_app_token');

        try {
            const orderRes = await fetch(`${API_URL}/payments/create-order`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ amount }),
            });

            if (!orderRes.ok) {
                const errData = await orderRes.json();
                throw new Error(errData.detail || 'Failed to create payment order');
            }

            const orderData = await orderRes.json();

            openRazorpayCheckout(orderData, 'General Donation — Village Community', async (response, tkn) => {
                const verifyRes = await fetch(`${API_URL}/payments/verify`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${tkn}`
                    },
                    body: JSON.stringify({
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_signature: response.razorpay_signature,
                        amount: amount,
                    }),
                });

                if (!verifyRes.ok) {
                    const errData = await verifyRes.json();
                    throw new Error(errData.detail || 'Payment verification failed');
                }
            });

        } catch (error) {
            console.error('General donation error:', error);
            setError(error.message || 'Something went wrong.');
            setIsDonating(false);
        }
    };

    // Is any modal open?
    const isModalOpen = selectedEvent || showGeneralDonate;
    const modalTitle = selectedEvent ? `Donate to ${selectedEvent.title}` : 'General Donation';
    const currentHandler = selectedEvent ? handleDonate : handleGeneralDonate;

    const closeModal = () => {
        setSelectedEvent(null);
        setShowGeneralDonate(false);
        setError('');
        setDonationAmount('');
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Support Our Community</h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Your contributions help us build a stronger, healthier, and more vibrant community for everyone.
                    </p>
                </div>

                {/* General Donation Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="mb-12 bg-gradient-to-br from-rose-600 via-red-600 to-orange-500 rounded-2xl shadow-2xl shadow-red-500/20 p-8 md:p-10 text-white relative overflow-hidden"
                >
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl pointer-events-none"></div>

                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-10">
                        <div className="flex-shrink-0">
                            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                                <HandHeart className="w-10 h-10 text-white" />
                            </div>
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h2 className="text-2xl md:text-3xl font-bold mb-2">Make a General Donation</h2>
                            <p className="text-red-100 text-lg max-w-xl">
                                Support our community with a general contribution. Your donation goes towards village development, healthcare, education, and more.
                            </p>
                        </div>
                        <div className="flex-shrink-0">
                            <Button
                                className="bg-white text-red-600 hover:bg-red-50 border-none px-8 py-3 text-lg font-bold shadow-lg shadow-black/10"
                                onClick={() => { setShowGeneralDonate(true); setDonationAmount(''); setDonationSuccess(false); setError(''); }}
                            >
                                <Heart className="w-5 h-5 mr-2 fill-current" />
                                Donate Now
                            </Button>
                        </div>
                    </div>
                </motion.div>

                {/* Events Section */}
                {events.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Active Campaigns</h2>
                    </div>
                )}

                {events.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                        <p className="text-base">No active campaigns right now — but you can still make a general donation above!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                        {events.map((event) => (
                            <motion.div
                                key={event.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow border border-gray-100 dark:border-gray-700 flex flex-col"
                            >
                                <div className="h-64 overflow-hidden relative group">
                                    <img
                                        src={event.image}
                                        alt={event.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute top-4 right-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                                        {event.category}
                                    </div>
                                </div>

                                <div className="p-8 flex-1 flex flex-col">
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{event.title}</h3>
                                    <p className="text-gray-600 dark:text-gray-300 mb-6 flex-1 text-lg">{event.description}</p>

                                    <div className="mb-6">
                                        <div className="flex justify-between text-sm font-medium mb-2">
                                            <span className="text-gray-600 dark:text-gray-400">Raised: <span className="text-green-600 dark:text-green-400 font-bold">₹{event.raised.toLocaleString()}</span></span>
                                            <span className="text-gray-500">Goal: ₹{event.goal.toLocaleString()}</span>
                                        </div>
                                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-500"
                                                style={{ width: `${Math.min((event.raised / event.goal) * 100, 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 mt-auto">
                                        <Button
                                            className="flex-1 text-lg py-3 shadow-lg shadow-red-500/20 bg-red-600 hover:bg-red-700 border-none"
                                            onClick={() => { setSelectedEvent(event); setDonationAmount(''); setDonationSuccess(false); setError(''); }}
                                        >
                                            <Heart className="w-5 h-5 mr-2 fill-current" />
                                            Donate Now
                                        </Button>
                                        <Button variant="outline" className="px-4 border-gray-300 dark:border-gray-600">
                                            <Share2 className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Donation Modal — shared for both event & general */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8 relative"
                        >
                            <button
                                onClick={closeModal}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>

                            {donationSuccess ? (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Heart className="w-8 h-8 text-green-600 fill-current" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Thank You!</h2>
                                    <p className="text-gray-500">Your donation of ₹{donationAmount} was successful.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="text-center mb-8">
                                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${showGeneralDonate
                                                ? 'bg-gradient-to-br from-rose-100 to-orange-100 dark:from-rose-900/20 dark:to-orange-900/20'
                                                : 'bg-red-50 dark:bg-red-900/20'
                                            }`}>
                                            {showGeneralDonate
                                                ? <HandHeart className="w-8 h-8 text-red-600" />
                                                : <Heart className="w-8 h-8 text-red-600" />
                                            }
                                        </div>
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{modalTitle}</h2>
                                        <p className="text-gray-500 mt-2">
                                            {showGeneralDonate
                                                ? 'Support village development, healthcare & education.'
                                                : 'Your small contribution makes a big difference.'
                                            }
                                        </p>
                                    </div>

                                    {error && (
                                        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                            {error}
                                        </div>
                                    )}

                                    <div className="grid grid-cols-3 gap-3 mb-6">
                                        {[500, 1000, 5000].map((amt) => (
                                            <button
                                                key={amt}
                                                onClick={() => setDonationAmount(String(amt))}
                                                className={`py-2 px-4 rounded-lg border transition-all font-medium ${donationAmount === String(amt)
                                                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600'
                                                    : 'border-gray-200 dark:border-gray-700 hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-700 dark:text-gray-300'
                                                    }`}
                                            >
                                                ₹{amt}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Custom Amount</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-3 text-gray-500">₹</span>
                                            <input
                                                type="number"
                                                value={donationAmount}
                                                onChange={(e) => setDonationAmount(e.target.value)}
                                                className="w-full pl-8 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent focus:ring-2 focus:ring-red-500 outline-none"
                                                placeholder="Enter amount"
                                            />
                                        </div>
                                    </div>

                                    <Button
                                        className="w-full py-3 text-lg bg-red-600 hover:bg-red-700 border-none"
                                        onClick={currentHandler}
                                        disabled={isDonating}
                                    >
                                        {isDonating ? (
                                            <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing...</>
                                        ) : (
                                            'Proceed to Pay'
                                        )}
                                    </Button>

                                    <div className="flex items-center justify-center gap-4 mt-4">
                                        <span className="text-xs text-gray-400">Secured by</span>
                                        <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">Razorpay</span>
                                        <span className="text-xs text-gray-300 dark:text-gray-600">|</span>
                                        <span className="text-xs text-gray-400">UPI • Cards • Netbanking</span>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
