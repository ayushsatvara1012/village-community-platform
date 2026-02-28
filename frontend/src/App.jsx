import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';
import Home from './pages/Home';
import Members from './pages/Members';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Application from './pages/Application';
import Donate from './pages/Donate';
import AdminLogin from './pages/AdminLogin';
import Profile from './pages/Profile';
import MemberProfile from './pages/MemberProfile';
import PayMembership from './pages/PayMembership';
import NotFound from './pages/NotFound';
import Villages from './pages/Villages';
import History from './pages/History';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider } from './context/AuthContext';
import ScrollToTop from './components/layout/ScrollToTop';

function App() {
    useEffect(() => {
        // Remove the initial loader from index.html once React mounts and window loaded
        const hideLoader = () => {
            const initialLoader = document.getElementById('initial-loader');
            if (initialLoader) {
                initialLoader.style.opacity = '0';
                setTimeout(() => {
                    initialLoader.remove();
                }, 500); // Wait for transition
            }
        };

        if (document.readyState === 'complete') {
            hideLoader();
        } else {
            window.addEventListener('load', hideLoader);
            return () => window.removeEventListener('load', hideLoader);
        }
    }, []);

    return (
        <AuthProvider>
            <ScrollToTop />
            <div className="flex flex-col min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans">
                <Navbar />
                <main className="flex-1 flex flex-col">
                    <ErrorBoundary>
                        <Routes>
                            {/* Public routes */}
                            <Route path="/" element={<Home />} />
                            <Route path="/villages" element={<Villages />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/forgot-password" element={<ForgotPassword />} />
                            <Route path="/admin-login" element={<AdminLogin />} />
                            <Route path="/donate" element={<Donate />} />
                            <Route path="/history" element={<History />} />

                            {/* Pending users: can fill application */}
                            <Route path="/apply" element={
                                <ProtectedRoute allowedStatuses={['pending']} allowUnauthenticated={true}>
                                    <Application />
                                </ProtectedRoute>
                            } />

                            {/* Approved users: pay membership */}
                            <Route path="/pay" element={
                                <ProtectedRoute allowedStatuses={['approved']}>
                                    <PayMembership />
                                </ProtectedRoute>
                            } />

                            {/* Approved+ users: can view members */}
                            <Route path="/members" element={
                                <ProtectedRoute allowedStatuses={['approved', 'member']}>
                                    <Members />
                                </ProtectedRoute>
                            } />
                            <Route path="/members/:id" element={
                                <ProtectedRoute allowedStatuses={['approved', 'member']}>
                                    <MemberProfile />
                                </ProtectedRoute>
                            } />

                            {/* Members only: dashboard & profile */}
                            <Route path="/dashboard" element={
                                <ProtectedRoute allowedStatuses={['member']}>
                                    <Dashboard />
                                </ProtectedRoute>
                            } />
                            <Route path="/profile" element={
                                <ProtectedRoute allowedStatuses={['approved', 'member']}>
                                    <Profile />
                                </ProtectedRoute>
                            } />

                            {/* Catch all 404 route */}
                            <Route path="*" element={<NotFound />} />
                        </Routes>
                    </ErrorBoundary>
                </main>
            </div>
        </AuthProvider>
    );
}

export default App;
