import { Link, useLocation } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Menu, X, Home, Users, Heart, LayoutDashboard, LogOut, ClipboardCheck, CreditCard } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export function Navbar() {
    const { user, logout, isAuthenticated } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();

    // Build nav links based on auth status
    const getNavLinks = () => {
        const links = [{ name: 'Home', path: '/', icon: Home }];

        if (!isAuthenticated) {
            // Anonymous: Home + Donate only
            links.push({ name: 'Donate', path: '/donate', icon: Heart });
        } else if (user?.status === 'pending') {
            // Pending: Home + Check Status
            links.push({ name: 'Application Status', path: '/apply', icon: ClipboardCheck });
        } else if (user?.status === 'approved') {
            // Approved: Home + Members + Donate + Pay Membership
            links.push({ name: 'Members', path: '/members', icon: Users });
            links.push({ name: 'Donate', path: '/donate', icon: Heart });
            links.push({ name: 'Pay Membership', path: '/pay', icon: CreditCard });
        } else if (user?.status === 'member' || user?.role === 'admin') {
            // Full members / Admin
            links.push({ name: 'Members', path: '/members', icon: Users });
            links.push({ name: 'Donate', path: '/donate', icon: Heart });
        }

        return links;
    };

    const navLinks = getNavLinks();
    const isActive = (path) => location.pathname === path;

    const getUserDisplayName = () => {
        return user?.full_name || user?.name || user?.sabhasad_id || user?.email || 'User';
    };

    const getAvatarUrl = () => {
        const name = getUserDisplayName();
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&size=40`;
    };

    return (
        <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex-shrink-0 flex items-center gap-2">

                            <img
                                src="/src/assets/v-logo.png"
                                alt="Logo"
                                className="w-10 h-10 object-contain"
                            />

                            <span className="font-bold font-gujarati text-2xl text-gray-900 dark:text-white">સતવારા <span className='text-orange-800'>૩૨</span> સમાજ</span>
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex md:items-center md:space-x-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className={`inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors ${isActive(link.path)
                                    ? 'text-blue-600 dark:text-blue-400'
                                    : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                                    }`}
                            >
                                <link.icon className="w-4 h-4 mr-1.5" />
                                {link.name}
                            </Link>
                        ))}
                        <div className="flex items-center gap-4 ml-4">
                            {isAuthenticated ? (
                                <div className="flex items-center gap-3">
                                    {/* Status badge */}
                                    {user?.status === 'pending' && (
                                        <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-full font-medium">
                                            Pending
                                        </span>
                                    )}
                                    {user?.status === 'approved' && (
                                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full font-medium">
                                            Approved
                                        </span>
                                    )}

                                    {/* Profile link */}
                                    {(user?.status === 'approved' || user?.status === 'member' || user?.role === 'admin') && (
                                        <Link to="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                                            <img src={getAvatarUrl()} alt={getUserDisplayName()} className="w-8 h-8 rounded-full bg-gray-200" />
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-200 hidden lg:block">{getUserDisplayName()}</span>
                                        </Link>
                                    )}

                                    {/* Dashboard button — only for members/admin */}
                                    {(user?.status === 'member' || user?.role === 'admin') && (
                                        <Link to="/dashboard">
                                            <Button variant="outline" size="sm">
                                                <LayoutDashboard className="w-4 h-4 mr-2" />
                                                Dashboard
                                            </Button>
                                        </Link>
                                    )}

                                    <Button size="sm" variant="ghost" onClick={logout} title="Logout">
                                        <LogOut className="w-4 h-4" />
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Link to="/login">
                                        <Button size="sm" variant="ghost">Login</Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mobile menu button */}
                    <div className="flex items-center md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 dark:hover:bg-gray-800"
                        >
                            {isOpen ? <X className="block w-6 h-6" /> : <Menu className="block w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            <div
                className={`md:hidden absolute w-full left-0 top-[64px] bg-white dark:bg-gray-900 shadow-2xl transition-all duration-300 flex flex-col z-[100] ${isOpen ? 'max-h-[calc(100vh-64px)] opacity-100 border-b border-gray-200 dark:border-gray-800 overflow-y-auto' : 'max-h-0 opacity-0 pointer-events-none overflow-hidden'
                    }`}
            >
                <div className="px-2 pt-2 pb-3 space-y-1">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            to={link.path}
                            className={`block px-3 py-2 rounded-md text-base font-medium ${isActive(link.path)
                                ? 'bg-blue-50 text-blue-600 dark:bg-gray-800 dark:text-blue-400'
                                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'
                                }`}
                            onClick={() => setIsOpen(false)}
                        >
                            <div className="flex items-center">
                                <link.icon className="w-5 h-5 mr-3" />
                                {link.name}
                            </div>
                        </Link>
                    ))}
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700 mt-2">
                        {isAuthenticated ? (
                            <>
                                <div className="px-3 py-2 flex items-center gap-3">
                                    <img src={getAvatarUrl()} alt={getUserDisplayName()} className="w-8 h-8 rounded-full bg-gray-200" />
                                    <div>
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{getUserDisplayName()}</span>
                                        {user?.status && user.status !== 'member' && user.role !== 'admin' && (
                                            <span className="ml-2 text-xs px-2 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-full">
                                                {user.status}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                {(user?.status === 'member' || user?.role === 'admin') && (
                                    <Link to="/dashboard" onClick={() => setIsOpen(false)} className="block px-3 py-2">
                                        <Button variant="outline" className="w-full justify-start">
                                            <LayoutDashboard className="w-4 h-4 mr-2" />
                                            Dashboard
                                        </Button>
                                    </Link>
                                )}
                                <div className="px-3 py-2">
                                    <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50" onClick={logout}>
                                        <LogOut className="w-4 h-4 mr-2" />
                                        Logout
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <div className="space-y-2 px-3">
                                <Link to="/login" onClick={() => setIsOpen(false)}>
                                    <Button className="w-full" variant="outline">Login</Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
