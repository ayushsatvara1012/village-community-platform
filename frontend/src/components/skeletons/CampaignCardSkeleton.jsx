import React from 'react';
import Skeleton from '../ui/Skeleton';

/**
 * CampaignCardSkeleton
 * Precisely matches the layout and dimensions of the campaign cards in Donate.jsx
 * to prevent Content Layout Shift (CLS).
 */
export const CampaignCardSkeleton = () => {
    return (
        <div
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700 flex flex-col relative min-h-[450px]"
            aria-busy="true"
            aria-live="polite"
            aria-label="Loading campaign details..."
        >
            {/* Screen reader only text */}
            <span className="sr-only">Loading content...</span>

            {/* Hero Image Area Skeleton */}
            <div className="absolute inset-0">
                <Skeleton className="w-full h-full rounded-none" />
                {/* Subtle overlay to mimic the dark gradient in the real card */}
                <div className="absolute inset-0 bg-gray-900/10 backdrop-blur-[1px]"></div>
            </div>

            {/* Category Badge Skeleton (Top Right) */}
            <div className="absolute top-4 right-4 flex items-center gap-2">
                <Skeleton width="80px" height="24px" borderRadius="9999px" />
            </div>

            {/* Card Content Skeleton */}
            <div className="relative z-10 p-8 flex-1 flex flex-col justify-end mt-32">
                {/* Title */}
                <Skeleton variant="text" height="32px" width="70%" className="mb-3" />

                {/* Description Lines */}
                <div className="space-y-2 mb-6">
                    <Skeleton variant="text" width="100%" />
                    <Skeleton variant="text" width="90%" />
                    <Skeleton variant="text" width="40%" />
                </div>

                {/* Progress Bar Container Skeleton */}
                <div className="mb-6 bg-gray-100/30 dark:bg-gray-900/40 p-4 rounded-xl backdrop-blur-md border border-white/10">
                    <div className="flex justify-between mb-2">
                        <Skeleton width="100px" height="14px" />
                        <Skeleton width="80px" height="14px" />
                    </div>
                    <Skeleton height="12px" borderRadius="9999px" className="bg-gray-200/50 dark:bg-gray-800" />
                </div>

                {/* Action Buttons Skeleton */}
                <div className="flex gap-4 mt-auto">
                    <Skeleton height="48px" className="flex-1 rounded-xl" />
                    <Skeleton width="48px" height="48px" className="rounded-xl" />
                </div>
            </div>
        </div>
    );
};

/**
 * Grid wrapper for displaying multiple skeletons during initial load.
 */
export const CampaignGridSkeleton = ({ count = 2 }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {Array.from({ length: count }).map((_, i) => (
                <CampaignCardSkeleton key={i} />
            ))}
        </div>
    );
};

export default CampaignCardSkeleton;
