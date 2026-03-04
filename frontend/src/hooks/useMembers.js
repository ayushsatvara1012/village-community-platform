import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_URL } from '../config';

const fetchMembers = async (token) => {
    const res = await fetch(`${API_URL}/members/`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    if (!res.ok) throw new Error('Failed to fetch members');
    return res.json();
};

const fetchPendingMembers = async (token) => {
    if (!token) return [];
    const res = await fetch(`${API_URL}/members/pending`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) return [];
    return res.json();
};

export function useMembers() {
    const token = localStorage.getItem('village_app_token');
    return useQuery({
        queryKey: ['members'],
        queryFn: () => fetchMembers(token),
    });
}

export function usePendingMembers(isAdmin) {
    const token = localStorage.getItem('village_app_token');
    return useQuery({
        queryKey: ['members', 'pending'],
        queryFn: () => fetchPendingMembers(token),
        enabled: !!token && isAdmin,
    });
}

export function useApproveMember() {
    const queryClient = useQueryClient();
    const token = localStorage.getItem('village_app_token');

    return useMutation({
        mutationFn: async ({ memberId, comment }) => {
            const res = await fetch(`${API_URL}/members/${memberId}/approve`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ comment: comment || 'Application approved' })
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.detail || 'Approve failed');
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['members'] });
        },
    });
}

export function useRejectMember() {
    const queryClient = useQueryClient();
    const token = localStorage.getItem('village_app_token');

    return useMutation({
        mutationFn: async ({ memberId, comment }) => {
            const res = await fetch(`${API_URL}/members/${memberId}/reject`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ comment })
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.detail || 'Reject failed');
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['members', 'pending'] });
        },
    });
}

export function useUpdateMemberPosition() {
    const queryClient = useQueryClient();
    const token = localStorage.getItem('village_app_token');

    return useMutation({
        mutationFn: async ({ memberId, position }) => {
            const res = await fetch(`${API_URL}/members/${memberId}/position`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ position })
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.detail || 'Failed to update position');
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['members'] });
        },
    });
}
