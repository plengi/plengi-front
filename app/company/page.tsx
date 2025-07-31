'use client';

import type React from "react";
import { useState } from 'react';
import FormEmpresas from './form';
import TablaEmpresas from './table';
import { SidebarTrigger } from "@/components/ui/sidebar";
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

    return (<>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-green-100 px-4 bg-gradient-to-r from-green-50 to-white">
            <SidebarTrigger className="-ml-1 text-green-600 hover:bg-green-100" />
            <div className="flex flex-1 items-center gap-4">
                <div className="relative flex-1">
                    <h1 className="text-3xl font-bold tracking-tight text-green-900">Empresas</h1>
                </div>
                <FormEmpresas
                    setEmpresas={setEmpresas}
                    mostrarBotonCrear={true}
                />
            </div>
        </header>
        <main className="flex-1 space-y-6 p-6 bg-gradient-to-br from-green-50/30 to-white">
            <p className="text-green-700">Gestiona y visualiza todos tus empresas</p>
            <TablaEmpresas empresas={empresas} setEmpresas={setEmpresas}/>
        </main>
    </>);
}