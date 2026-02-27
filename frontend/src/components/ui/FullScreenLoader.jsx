import { memo } from 'react';

export const FullScreenLoader = memo(function FullScreenLoader() {
    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-gray-50 dark:bg-gray-900 border-none m-0 p-0 pb-16">
            <div className="loader"></div>
        </div>
    );
});
