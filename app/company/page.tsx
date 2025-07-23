'use client';

import { useAuthRedirect } from '@/hooks/useAuthRedirect';

export default function CompanyPage() {
    const { loading } = useAuthRedirect();

    if (loading) {
        return <div className="p-4 text-center">Cargando...</div>;
    }

    return (
        <div>
            <h1 className="text-2xl font-bold">Empresa</h1>
            <p>Bienvenido a empresas.</p>
        </div>
    );
}