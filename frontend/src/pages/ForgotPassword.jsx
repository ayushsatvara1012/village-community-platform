import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Loader2, ArrowLeft, KeyRound, Mail, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [step, setStep] = useState('email'); // 'email' or 'reset'
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const { requestPasswordResetOtp, resetPassword } = useAuth();
    const navigate = useNavigate();

    const handleRequestOtp = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        setIsLoading(true);
        try {
            const result = await requestPasswordResetOtp(email);
            setSuccessMsg(result.message || 'OTP sent! Check your email inbox.');
            setStep('reset');
        } catch (err) {
            setError(err.message || 'Failed to send OTP.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        setIsLoading(true);
        try {
            const result = await resetPassword(email, otp, newPassword);
            setSuccessMsg(result.message);
            // Wait 2 seconds and redirect to login
            setTimeout(() => {
                navigate('/login');
            }, 2500);
        } catch (err) {
            setError(err.message || 'Password reset failed.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex-1 flex bg-cover bg-center overflow-hidden relative" style={{ backgroundImage: "url('/Gemini_Generated_Image_pq9366pq9366pq93.png')" }}>
            <div className="absolute inset-0 bg-gray-950/80 backdrop-blur-sm z-0"></div>

            <div className="w-full h-full flex items-center justify-center p-4 relative z-10 overflow-y-auto">
                <div className="w-full max-w-md w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6 sm:p-8">

                    <Link to="/login" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors mb-6">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Login
                    </Link>

                    <div className="text-center mb-8">
                        <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-200 dark:border-blue-800">
                            <KeyRound className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Reset Password</h2>
                        <p className="text-gray-500 mt-2 text-sm">
                            {step === 'email'
                                ? "Enter your registered email and we'll send you an OTP to reset your password."
                                : `OTP sent to ${email}`
                            }
                        </p>
                    </div>

                    <AnimatePresence mode="wait">
                        {step === 'email' ? (
                            <motion.form key="email-step" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleRequestOtp} className="space-y-5">
                                {error && <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm text-center">{error}</div>}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400"
                                            placeholder="you@example.com"
                                        />
                                    </div>
                                </div>

                                <Button type="submit" className="w-full py-3 text-lg font-semibold bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                                    {isLoading ? 'Sending OTP...' : 'Send Reset Link'}
                                </Button>
                            </motion.form>
                        ) : (
                            <motion.form key="reset-step" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} onSubmit={handleResetPassword} className="space-y-5">
                                {successMsg && <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 text-sm text-center">{successMsg}</div>}
                                {error && <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm text-center">{error}</div>}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">6-Digit OTP</label>
                                    <input type="text" required value={otp} onChange={(e) => setOtp(e.target.value)}
                                        className="w-full px-4 py-3 text-center tracking-widest text-xl rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-900 dark:text-white"
                                        placeholder="------" maxLength={6}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400"
                                            placeholder="Enter new strong password"
                                        />
                                    </div>
                                </div>

                                <Button type="submit" className="w-full py-3 text-lg font-semibold bg-green-600 hover:bg-green-700" disabled={isLoading || successMsg === 'Password reset successfully. You can now login with your new password.'}>
                                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                                    {isLoading ? 'Resetting...' : 'Reset Password'}
                                </Button>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
