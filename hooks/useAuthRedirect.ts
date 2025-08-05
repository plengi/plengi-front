'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function useAuthRedirect(authRedirect?: string, guestRedirect: string = '/login') {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const checkAuth = () => {
            try {
                // Usamos localStorage en lugar de AsyncStorage
                const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

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