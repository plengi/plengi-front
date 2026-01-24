'use client';

import Link from "next/link";
import type React from "react";
import apiClient from '@/app/api/apiClient';
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowUpDown, Package, Plus, MoreHorizontal, Eye, Edit, Trash2, Unplug, Loader2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, BarChart3, PieChart } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export interface Presupuesto {
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

interface TablaPresupuestoProps {
    presupuestos: Presupuesto[];
    loading: boolean;
    pagination: {
        page: number;
        perPage: number;
        total: number;
        totalPages: number;
    };
    onPageChange: (page: number) => void;
    onDelete: () => void;
}

const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("es-CL", {
        style: "currency",
        currency: "CLP",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(price);
};

export default function TablaPresupuesto({ presupuestos, loading, pagination, onPageChange, onDelete }: TablaPresupuestoProps) {
    const { toast } = useToast();
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedBudget, setSelectedBudget] = useState<Presupuesto | null>(null);

    const handleDeleteClick = (presupuesto: Presupuesto) => {
        setSelectedBudget(presupuesto);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!selectedBudget) return;

        setDeletingId(selectedBudget.id);
        setDeleteDialogOpen(false);

        try {
            const response = await apiClient.delete('/budgets', {
                data: { id: selectedBudget.id }
            });

            if (response.data.success) {
                toast({
                    variant: "success",
                    title: "Presupuesto eliminado",
                    description: `El presupuesto "${selectedBudget.nombre}" ha sido eliminado correctamente.`,
                });
                onDelete(); // Recargar la lista
            } else {
                throw new Error(response.data.message || 'Error al eliminar');
            }
        } catch (error) {
            console.error('Error al eliminar presupuesto:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "No se pudo eliminar el presupuesto.",
            });
        } finally {
            setDeletingId(null);
            setSelectedBudget(null);
        }
    };

    if (loading) {
        return (
            <Card className="border-green-200">
                <CardContent className="p-6">
                    <div className="flex justify-center items-center">
                        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
                        <span className="ml-2 text-green-700">Cargando presupuestos...</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <Card className="border-green-200">
                <CardHeader>
                    <CardTitle className="text-green-900">Lista de Presupuestos</CardTitle>
                    <CardDescription className="text-green-600">
                        Todos los presupuestos organizados por proyecto y categoría
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-hidden rounded-lg border border-green-200">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-green-50">
                                    <TableHead className="text-green-800">Nombre</TableHead>
                                    <TableHead className="text-green-800">Proyecto</TableHead>
                                    <TableHead className="text-green-800">Cliente</TableHead>
                                    <TableHead className="text-green-800">Costo Directo</TableHead>
                                    <TableHead className="text-green-800">Costo Indirecto</TableHead>
                                    <TableHead className="text-green-800">Total</TableHead>
                                    <TableHead className="text-green-800">Fecha Creación</TableHead>
                                    <TableHead className="text-green-800 w-[100px]">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {presupuestos.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-4 text-green-600">
                                            No se encontraron presupuestos.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    presupuestos.map((presupuesto) => (
                                        <TableRow key={presupuesto.id} className="hover:bg-green-50/50">
                                            <TableCell className="font-medium text-green-900">{presupuesto.nombre}</TableCell>
                                            <TableCell>{presupuesto.proyecto || 'N/A'}</TableCell>
                                            <TableCell>{presupuesto.cliente || 'N/A'}</TableCell>
                                            <TableCell>{formatPrice(parseFloat(presupuesto.costo_directo_total))}</TableCell>
                                            <TableCell>
                                                { formatPrice(
                                                    parseFloat(presupuesto.costo_indirecto_administracion) +
                                                    parseFloat(presupuesto.costo_indirecto_imprevistos) +
                                                    parseFloat(presupuesto.costo_indirecto_utilidad)
                                                ) }
                                            </TableCell>
                                            <TableCell className="font-semibold">{formatPrice(parseFloat(presupuesto.presupuesto_total))}</TableCell>
                                            <TableCell>{new Date(presupuesto.created_at).toLocaleDateString('es-CL')}</TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <span className="sr-only">Abrir menú</span>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/budgets/view/${presupuesto.id}`} className="cursor-pointer">
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                Ver Detalles
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/budgets/edit/${presupuesto.id}`} className="cursor-pointer">
                                                                <Edit className="mr-2 h-4 w-4" />
                                                                Editar
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem 
                                                            onClick={() => handleDeleteClick(presupuesto)}
                                                            className="text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                                                            disabled={deletingId === presupuesto.id}
                                                        >
                                                            {deletingId === presupuesto.id ? (
                                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                            )}
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
                    </div>

                    {/* Paginación */}
                    {pagination.totalPages > 1 && (
                        <div className="flex items-center justify-between px-2 py-4">
                            <div className="text-sm text-green-700">
                                Mostrando {((pagination.page - 1) * pagination.perPage) + 1} a {Math.min(pagination.page * pagination.perPage, pagination.total)} de {pagination.total} resultados
                            </div>
                            <div className="flex items-center space-x-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => onPageChange(1)}
                                    disabled={pagination.page === 1}
                                    className="border-green-300 text-green-700 hover:bg-green-50"
                                >
                                    <ChevronsLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => onPageChange(pagination.page - 1)}
                                    disabled={pagination.page === 1}
                                    className="border-green-300 text-green-700 hover:bg-green-50"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <span className="text-sm font-medium text-green-900">
                                    Página {pagination.page} de {pagination.totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => onPageChange(pagination.page + 1)}
                                    disabled={pagination.page === pagination.totalPages}
                                    className="border-green-300 text-green-700 hover:bg-green-50"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => onPageChange(pagination.totalPages)}
                                    disabled={pagination.page === pagination.totalPages}
                                    className="border-green-300 text-green-700 hover:bg-green-50"
                                >
                                    <ChevronsRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent className="border-red-200">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-red-900">¿Estás seguro de eliminar este presupuesto?</AlertDialogTitle>
                        <AlertDialogDescription className="text-red-600">
                            Esta acción no se puede deshacer. Se eliminará permanentemente el presupuesto "{selectedBudget?.nombre}" y todos sus datos asociados.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="border-green-300 text-green-700 hover:bg-green-50">
                            Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={confirmDelete}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}