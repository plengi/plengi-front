'use client';

import { useState } from 'react';
import TablaAPU from './table';
import Link from "next/link";
import { Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import { useApus } from './hooks/useApus';

export default function ApusPage() {
    const { loading: authLoading } = useAuthRedirect();
    const { apus, setApus, loading: apusLoading, fetchApus } = useApus();

    if (authLoading) {
        return <div className="p-4 text-center">Cargando...</div>;
    }

    return (
        <>
            <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-2 border-b border-green-100 px-4 bg-gradient-to-r from-green-50 to-white">
                <SidebarTrigger className="-ml-1 text-green-600 hover:bg-green-100" />
                <div className="flex flex-1 items-center gap-4">
                    <h1 className="text-3xl font-bold tracking-tight text-green-900">Análisis de Precios Unitarios (APU)</h1>
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-green-500" />
                        <Input
                            placeholder="Buscar apus"
                            className="pl-8 border-green-200 focus:border-green-400 focus:ring-green-400"
                        />
                    </div>

                    <Link href="/budgets/apu/new">
                        <Button className="gap-2 bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-200">
                            <Plus className="h-4 w-4" />
                            Nuevo APU
                        </Button>
                    </Link>
                </div>
            </header>
            <main className="flex-1 space-y-6 p-6 bg-gradient-to-br from-green-50/30 to-white">
                <p className="text-green-700">
                    Gestiona el catálogo de análisis de precios unitarios para tus proyectos
                </p>
                <TablaAPU
                    apus={apus}
                    setApus={setApus}
                />
            </main>
        </>
    );
}