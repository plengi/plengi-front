'use client';

import type React from "react";
import { useState } from 'react';
import ClienteForm from './form';
import TablaClientes from './table';
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuthRedirect } from '@/hooks/useAuthRedirect';

interface Cliente {
    id: number;
    nombres: string;
    apellidos: string;
    tipo_documento: string;
    numero_documento: string;
    direccion: string;
    email: string;
    telefono: string;
}

export default function ClientesPage() {
    const { loading } = useAuthRedirect();
    const [clientes, setClientes] = useState<Cliente[]>([]);

    if (loading) {
        return <div className="p-4 text-center">Cargando...</div>;
    }

    return (<>
        <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-2 border-b border-green-100 px-4 bg-gradient-to-r from-green-50 to-white">
            <SidebarTrigger className="-ml-1 text-green-600 hover:bg-green-100" />
            <div className="flex flex-1 items-center gap-4">
                <h1 className="text-3xl font-bold tracking-tight text-green-900">Clientes</h1>
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-green-500" />
                    <Input
                        placeholder="Buscar clientes"
                        className="pl-8 border-green-200 focus:border-green-400 focus:ring-green-400"
                    />
                </div>

                <ClienteForm
                    setClientes={setClientes}
                    mostrarBotonCrear={true}
                />
            </div>
        </header>
        <main className="flex-1 space-y-6 p-6 bg-gradient-to-br from-green-50/30 to-white">
            <p className="text-green-700">
                Gestiona y visualiza todos tus clientes
            </p>
            <TablaClientes
                clientes={clientes}
                setClientes={setClientes}
            />
        </main>
    </>);
}