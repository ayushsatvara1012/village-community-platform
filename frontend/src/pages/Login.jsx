import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Loader2, Shield, Mail, Eye, EyeOff } from 'lucide-react';

export default function Login() {
    const [formData, setFormData] = useState({
        identifier: '',
        password: '',
        otp: ''
    });
    const [loginMethod, setLoginMethod] = useState('password'); // 'otp' or 'password'
    const [otpSent, setOtpSent] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { login, requestUserOtp, verifyUserOtp } = useAuth();
    const navigate = useNavigate();

    // Pre-fill identifier from localStorage if it exists
    useEffect(() => {
        const savedIdentifier = localStorage.getItem('remembered_identifier');
        if (savedIdentifier) {
            setFormData(prev => ({ ...prev, identifier: savedIdentifier }));
            setRememberMe(true);
        }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
        // Clear errors when typing
        if (error) setError('');
    };

    const handleSendOtp = async () => {
        if (!formData.identifier) {
            setError('Please enter your email or phone number first.');
            return;
        }
        setError('');
        setSuccessMsg('');
        setIsLoading(true);
        try {
            const data = await requestUserOtp(formData.identifier);
            setSuccessMsg(data.message || 'OTP sent successfully.');
            setOtpSent(true);
        } catch (err) {
            setError(err.message || 'Failed to send OTP.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            if (loginMethod === 'password') {
                await login(formData.identifier, formData.password, rememberMe);
                if (rememberMe) {
                    localStorage.setItem('remembered_identifier', formData.identifier);
                } else {
                    localStorage.removeItem('remembered_identifier');
                }
                navigate('/profile');
            } else if (loginMethod === 'otp') {
                if (!otpSent) {
                    await handleSendOtp();
                } else {
                    if (!formData.otp) {
                        setError('Please enter the OTP.');
                        setIsLoading(false);
                        return;
                    }
                    await verifyUserOtp(formData.identifier, formData.otp, rememberMe);
                    if (rememberMe) {
                        localStorage.setItem('remembered_identifier', formData.identifier);
                    } else {
                        localStorage.removeItem('remembered_identifier');
                    }
                    navigate('/profile');
                }
            }
        } catch (err) {
            setError(err.message || 'Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setOtpSent(false);
        setFormData(prev => ({ ...prev, otp: '', password: '' }));
        setError('');
        setSuccessMsg('');
    };

    const toggleLoginMethod = () => {
        setLoginMethod(prev => prev === 'otp' ? 'password' : 'otp');
        resetForm();
    };

    return (
        <div className="flex-1 flex bg-cover bg-center overflow-hidden relative" style={{ backgroundImage: "url('/Gemini_Generated_Image_pq9366pq9366pq93.png')" }}>
            {/* Global dark/blur overlay for readability */}
            <div className="absolute inset-0 bg-gray-900/60 z-0"></div>

            {/* Left Side - Text & Intro */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden z-10">
                <div className="relative z-10 flex flex-col justify-center px-8 xl:px-16 text-white h-full">
                    <h1 className="text-4xl xl:text-5xl font-gujarati mb-4 xl:mb-6">શ્રી સથવારા કડિયા <span className='text-orange-500 font-bold'>પ્રગતિ મંડળ</span></h1>
                    <p className="text-lg xl:text-xl text-blue-100 max-w-lg">
                        Access your community dashboard, connect with members, and stay updated with the latest village news.
                    </p>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex flex-col px-2 py-4 sm:p-6 lg:p-8 relative overflow-y-auto">
                {/* Decorative Elements - hidden on mobile */}
                <div className="hidden sm:block absolute top-20 right-20 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
                <div className="hidden sm:block absolute bottom-20 left-20 w-64 h-64 bg-green-500/20 rounded-full blur-3xl pointer-events-none"></div>

                <div className="w-full max-w-md mx-auto my-auto bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-5 sm:p-8 z-10 flex-shrink-0">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-6 sm:mb-8">Sign In</h2>

                    <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                        {error && (
                            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm text-center">
                                {error}
                            </div>
                        )}
                        {successMsg && (
                            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 text-sm text-center">
                                {successMsg}
                            </div>
                        )}

                        <div>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    name="identifier"
                                    value={formData.identifier}
                                    onChange={handleChange}
                                    disabled={otpSent}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-900 dark:text-white disabled:opacity-60"
                                    placeholder="Email or Phone Number"
                                    required
                                />
                            </div>
                            {otpSent && (
                                <button type="button" onClick={resetForm} className="text-xs text-blue-500 mt-1 hover:underline">
                                    Change email/phone
                                </button>
                            )}
                        </div>

                        {loginMethod === 'password' && (
                            <div>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400 pr-12"
                                        placeholder="••••••••"
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                        )}

                        {loginMethod === 'otp' && otpSent && (
                            <div>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="otp"
                                        required
                                        value={formData.otp}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400 text-center tracking-widest font-mono text-lg"
                                        placeholder="000000"
                                        maxLength={6}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center text-gray-600 dark:text-gray-400 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                Remember me
                            </label>
                            {loginMethod === 'password' && (
                                <Link to="/forgot-password" className="text-blue-600 hover:text-blue-500 font-medium">Forgot password?</Link>
                            )}
                        </div>

                        <div className="space-y-3">
                            <Button
                                type="submit"
                                className="w-full py-3 text-lg font-semibold shadow-lg shadow-blue-500/30"
                                disabled={isLoading}
                            >
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                                {loginMethod === 'password' ? 'Sign In' : (otpSent ? 'Verify OTP & Login' : 'Send OTP')}
                            </Button>

                            <button
                                type="button"
                                onClick={toggleLoginMethod}
                                className="w-full py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                            >
                                {loginMethod === 'otp' ? 'Login with Password instead' : 'Login with OTP instead'}
                            </button>
                        </div>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="mt-6 text-sm text-gray-600 dark:text-gray-400">
                            Don't have an account?{' '}
                            <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-500">
                                Register for free
                            </Link>
                        </p>

                        {/* Admin Login Link */}
                        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                            <Link
                                to="/admin-login"
                                className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                            >
                                <Shield className="w-4 h-4" />
                                Admin Login
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
