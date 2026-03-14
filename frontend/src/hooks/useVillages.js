import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { API_URL } from '../config';

const fetchVillages = async () => {
    const res = await fetch(`${API_URL}/villages/`);
    if (!res.ok) throw new Error('Failed to fetch villages');
    return res.json();
};

export function useVillages() {
    return useQuery({
        queryKey: ['villages'],
        queryFn: fetchVillages,
    });
}

export function useAddVillage() {
    const queryClient = useQueryClient();
    const token = localStorage.getItem('village_app_token');

    return useMutation({
        mutationFn: async (newVillage) => {
            const res = await fetch(`${API_URL}/villages/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newVillage)
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.detail || 'Failed to add village');
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['villages'] });
        },
    });
}

export function useUpdateVillage() {
    const queryClient = useQueryClient();
    const token = localStorage.getItem('village_app_token');

    return useMutation({
        mutationFn: async ({ id, data }) => {
            const res = await fetch(`${API_URL}/villages/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.detail || 'Failed to update village');
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['villages'] });
        },
    });
}

export function useDeleteVillage() {
    const queryClient = useQueryClient();
    const token = localStorage.getItem('village_app_token');

    return useMutation({
        mutationFn: async (id) => {
            const res = await fetch(`${API_URL}/villages/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.detail || 'Failed to delete village');
            }
            return res.ok;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['villages'] });
        },
    });
}
