import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Loader2, Eye, EyeOff } from 'lucide-react';

export default function Register() {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(''); // Added error state
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); // Clear previous errors
        setIsLoading(true);
        try {
            await register(name, phone, email, password); // phone added
            navigate('/apply'); // Redirect to Application Wizard to fill details
        } catch (err) {
            console.error(err);
            setError(err.message || 'Registration failed'); // Use setError for displaying error
            // alert(err.message || 'Registration failed'); // Removed alert, using state for error
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex-1 flex bg-cover bg-center overflow-hidden relative" style={{ backgroundImage: "url('/Gemini_Generated_Image_pq9366pq9366pq93.png')" }}>
            {/* Global dark overlay for readability */}
            <div className="absolute inset-0 bg-gray-900/60  z-0"></div>

            {/* Left Side - Text & Intro */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden z-10">
                <div className="relative z-10 flex flex-col justify-center px-8 xl:px-16 text-white h-full ">
                    <h1 className="text-4xl xl:text-5xl font-bold mb-4 xl:mb-6">Join Our Community</h1>
                    <p className="text-lg xl:text-xl text-green-100 max-w-lg">
                        Be part of a thriving village network. Register now, fill your details, and become an official member.
                    </p>
                </div>
            </div>

            {/* Right Side - Register Form */}
            <div className="w-full lg:w-1/2 flex flex-col px-2 py-4 sm:p-6 lg:p-8 relative overflow-y-auto">
                <div className="hidden sm:block absolute top-10 left-20 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>
                <div className="hidden sm:block absolute bottom-10 right-20 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>

                <div className="w-full max-w-md mx-auto my-auto bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-5 sm:p-8 z-10 flex-shrink-0">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-2">Create Account</h2>
                    <p className="text-center text-gray-500 dark:text-gray-400 mb-6 text-sm">You'll fill in your village and details in the next step.</p>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg flex items-center gap-2 text-sm dark:bg-red-900/30 dark:border-red-800/50 dark:text-red-400">
                            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                            <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400"
                                placeholder="John Doe"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                            <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400"
                                placeholder="+91 9876543210"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400"
                                placeholder="name@example.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                            <div className="relative">
                                <input type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400 pr-12"
                                    placeholder="Create a strong password"
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-start text-sm mt-2">
                            <input type="checkbox" required className="mt-1 mr-2 rounded border-gray-300 text-green-600 focus:ring-green-500" />
                            <span className="text-gray-600 dark:text-gray-400">
                                I agree to the <a href="#" className="text-green-600 hover:text-green-500 underline">Terms of Service</a> and <a href="#" className="text-green-600 hover:text-green-500 underline">Privacy Policy</a>.
                            </span>
                        </div>

                        <Button type="submit" className="w-full py-3 text-lg font-semibold bg-green-600 hover:bg-green-700 focus:ring-green-500 shadow-lg shadow-green-500/30" disabled={isLoading}>
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                            {isLoading ? 'Creating Account...' : 'Register'}
                        </Button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Already have an account?{' '}
                            <Link to="/login" className="font-semibold text-green-600 hover:text-green-500">Sign in</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
