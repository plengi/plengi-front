'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useAuthRedirect(authRedirect?: string, guestRedirect: string = '/login') {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                // const token = await AsyncStorage.getItem('authToken');
                const token = true;

                if (token) {
                    setIsAuthenticated(true);
                    if (authRedirect) {
                        router.replace(authRedirect);
                    }
                } else {
                    setIsAuthenticated(false);
                    router.replace(guestRedirect);
                }
            } catch (error) {
                console.error('Error al verificar autenticación:', error);
                router.replace(guestRedirect);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, [router, authRedirect, guestRedirect]);

    return { loading, isAuthenticated };
}