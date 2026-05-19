'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import TablaPresupuesto from './table';
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import { Card, CardContent } from "@/components/ui/card";
import { Search, Plus, Calculator } from "lucide-react";
import apiClient from '@/app/api/apiClient';

interface Presupuesto {
    id: number;
    nombre: string;
    descripcion: string;
    proyecto: string;
    cliente: string;
    costo_directo_total: string;
    costo_indirecto_administracion: string;
    costo_indirecto_imprevistos: string;
    costo_indirecto_utilidad: string;
    presupuesto_total: string;
    created_at: string;
    updated_at: string;
}

export default function PresupuestoPage() {
    const { loading: authLoading } = useAuthRedirect();
    const { toast } = useToast();

    const [presupuestos, setPresupuestos] = useState<Presupuesto[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    const [pagination, setPagination] = useState({
        page: 1,
        perPage: 10,
        total: 0,
        totalPages: 0,
    });

    // 🔥 Fetch principal
    const fetchPresupuestos = async (page = 1, searchTerm = '') => {
        setLoading(true);
        try {
            const response = await apiClient.get('/budgets', {
                params: {
                    start: (page - 1) * pagination.perPage,
                    length: pagination.perPage,
                    search: searchTerm,
                }
            });

            if (response.data.success) {
                const total = response.data.iTotalDisplayRecords;

                setPresupuestos(response.data.data);
                setPagination(prev => ({
                    ...prev,
                    page,
                    total,
                    totalPages: Math.ceil(total / prev.perPage),
                }));
            } else {
                throw new Error(response.data.message);
            }

        } catch (error) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'No se pudieron cargar los presupuestos.',
            });
        } finally {
            setLoading(false);
        }
    };

    // 🔎 Debounce de búsqueda
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPagination(prev => ({ ...prev, page: 1 }));
        }, 500);

        return () => clearTimeout(timer);
    }, [search]);

    // 📦 Único efecto que ejecuta el fetch
    useEffect(() => {
        if (!authLoading) {
            fetchPresupuestos(pagination.page, debouncedSearch);
        }
    }, [authLoading, pagination.page, debouncedSearch]);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            setPagination(prev => ({ ...prev, page: newPage }));
        }
    };

    if (authLoading) {
        return <div className="p-4 text-center">Cargando...</div>;
    }

    return (
        <>
            <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-2 border-b border-green-100 px-4 bg-gradient-to-r from-green-50 to-white">
                <SidebarTrigger className="-ml-1 text-green-600 hover:bg-green-100" />

                <div className="flex flex-1 items-center gap-4">
                    <h1 className="text-3xl font-bold tracking-tight text-green-900">
                        Presupuestos
                    </h1>

                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-green-500" />
                        <Input
                            placeholder="Buscar presupuesto"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-8 border-green-200 focus:border-green-400 focus:ring-green-400"
                        />
                    </div>

                    <Link href="/budgets/new">
                        <Button className="gap-2 bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-200">
                            <Plus className="h-4 w-4" />
                            Nuevo Presupuesto
                        </Button>
                    </Link>
                </div>
            </header>

            <main className="flex-1 space-y-6 p-6 bg-gradient-to-br from-green-50/30 to-white">
                <p className="text-green-700">
                    Gestiona y visualiza todos los presupuestos de tus proyectos
                </p>

                {presupuestos.length === 0 && !loading ? (
                    <Card className="border-green-200">
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Calculator className="h-12 w-12 text-green-400 mb-4" />

                            <h3 className="text-lg font-medium text-green-900 mb-2">
                                No se encontraron presupuestos
                            </h3>

                            <p className="text-green-600 text-center mb-4">
                                No hay presupuestos que coincidan con los criterios de búsqueda.
                            </p>

                            <Link href="/budgets/new">
                                <Button className="gap-2 bg-green-600 hover:bg-green-700 text-white">
                                    <Plus className="h-4 w-4" />
                                    Crear Presupuesto
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <TablaPresupuesto
                        presupuestos={presupuestos}
                        loading={loading}
                        pagination={pagination}
                        onPageChange={handlePageChange}
                        onDelete={() => fetchPresupuestos(pagination.page, debouncedSearch)}
                    />
                )}
            </main>
        </>
    );
}
