'use client';

import type React from "react";
import { useState } from 'react';
import FormEmpresas from './form';
import TablaEmpresas from './table';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';

interface Empresa {
    razon_social: string;
    nit: string;
    direccion: string;
    email: string;
    telefono: string;
    updated_at: string;
    created_at: string;
    id: number;
    token_db: string;
    hash: string;
}

export default function CompanyPage() {
    const { loading } = useAuthRedirect();
    const [empresas, setEmpresas] = useState<Empresa[]>([]);

    if (loading) {
        return <div className="p-4 text-center">Cargando...</div>;
    }

    return (
        <main className="flex-1 space-y-6">
            
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-green-900">Empresas</h1>
                    <p className="text-green-700">Gestiona y visualiza todos tus empresas</p>
                </div>

                <FormEmpresas
                    setEmpresas={setEmpresas}
                    mostrarBotonCrear={true}
                />
                
            </div>

            <TablaEmpresas empresas={empresas} setEmpresas={setEmpresas}/>

        </main>
    );
}