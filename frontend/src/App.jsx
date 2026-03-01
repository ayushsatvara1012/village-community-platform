import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import ScrollToTop from './components/layout/ScrollToTop';
import ErrorBoundary from './components/ErrorBoundary';
import { FullScreenLoader } from './components/ui/FullScreenLoader';

// Route-based code splitting — each page is a separate JS chunk.
// The browser only downloads a page's code when the user navigates to it.
const Home = lazy(() => import('./pages/Home'));
const Members = lazy(() => import('./pages/Members'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const Application = lazy(() => import('./pages/Application'));
const Donate = lazy(() => import('./pages/Donate'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const Profile = lazy(() => import('./pages/Profile'));
const MemberProfile = lazy(() => import('./pages/MemberProfile'));
const PayMembership = lazy(() => import('./pages/PayMembership'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Villages = lazy(() => import('./pages/Villages'));
const History = lazy(() => import('./pages/History'));


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
                        {/* Suspense catches lazy() chunk loading for all routes */}
                        <Suspense fallback={<FullScreenLoader />}>
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
                        </Suspense>
                    </ErrorBoundary>
                </main>
            </div>
        </AuthProvider>
    );
}

export default App;
