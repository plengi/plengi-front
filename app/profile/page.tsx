'use client';

import { useAuthRedirect } from '@/hooks/useAuthRedirect';

export default function DashboardPage() {
    const { loading } = useAuthRedirect();

    if (loading) {
        return <div className="p-4 text-center">Cargando...</div>;
    }

    return (
        <div>
            <h1 className="text-2xl font-bold">Perfil</h1>
            <p>Bienvenido al pefil</p>
        </div>
    );
}