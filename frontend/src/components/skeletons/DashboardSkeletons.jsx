import Skeleton from '../ui/Skeleton';

export const StatsCardSkeleton = () => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-4 w-24" />
        </div>
        <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-5 w-12 rounded-full" />
        </div>
    </div>
);

export const ChartSkeleton = () => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 h-[420px] flex flex-col">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <Skeleton className="h-7 w-48" />
            <div className="flex gap-2">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-40" />
            </div>
        </div>
        <div className="flex-1 w-full bg-gray-50/50 dark:bg-gray-900/50 rounded-lg relative overflow-hidden">
            <Skeleton className="absolute inset-0 w-full h-full" />
            {/* Optional: Add some grid line skeletons inside */}
            <div className="absolute inset-0 flex flex-col justify-between p-4 opacity-20">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-px bg-gray-300 dark:bg-gray-700 w-full" />
                ))}
            </div>
        </div>
    </div>
);

export const PendingMemberSkeleton = () => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
            <Skeleton className="h-10 w-10 rounded-full shrink-0" />
            <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
            </div>
        </div>
        <div className="flex gap-2">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
    </div>
);

export const DashboardSkeleton = ({ isAdmin }) => (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
        {/* Header */}
        <div className="flex justify-between items-end mb-8">
            <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-10 w-32" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
        </div>

        {/* Content Grid */}
        <div className={`grid grid-cols-1 ${isAdmin ? 'lg:grid-cols-5' : ''} gap-8`}>
            <div className={isAdmin ? 'lg:col-span-3' : ''}>
                <ChartSkeleton />
            </div>
            {isAdmin && (
                <div className="lg:col-span-2 space-y-4">
                    <Skeleton className="h-6 w-32 mb-4" />
                    <PendingMemberSkeleton />
                    <PendingMemberSkeleton />
                    <PendingMemberSkeleton />
                </div>
            )}
        </div>
    </div>
);
