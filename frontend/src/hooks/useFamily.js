import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_URL } from '../config';

const getHeaders = () => {
    const token = localStorage.getItem('village_app_token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

export const useFamilyTree = () => {
    return useQuery({
        queryKey: ['family', 'tree'],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/family/tree`, { headers: getHeaders() });
            if (!res.ok) throw new Error('Failed to fetch family tree');
            return res.json();
        }
    });
};

export const useFamilyList = () => {
    return useQuery({
        queryKey: ['family', 'list'],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/family/`, { headers: getHeaders() });
            if (!res.ok) throw new Error('Failed to fetch family list');
            return res.json();
        }
    });
};

export const useAddFamilyMember = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (newMember) => {
            const res = await fetch(`${API_URL}/family/`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(newMember)
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.detail || 'Failed to add family member');
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['family'] });
        }
    });
};

export const useDeleteFamilyMember = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (memberId) => {
            const res = await fetch(`${API_URL}/family/${memberId}`, {
                method: 'DELETE',
                headers: getHeaders()
            });
            if (!res.ok) throw new Error('Failed to delete family member');
            return true;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['family'] });
        }
    });
};
