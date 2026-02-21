import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { CreditCard, Shield, CheckCircle, Loader2, Award, PartyPopper } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PayMembership() {
    const { user, refreshUser } = useAuth();
    const navigate = useNavigate();
    const [fee, setFee] = useState(500);
    const [loading, setLoading] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [sabhasadId, setSabhasadId] = useState(null);
    const token = localStorage.getItem('village_app_token');

    useEffect(() => {
        // Fetch membership fee
        fetch('http://localhost:8000/payments/membership/fee')
            .then(res => res.json())
            .then(data => setFee(data.amount))
            .catch(console.error);
    }, []);

    // If user is already a member, redirect to dashboard
    useEffect(() => {
        if (user?.status === 'member') {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    const handlePayment = async () => {
        setLoading(true);
        try {
            // Step 1: Create order
            const orderRes = await fetch('http://localhost:8000/payments/membership/create-order', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!orderRes.ok) {
                const err = await orderRes.json();
                throw new Error(err.detail || 'Failed to create order');
            }

            const orderData = await orderRes.json();

            // Step 2: Open Razorpay checkout
            const options = {
                key: orderData.razorpay_key_id,
                amount: orderData.amount * 100,
                currency: orderData.currency,
                name: 'VillageApp',
                description: 'Community Membership Fee',
                order_id: orderData.order_id,
                handler: async function (response) {
                    // Step 3: Verify payment
                    try {
                        const verifyRes = await fetch('http://localhost:8000/payments/membership/verify', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify({
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_signature: response.razorpay_signature,
                                amount: orderData.amount
                            })
                        });

                        if (verifyRes.ok) {
                            const result = await verifyRes.json();
                            setSabhasadId(result.sabhasad_id);
                            setPaymentSuccess(true);
                            await refreshUser();
                        } else {
                            const err = await verifyRes.json();
                            alert(err.detail || 'Payment verification failed');
                        }
                    } catch (err) {
                        console.error('Verification error:', err);
                        alert('Payment verification failed. Please contact support.');
                    }
                    setLoading(false);
                },
                prefill: {
                    name: user?.full_name,
                    email: user?.email || '',
                    contact: user?.phone_number || ''
                },
                theme: { color: '#2563eb' },
                modal: {
                    ondismiss: () => setLoading(false)
                }
            };

            if (window.Razorpay) {
                const rzp = new window.Razorpay(options);
                rzp.open();
            } else {
                // Razorpay script not loaded — simulate for dev/testing
                alert('Razorpay SDK not loaded. In production, include the Razorpay script tag.');
                setLoading(false);
            }
        } catch (err) {
            console.error('Payment error:', err);
            alert(err.message || 'Payment failed');
            setLoading(false);
        }
    };

    if (paymentSuccess) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="max-w-md w-full text-center"
                >
                    {/* Confetti-like decorative circles */}
                    <div className="relative mx-auto w-32 h-32 mb-8">
                        <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping"></div>
                        <div className="absolute -top-2 -left-2 w-6 h-6 bg-yellow-400 rounded-full animate-bounce delay-100"></div>
                        <div className="absolute -top-1 -right-3 w-4 h-4 bg-blue-400 rounded-full animate-bounce delay-200"></div>
                        <div className="absolute -bottom-2 left-4 w-5 h-5 bg-purple-400 rounded-full animate-bounce delay-300"></div>
                        <div className="relative w-32 h-32 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center shadow-2xl shadow-green-500/40">
                            <CheckCircle className="w-16 h-16 text-white" />
                        </div>
                    </div>

                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
                        Welcome to the Community! 🎉
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mb-8 text-lg">
                        Your membership is now active.
                    </p>

                    {/* Sabhasad ID Card */}
                    <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-2xl p-6 shadow-2xl shadow-blue-500/30 mb-8 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>

                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <Award className="w-5 h-5 text-yellow-300" />
                                    <span className="text-sm font-medium text-blue-200">Sabhasad ID</span>
                                </div>
                                <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Active Member</span>
                            </div>
                            <p className="text-4xl font-bold tracking-wider mb-4">{sabhasadId}</p>
                            <div className="flex justify-between text-sm text-blue-200">
                                <div>
                                    <p className="text-xs text-blue-300">Name</p>
                                    <p className="font-medium text-white">{user?.full_name}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-blue-300">Member Since</p>
                                    <p className="font-medium text-white">{new Date().toLocaleDateString('en-IN')}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Button
                        onClick={() => navigate('/dashboard')}
                        className="w-full py-3 text-lg bg-blue-600 hover:bg-blue-700"
                    >
                        Go to Dashboard
                    </Button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
            <div className="max-w-lg w-full">
                <div className="text-center mb-8">
                    <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/30 mb-6">
                        <CreditCard className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Membership Payment</h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Complete your payment to become an official community member and receive your <strong>Sabhasad ID</strong>.
                    </p>
                </div>

                <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-8">
                    {/* Fee Details */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-5 mb-6 border border-blue-100 dark:border-blue-900/50">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Community Membership Fee</span>
                            <span className="text-2xl font-bold text-gray-900 dark:text-white">₹{fee}</span>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">One-time payment • Lifetime membership</div>
                    </div>

                    {/* Benefits */}
                    <div className="space-y-3 mb-8">
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">What you'll get:</h3>
                        {[
                            'Unique Sabhasad ID for community identification',
                            'Full access to the community dashboard',
                            'Participation in community events & decisions',
                            'Family tree registration & management',
                        ].map((benefit, idx) => (
                            <div key={idx} className="flex items-start gap-3">
                                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                <span className="text-sm text-gray-600 dark:text-gray-400">{benefit}</span>
                            </div>
                        ))}
                    </div>

                    {/* Security Note */}
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-6 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
                        <Shield className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span>Payments are securely processed through Razorpay. Your financial data is never stored.</span>
                    </div>

                    {/* Pay Button */}
                    <Button
                        onClick={handlePayment}
                        disabled={loading}
                        className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/30 transition-all"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <CreditCard className="w-5 h-5 mr-2" />
                                Pay ₹{fee} & Get Sabhasad ID
                            </>
                        )}
                    </Button>
                </div>

                {/* Profile info */}
                <div className="text-center mt-6">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Paying as <strong>{user?.full_name}</strong> ({user?.email})
                    </p>
                </div>
            </div>
        </div>
    );
}
