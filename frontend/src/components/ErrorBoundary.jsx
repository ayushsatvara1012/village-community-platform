import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // Log the error to console
        console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            // Render custom fallback UI
            return (
                <div className="flex flex-col items-center justify-center min-h-[70vh] p-4 text-center">
                    <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-full mb-6">
                        <AlertTriangle className="w-16 h-16 text-red-600 dark:text-red-400" />
                    </div>

                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-3">Something went wrong</h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
                        We're sorry, but an unexpected error occurred while trying to load this page. Our team has been notified.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={() => window.location.reload()}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all shadow-md hover:shadow-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Reload Page
                        </button>
                        <button
                            onClick={() => window.location.href = '/'}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-medium rounded-xl transition-all shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700 focus:outline-none"
                        >
                            <Home className="w-4 h-4" />
                            Go to Homepage
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
