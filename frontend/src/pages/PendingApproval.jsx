import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Clock, LogOut } from 'lucide-react';

export default function PendingApproval() {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-[calc(100vh-64px)] bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6">
            <div className="max-w-md w-full text-center">
                {/* Animated Clock Icon */}
                <div className="relative mx-auto w-24 h-24 mb-8">
                    <div className="absolute inset-0 bg-amber-500/20 rounded-full animate-ping"></div>
                    <div className="relative w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-xl shadow-amber-500/30">
                        <Clock className="w-12 h-12 text-white" />
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                    Approval Pending
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">
                    Welcome, <span className="font-semibold text-gray-700 dark:text-gray-200">{user?.full_name}</span>!
                </p>
                <p className="text-gray-500 dark:text-gray-400 mb-8">
                    Your account has been created successfully. An admin will review and approve your membership shortly. You'll get full access to the dashboard once approved.
                </p>

                {/* Status Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-sm font-medium mb-8">
                    <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                    Waiting for Admin Approval
                </div>

                <div className="flex flex-col gap-3">
                    <Button
                        onClick={() => window.location.reload()}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700"
                    >
                        Check Status
                    </Button>
                    <Button
                        variant="outline"
                        onClick={logout}
                        className="w-full py-3 flex items-center justify-center gap-2"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </Button>
                </div>
            </div>
        </div>
    );
}
