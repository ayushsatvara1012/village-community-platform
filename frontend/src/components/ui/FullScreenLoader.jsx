import { memo } from 'react';

export const FullScreenLoader = memo(function FullScreenLoader() {
    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-gray-50/50 dark:bg-gray-900/50 backdrop-blur-xs border-none m-0 p-0 pb-16">
            <div className="loader"></div>
        </div>
    );
});
