import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { API_URL } from '../config';

const fetchStats = async () => {
    const res = await fetch(`${API_URL}/payments/stats`);
    if (!res.ok) throw new Error('Failed to fetch stats');
    return res.json();
};

const fetchChartData = async (filters, token) => {
    const params = new URLSearchParams();
    if (filters.start_date) params.append('start_date', filters.start_date);
    if (filters.end_date) params.append('end_date', filters.end_date);
    if (filters.month) params.append('month', filters.month);
    if (filters.year) params.append('year', filters.year);

    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    const res = await fetch(`${API_URL}/payments/chart?${params.toString()}`, { headers });
    if (!res.ok) throw new Error('Failed to fetch chart data');
    return res.json();
};

const fetchDonations = async ({ pageParam = 0, filters }) => {
    const params = new URLSearchParams({ limit: 10, offset: pageParam });
    if (filters.sort_by) params.append('sort_by', filters.sort_by);
    if (filters.order) params.append('order', filters.order);
    if (filters.start_date) params.append('start_date', filters.start_date);
    if (filters.end_date) params.append('end_date', filters.end_date);

    const res = await fetch(`${API_URL}/payments/recent-donations?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch donations');
    return res.json();
};

export function useStats() {
    return useQuery({
        queryKey: ['payments', 'stats'],
        queryFn: fetchStats,
    });
}

export function useChartData(filters) {
    const token = localStorage.getItem('village_app_token');
    return useQuery({
        queryKey: ['payments', 'chart', filters],
        queryFn: () => fetchChartData(filters, token),
    });
}

export function useDonations(filters) {
    return useInfiniteQuery({
        queryKey: ['payments', 'recent', filters],
        queryFn: ({ pageParam }) => fetchDonations({ pageParam, filters }),
        getNextPageParam: (lastPage, allPages) => {
            return lastPage.length === 10 ? allPages.length * 10 : undefined;
        },
    });
}
