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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
    ArrowUpDown, Package, Plus, MoreHorizontal, Eye, Edit, Trash2,
    Loader2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight
} from "lucide-react";
import { formatPrice, getTypeColor, calculatePagination, handleDeleteApu } from "./utils/apuUtils";

export interface Apus {
    id: number;
    codigo: string;
    nombre: string;
    descripcion: string;
    tipo_actividad: string;
    unidad_medida: number;
    valor_total: number;
}

interface TablaApusProps {
    apus: Apus[];
    setApus: React.Dispatch<React.SetStateAction<Apus[]>>;
}

export default function TableApus({ apus, setApus }: TablaApusProps) {
    const { toast } = useToast();
    const [start, setStart] = useState(0);
    const [length, setLength] = useState(10);
    const [totalRecords, setTotalRecords] = useState(0);
    const [promedioApus, setPromedioApus] = useState(0);
    const [totalApus, setTotalApus] = useState(0);
    const [loadingApus, setLoadingApus] = useState(true);
    const [apuAEliminar, setAPUAEliminar] = useState<number | null>(null);
    const [loadingAPUHash, setLoadingAPUHash] = useState<String | null>(null);

    const fetchApus = async () => {
        setLoadingApus(true);
        try {
            const response = await apiClient.get(`/apus?start=${start}&length=${length}`);
            setApus(response.data.data);
            setTotalRecords(response.data.iTotalRecords);
            setPromedioApus(parseFloat(response.data.valor_promedio));
            setTotalApus(parseFloat(response.data.valor_total));
        } catch (err) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "No se pudieron cargar los APUs.",
            });
        } finally {
            setLoadingApus(false);
        }
    };

    useEffect(() => {
        fetchApus();
    }, [start, length]);

    const pagination = calculatePagination(start, length, totalRecords);

    const handlePreviousPage = () => {
        if (start - length >= 0) {
            setStart(start - length);
        }
    };

    const handleNextPage = () => {
        if (start + length < totalRecords) {
            setStart(start + length);
        }
    };

    const handleFirstPage = () => {
        setStart(0);
    };

    const handleLastPage = () => {
        const lastPageStart = Math.floor((totalRecords - 1) / length) * length;
        setStart(lastPageStart);
    };

    const eliminarAPU = (id_apu: number) => {
        setAPUAEliminar(id_apu);
    };

    const confirmarEliminacion = async () => {
        if (!apuAEliminar) return;

        try {
            setLoadingAPUHash(apuAEliminar.toString());
            await handleDeleteApu(apuAEliminar, apiClient, toast, fetchApus);
        } finally {
            setLoadingAPUHash(null);
            setAPUAEliminar(null);
        }
    };

    return (
        <>
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-3">
                <Card className="border-green-200 bg-gradient-to-br from-white to-green-50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-green-800">Total Apus</CardTitle>
                        <Package className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-900">{totalRecords}</div>
                        <p className="text-xs text-green-600">Apus disponibles</p>
                    </CardContent>
                </Card>

                <Card className="border-green-200 bg-gradient-to-br from-white to-green-50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-green-800">Valor Promedio</CardTitle>
                        <ArrowUpDown className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-900">{formatPrice(promedioApus)}</div>
                        <p className="text-xs text-green-600">Por unidad</p>
                    </CardContent>
                </Card>

                <Card className="border-green-200 bg-gradient-to-br from-white to-green-50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-green-800">Valor Total</CardTitle>
                        <ArrowUpDown className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-900">{formatPrice(totalApus)}</div>
                        <p className="text-xs text-green-600">Suma total</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-green-200">
                <CardHeader>
                    <CardTitle className="text-green-900">Lista de apus</CardTitle>
                    <CardDescription className="text-green-700">
                        Lista completa de apus disponibles para presupuestos
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-hidden rounded-lg border border-green-200">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-green-50">
                                    <TableHead className="text-green-800">Código</TableHead>
                                    <TableHead className="text-green-800">Actividad</TableHead>
                                    <TableHead className="text-green-800">Unidad</TableHead>
                                    <TableHead className="text-green-800">Precio Unitario</TableHead>
                                    <TableHead className="text-green-800">Tipo de Actividad</TableHead>
                                    <TableHead className="text-green-800 w-[100px]">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loadingApus ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center">
                                            <Loader2 className="h-8 w-8 animate-spin mx-auto text-green-600" />
                                        </TableCell>
                                    </TableRow>
                                ) : apus.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center text-green-900">
                                            No hay apus registradas
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    apus.map((apu) => (
                                        <TableRow key={apu.id} className="hover:bg-green-50/50">
                                            <TableCell className="font-medium text-green-900">{apu.codigo}</TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <div className="font-medium text-green-900">{apu.nombre}</div>
                                                    {apu.descripcion && (
                                                        <div className="text-xs text-green-600 max-w-xs truncate">{apu.descripcion}</div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-green-800">{apu.unidad_medida}</TableCell>
                                            <TableCell className="text-green-800 font-medium">{formatPrice(apu.valor_total)}</TableCell>
                                            <TableCell>
                                                <Badge className={getTypeColor(apu.tipo_actividad)} variant="outline">
                                                    {apu.tipo_actividad}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                        <DropdownMenuItem>
                                                            <Edit className="h-4 w-4 mr-2" />
                                                            <Link href={`/budgets/apu/edit/${apu.id}`}>
                                                                Editar
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            className="text-red-600"
                                                            onClick={() => eliminarAPU(apu.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                            Eliminar
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>

                        {totalRecords > 0 && (
                            <div className="flex items-center justify-between px-4 py-2 bg-green-50 border-t border-green-200">
                                <div className="text-sm text-green-700">
                                    Mostrando {start + 1} a {Math.min(start + length, totalRecords)} de {totalRecords} apus
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleFirstPage}
                                        disabled={start === 0}
                                        className="text-green-700 border-green-300 hover:bg-green-100"
                                    >
                                        <ChevronsLeft className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handlePreviousPage}
                                        disabled={start === 0}
                                        className="text-green-700 border-green-300 hover:bg-green-100"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <span className="text-sm text-green-700">
                                        Página {pagination.currentPage} de {pagination.totalPages}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleNextPage}
                                        disabled={start + length >= totalRecords}
                                        className="text-green-700 border-green-300 hover:bg-green-100"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleLastPage}
                                        disabled={start + length >= totalRecords}
                                        className="text-green-700 border-green-300 hover:bg-green-100"
                                    >
                                        <ChevronsRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <ConfirmDialog
                open={apuAEliminar !== null}
                onOpenChange={(open) => !open && setAPUAEliminar(null)}
                onConfirm={confirmarEliminacion}
                title="¿Estás seguro de eliminar este APU?"
                description="Esta acción no se puede deshacer. El APU será eliminado permanentemente."
                confirmText="Eliminar"
                loading={loadingAPUHash === apuAEliminar?.toString()}
            />
        </>
    );
}