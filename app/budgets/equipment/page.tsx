'use client';

import type React from "react";
import { useState } from 'react';
import InsumoForm from '../insumos/form';
import InsumoTable from '../insumos/table';
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import { Wrench } from "lucide-react";

interface Insumo {
    id: number;
    nombre: string;
    unidad_medida: string;
    valor: number;
    tipo_proveedor: string;
    tipo_producto: number;
}

export default function EquiposPage() {
    const { loading } = useAuthRedirect();
    const [equipos, setEquipos] = useState<Insumo[]>([]);

    if (loading) {
        return <div className="p-4 text-center">Cargando...</div>;
    }

    return (<>
        <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-2 border-b border-green-100 px-4 bg-gradient-to-r from-green-50 to-white">
            <SidebarTrigger className="-ml-1 text-green-600 hover:bg-green-100" />
            <div className="flex flex-1 items-center gap-4">
                <h1 className="text-3xl font-bold tracking-tight text-green-900">Equipos</h1>
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-green-500" />
                    <Input
                        placeholder="Buscar equipos"
                        className="pl-8 border-green-200 focus:border-green-400 focus:ring-green-400"
                    />
                </div>

                <InsumoForm
                    setInsumos={setEquipos}
                    tipoProducto={1}
                    titulo="Equipo"
                    descripcion="Completa la información del equipo"
                    icon={<Wrench className="h-5 w-5 text-green-600" />}
                    mostrarBotonCrear={true}
                />
            </div>
        </header>
        <main className="flex-1 space-y-6 p-6 bg-gradient-to-br from-green-50/30 to-white">
            <p className="text-green-700">
                Gestiona y visualiza todos tus equipos de construcción
            </p>
            <InsumoTable
                insumos={equipos}
                setInsumos={setEquipos}
                tipoProducto={1}
                titulo="Equipos"
                descripcion="Lista completa de equipos disponibles para presupuestos"
                icon={<Wrench className="h-4 w-4" />}
            />
        </main>
    </>);
}