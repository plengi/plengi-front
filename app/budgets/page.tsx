'use client';

import type React from "react";
import { useState } from 'react';
import Link from "next/link";
import TablaPresupuesto from './table';
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Building2, Calculator, FileText, Home, Settings, Users, Search, Bell, User, MapPin, Plus, MoreHorizontal, Eye, Edit, Trash2, Filter, ArrowUpDown, DollarSign, Briefcase, BarChart3, PieChart, Package, Truck, Wrench, HardHat, ClipboardList } from "lucide-react"

interface Presupuesto {
    id: number;
    codigo: string;
    nombre: string;
    descripcion: string;
    costo_total: number;
    costo_directo: number;
    costo_indirecto: number;
    porcentaje_administracion: number;
    porcentaje_utilidad: number;
    porcentaje_imprevistos: number;
}

export default function PresupuestoPage() {
    const { loading } = useAuthRedirect();
    const [presupuesto, setPresupuesto] = useState<Presupuesto[]>([]);

    if (loading) {
        return <div className="p-4 text-center">Cargando...</div>;
    }

    return (<>
        <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-2 border-b border-green-100 px-4 bg-gradient-to-r from-green-50 to-white">
            <SidebarTrigger className="-ml-1 text-green-600 hover:bg-green-100" />
            <div className="flex flex-1 items-center gap-4">
                <h1 className="text-3xl font-bold tracking-tight text-green-900">Presupuestos</h1>
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-green-500" />
                    <Input
                        placeholder="Buscar presupuesto"
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
                presupuesto={presupuesto}
                setPresupuesto={setPresupuesto}
            />
        </main>
    </>);
}