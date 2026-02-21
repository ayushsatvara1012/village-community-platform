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
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <div className="flex flex-col min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans">
        <Navbar />
        <main className="flex-1 flex flex-col">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/donate" element={<Donate />} />

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
          </Routes>
        </main>
      </div>
    </AuthProvider>
  );
}

export default App;
