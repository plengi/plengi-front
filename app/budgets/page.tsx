'use client';

import type React from "react";
import { useState, useEffect } from 'react';
import Link from "next/link";
import TablaPresupuesto from './table';
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Building2, Calculator, FileText, Home, Settings, Users, Search, Bell, User, MapPin, Plus, MoreHorizontal, Eye, Edit, Trash2, Filter, ArrowUpDown, DollarSign, Briefcase, BarChart3, PieChart, Package, Truck, Wrench, HardHat, ClipboardList, Loader2 } from "lucide-react"
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
    const [pagination, setPagination] = useState({
        page: 1,
        perPage: 10,
        total: 0,
        totalPages: 0,
    });

    // Función para cargar los presupuestos
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
                setPresupuestos(response.data.data);
                setPagination(prev => ({
                    ...prev,
                    page,
                    total: response.data.iTotalDisplayRecords,
                    totalPages: Math.ceil(response.data.iTotalDisplayRecords / prev.perPage)
                }));
            } else {
                throw new Error(response.data.message || 'Error al cargar presupuestos');
            }
        } catch (error) {
            console.error('Error al cargar presupuestos:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'No se pudieron cargar los presupuestos.',
            });
        } finally {
            setLoading(false);
        }
    };

    // Efecto para cargar los presupuestos al inicio y cuando cambia la página o búsqueda
    useEffect(() => {
        if (!authLoading) {
            fetchPresupuestos(pagination.page, search);
        }
    }, [authLoading, pagination.page]);

    // Efecto para búsqueda con debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            if (!authLoading) {
                fetchPresupuestos(1, search);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [search, authLoading]);

    if (authLoading) {
        return <div className="p-4 text-center">Cargando...</div>;
    }

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            setPagination(prev => ({ ...prev, page: newPage }));
        }
    };

    return (
        <>
            <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-2 border-b border-green-100 px-4 bg-gradient-to-r from-green-50 to-white">
                <SidebarTrigger className="-ml-1 text-green-600 hover:bg-green-100" />
                <div className="flex flex-1 items-center gap-4">
                    <h1 className="text-3xl font-bold tracking-tight text-green-900">Presupuestos</h1>
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

                <TablaPresupuesto
                    presupuestos={presupuestos}
                    loading={loading}
                    pagination={pagination}
                    onPageChange={handlePageChange}
                    onDelete={() => fetchPresupuestos(pagination.page, search)} // Recargar después de eliminar
                />
            </main>
        </>
    );
}