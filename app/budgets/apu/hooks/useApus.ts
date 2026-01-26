import { useState, useCallback } from 'react';
import apiClient from '@/app/api/apiClient';
import { Apus } from '../table';

export const useApus = () => {
    const [apus, setApus] = useState<Apus[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        start: 0,
        length: 10,
        totalRecords: 0,
        promedio: 0,
        total: 0
    });

    const fetchApus = useCallback(async (start?: number, length?: number) => {
        setLoading(true);
        try {
            const response = await apiClient.get(
                `/apus?start=${start ?? pagination.start}&length=${length ?? pagination.length}`
            );

            setApus(response.data.data);
            setPagination(prev => ({
                ...prev,
                start: start ?? prev.start,
                length: length ?? prev.length,
                totalRecords: response.data.iTotalRecords,
                promedio: parseFloat(response.data.valor_promedio),
                total: parseFloat(response.data.valor_total)
            }));

            return response.data;
        } catch (error) {
            console.error('Error fetching APUs:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [pagination.start, pagination.length]);

    const deleteApu = useCallback(async (id: number) => {
        try {
            await apiClient.delete('/apus', {
                data: { id }
            });
            return true;
        } catch (error) {
            console.error('Error deleting APU:', error);
            throw error;
        }
    }, []);

    return {
        apus,
        setApus,
        loading,
        pagination,
        fetchApus,
        deleteApu,
        setPagination
    };
};