import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Loader2, Shield, ArrowLeft, KeyRound, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminLogin() {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState('email'); // 'email' or 'otp'
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const { adminRequestOtp, adminVerifyOtp } = useAuth();
    const navigate = useNavigate();

    const handleRequestOtp = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const result = await adminRequestOtp(email);
            setSuccessMsg(result.message || 'OTP sent! Check the server console.');
            setStep('otp');
        } catch (err) {
            setError(err.message || 'Failed to send OTP.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await adminVerifyOtp(email, otp);
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'OTP verification failed.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setError('');
        setSuccessMsg('');
        setIsLoading(true);
        try {
            const result = await adminRequestOtp(email);
            setSuccessMsg(result.message || 'New OTP sent! Check the server console.');
        } catch (err) {
            setError(err.message || 'Failed to resend OTP.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex-1 flex overflow-hidden bg-cover bg-center relative" style={{ backgroundImage: "url('/Gemini_Generated_Image_pq9366pq9366pq93.png')" }}>
            {/* Global dark overlay for readability */}
            <div className="absolute inset-0 bg-gray-950/80 backdrop-blur-sm z-0"></div>

            {/* Left Side - Dark Admin Theme */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden z-10">
                {/* Animated grid background */}
                <div className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage: `linear-gradient(rgba(255, 6, 6, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
                        backgroundSize: '40px 40px'
                    }}
                ></div>
                {/* Glow effects */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] pointer-events-none"></div>
                <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-600/20 rounded-full blur-[80px] pointer-events-none"></div>

                <div className="relative z-10 flex flex-col lg:place-items-center justify-center px-8 xl:px-16 text-white">
                    <div className="w-16 h-16 bg-blue-600/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-8 border border-blue-500/20">
                        <Shield className="w-8 h-8 text-blue-400" />
                    </div>
                    <h1 className="text-4xl xl:text-5xl font-bold mb-4 xl:mb-6 bg-gradient-to-r from-white to-gray-400 text-transparent bg-clip-text">
                        Admin Portal
                    </h1>
                    <p className="text-lg xl:text-xl text-gray-400 max-w-lg">
                        Secure access to the Village Community administration panel. OTP verification ensures only authorized personnel can access admin features.
                    </p>
                    <div className="mt-10 flex items-center gap-6 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            Secure Connection
                        </div>
                        <div className="flex items-center gap-2">
                            <KeyRound className="w-4 h-4" />
                            OTP Protected
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex flex-col px-4 py-8 sm:p-6 lg:p-8 relative z-10 overflow-y-auto">
                {/* Subtle glow - hidden on mobile */}
                <div className="hidden sm:block absolute top-20 right-20 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="w-full max-w-md mx-auto my-auto flex-shrink-0 z-20">
                    {/* Back button */}
                    <Link
                        to="/login"
                        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition-colors mb-8"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to User Login
                    </Link>

                    <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-800 p-5 sm:p-6 lg:p-8">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="w-14 h-14 bg-blue-600/20 rounded-xl flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
                                <Shield className="w-7 h-7 text-blue-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-white">Admin Sign In</h2>
                            <p className="text-gray-500 mt-2 text-sm">
                                {step === 'email'
                                    ? 'Enter your admin email to receive an OTP'
                                    : `OTP sent to ${email}`
                                }
                            </p>
                        </div>

                        <AnimatePresence mode="wait">
                            {step === 'email' ? (
                                <motion.form
                                    key="email-step"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    onSubmit={handleRequestOtp}
                                    className="space-y-5"
                                >
                                    {error && (
                                        <div className="p-3 rounded-lg bg-red-900/30 border border-red-800 text-red-400 text-sm text-center">
                                            {error}
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1.5">Admin Email</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-600" />
                                            <input
                                                type="email"
                                                required
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full pl-11 pr-4 py-3 rounded-lg bg-gray-800/50 border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-white placeholder-gray-600"
                                                placeholder="admin@example.com"
                                            />
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full py-3 text-lg font-semibold bg-blue-600 hover:bg-blue-700 border-none shadow-lg shadow-blue-600/20"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <KeyRound className="w-5 h-5 mr-2" />}
                                        {isLoading ? 'Sending OTP...' : 'Request OTP'}
                                    </Button>
                                </motion.form>
                            ) : (
                                <motion.form
                                    key="otp-step"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    onSubmit={handleVerifyOtp}
                                    className="space-y-5"
                                >
                                    {error && (
                                        <div className="p-3 rounded-lg bg-red-900/30 border border-red-800 text-red-400 text-sm text-center">
                                            {error}
                                        </div>
                                    )}
                                    {successMsg && (
                                        <div className="p-3 rounded-lg bg-green-900/30 border border-green-800 text-green-400 text-sm text-center">
                                            {successMsg}
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1.5">Enter 6-Digit OTP</label>
                                        <input
                                            type="text"
                                            required
                                            maxLength={6}
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                            className="w-full px-4 py-4 rounded-lg bg-gray-800/50 border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-white text-center text-2xl tracking-[0.5em] font-mono placeholder-gray-600"
                                            placeholder="000000"
                                            autoFocus
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full py-3 text-lg font-semibold bg-blue-600 hover:bg-blue-700 border-none shadow-lg shadow-blue-600/20"
                                        disabled={isLoading || otp.length !== 6}
                                    >
                                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Shield className="w-5 h-5 mr-2" />}
                                        {isLoading ? 'Verifying...' : 'Verify & Sign In'}
                                    </Button>

                                    <div className="flex items-center justify-between text-sm">
                                        <button
                                            type="button"
                                            onClick={handleResendOtp}
                                            disabled={isLoading}
                                            className="text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50"
                                        >
                                            Resend OTP
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => { setStep('email'); setOtp(''); setError(''); setSuccessMsg(''); }}
                                            className="text-gray-500 hover:text-gray-300 transition-colors"
                                        >
                                            Change email
                                        </button>
                                    </div>
                                </motion.form>
                            )}
                        </AnimatePresence>

                        <div className="mt-8 pt-6 border-t border-gray-800 text-center">
                            <p className="text-xs text-gray-600">
                                This portal is restricted to authorized administrators only.
                                <br />Unauthorized access attempts will be logged.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
