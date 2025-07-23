'use client';

import { useAuthRedirect } from '@/hooks/useAuthRedirect';

export default function HomePage() {
    const { loading } = useAuthRedirect('/dashboard', '/login');

    return (
        <div className="p-4 text-center">
            {loading ? 'Cargando...' : 'Redireccionando...'}
        </div>
    );
}
