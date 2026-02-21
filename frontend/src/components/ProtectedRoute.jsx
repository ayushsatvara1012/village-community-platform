import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute with status-based access control.
 * @param {string[]} allowedStatuses - Array of statuses allowed (e.g. ['approved', 'member'])
 * @param {boolean} allowUnauthenticated - Allow unauthenticated users (for registration wizard)
 */
export function ProtectedRoute({ children, allowedStatuses = ['member'], requireAdmin = false, allowUnauthenticated = false }) {
    const { isAuthenticated, user, pendingRegistration } = useAuth();

    // Allow unauthenticated users with pending registration (for the wizard)
    if (!isAuthenticated && allowUnauthenticated && pendingRegistration) {
        return children;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Admin always has access
    if (user?.role === 'admin') {
        return children;
    }

    // Check if admin-only route
    if (requireAdmin) {
        return <Navigate to="/" replace />;
    }

    // Check status-based access
    if (allowedStatuses && !allowedStatuses.includes(user?.status)) {
        // Redirect based on current status
        if (user?.status === 'pending') {
            return <Navigate to="/apply" replace />;
        }
        if (user?.status === 'approved') {
            return <Navigate to="/pay" replace />;
        }
        if (user?.status === 'rejected') {
            return <Navigate to="/" replace />;
        }
        return <Navigate to="/" replace />;
    }

    return children;
}
