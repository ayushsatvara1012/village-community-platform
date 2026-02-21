import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Loader2, Shield, Mail, Eye, EyeOff } from 'lucide-react';

const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID_HERE'; // Replace with your Google Client ID

export default function Login() {
    const [formData, setFormData] = useState({
        identifier: '',
        password: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { login, googleLogin } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleGoogleResponse = useCallback(async (response) => {
        setError('');
        setIsLoading(true);
        try {
            await googleLogin(response.credential);
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'Google sign-in failed.');
        } finally {
            setIsLoading(false);
        }
    }, [googleLogin, navigate]);

    useEffect(() => {
        // Initialize Google Sign-In
        if (window.google && GOOGLE_CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID_HERE') {
            window.google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: handleGoogleResponse,
            });
            window.google.accounts.id.renderButton(
                document.getElementById('google-signin-btn'),
                {
                    theme: 'outline',
                    size: 'large',
                    width: '100%',
                    text: 'signin_with',
                    shape: 'rectangular',
                }
            );
        }
    }, [handleGoogleResponse]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await login(formData.identifier, formData.password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleClick = () => {
        if (GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID_HERE') {
            setError('Google Sign-In is not configured yet. Please set up a Google Cloud Client ID.');
            return;
        }
        // If Google button is rendered natively, this fallback triggers the prompt
        if (window.google) {
            window.google.accounts.id.prompt();
        }
    };

    return (
        <div className="flex-1 flex bg-cover bg-center overflow-hidden relative" style={{ backgroundImage: "url('/src/assets/Gemini_Generated_Image_pq9366pq9366pq93.png')" }}>
            {/* Global dark/blur overlay for readability */}
            <div className="absolute inset-0 bg-gray-900/60  z-0"></div>

            {/* Left Side - Text & Intro */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden z-10">
                <div className="relative z-10 flex flex-col justify-center px-8 xl:px-16 text-white h-full">
                    <h1 className="text-4xl xl:text-5xl font-gujarati mb-4 xl:mb-6">સતવારા ૩૨ સમાજ </h1>
                    <p className="text-lg xl:text-xl text-blue-100 max-w-lg">
                        Access your community dashboard, connect with members, and stay updated with the latest village news.
                    </p>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex flex-col px-4 py-6 sm:p-6 lg:p-8 relative overflow-y-auto">
                {/* Decorative Elements - hidden on mobile */}
                <div className="hidden sm:block absolute top-20 right-20 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
                <div className="hidden sm:block absolute bottom-20 left-20 w-64 h-64 bg-green-500/20 rounded-full blur-3xl pointer-events-none"></div>

                <div className="w-full max-w-md mx-auto my-auto bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6 sm:p-8 z-10 flex-shrink-0">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-8">Sign In</h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm text-center">
                                {error}
                            </div>
                        )}
                        <div>
                            {/* <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Member ID or Email</label> */}
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    name="identifier"
                                    value={formData.identifier}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-900 dark:text-white"
                                    placeholder="e.g. Member ID or Email"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            {/* <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label> */}
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

                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center text-gray-600 dark:text-gray-400">
                                <input type="checkbox" className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                Remember me
                            </label>
                            <Link to="/forgot-password" className="text-blue-600 hover:text-blue-500 font-medium">Forgot password?</Link>
                        </div>

                        <Button
                            type="submit"
                            className="w-full py-3 text-lg font-semibold shadow-lg shadow-blue-500/30"
                            disabled={isLoading}
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                            {isLoading ? 'Signing In...' : 'Sign In'}
                        </Button>
                    </form>

                    <div className="mt-8 text-center">
                        <div className="relative mb-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-transparent text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800">Or continue with</span>
                            </div>
                        </div>

                        {/* Google Sign-In */}
                        <div id="google-signin-btn" className="mb-3"></div>
                        {/* Fallback button if Google SDK not loaded or not configured */}
                        {(!window.google || GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID_HERE') && (
                            <Button
                                variant="outline"
                                className="w-full flex items-center justify-center gap-2 py-2.5 mb-3"
                                onClick={handleGoogleClick}
                                type="button"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                Sign in with Google
                            </Button>
                        )}

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
