import { FileQuestion, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] p-4 text-center">
            <div className="p-5 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-6 relative">
                <FileQuestion className="w-16 h-16 text-purple-600 dark:text-purple-400" />
                <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg transform rotate-12">
                    404
                </div>
            </div>

            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-3">Page Not Found</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-md">
                Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
            </p>

            <Link to="/">
                <Button className="flex items-center gap-2 shadow-md">
                    <Home className="w-4 h-4" /> Back to Homepage
                </Button>
            </Link>
        </div>
    );
}
