'use client';

import Link from "next/link";
import type React from "react";
import apiClient from '@/app/api/apiClient';
import { useEffect, useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowUpDown, Package, Plus, MoreHorizontal, Eye, Edit, Trash2, Unplug, Loader2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, BarChart3, PieChart } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export interface Presupuesto {
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

interface TablaPresupuestoProps {
    presupuesto: Presupuesto[];
    setPresupuesto: React.Dispatch<React.SetStateAction<Presupuesto[]>>;
}

export default function TablePresupuesto({ presupuesto, setPresupuesto }: TablaPresupuestoProps) {
    return (<>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="border-green-200 bg-gradient-to-br from-white to-green-50 hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                    <CardTitle className="text-green-900 flex items-center gap-2 text-lg">
                    <BarChart3 className="h-5 w-5 text-green-600" />
                    Análisis de Precios Unitarios
                    </CardTitle>
                    <CardDescription className="text-green-600">
                    Gestiona y analiza los precios unitarios de tus actividades
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                    <div className="text-sm text-green-700">APU disponibles</div>
                    <Badge className="bg-green-100 text-green-800">24</Badge>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-green-200 bg-gradient-to-br from-white to-green-50 hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                    <CardTitle className="text-green-900 flex items-center gap-2 text-lg">
                    <PieChart className="h-5 w-5 text-green-600" />
                    Análisis de Precios Globales
                    </CardTitle>
                    <CardDescription className="text-green-600">
                    Análisis global de costos y distribución de presupuestos
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                    <div className="text-sm text-green-700">APG activos</div>
                    <Badge className="bg-green-100 text-green-800">8</Badge>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-green-200 bg-gradient-to-br from-white to-green-50 hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                    <CardTitle className="text-green-900 flex items-center gap-2 text-lg">
                    <Package className="h-5 w-5 text-green-600" />
                    Gestión de Insumos
                    </CardTitle>
                    <CardDescription className="text-green-600">
                    Administra materiales, equipos, transporte y mano de obra
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                    <div className="text-sm text-green-700">Total insumos</div>
                    <Badge className="bg-green-100 text-green-800">156</Badge>
                    </div>
                </CardContent>
            </Card>
        </div>

        <Card className="border-green-200">
            <CardHeader>
                <CardTitle className="text-green-900">Lista de Presupuestos</CardTitle>
                <p className="text-green-700">
                    Todos los presupuestos organizados por proyecto y categoría
                </p>
            </CardHeader>
            <CardContent>
                <div className="overflow-hidden rounded-lg border border-green-200">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-green-50">
                                <TableHead className="text-green-800">Código</TableHead>
                                <TableHead className="text-green-800">Nombre</TableHead>
                                <TableHead className="text-green-800">Descripción</TableHead>
                                <TableHead className="text-green-800">Costo Total</TableHead>
                                <TableHead className="text-green-800">Costo Directo</TableHead>
                                <TableHead className="text-green-800">Costo Indirecto</TableHead>
                                <TableHead className="text-green-800 w-[100px]">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                    </Table>
                </div>
            </CardContent>
        </Card>
    </>)
}