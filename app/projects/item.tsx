'use client';

import type React from "react";
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Building2, MapPin, MoreHorizontal, Eye, Edit, Trash2, Calculator, User } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import apiClient from '@/app/api/apiClient';
import AddBudgetModal from './components/AddBudgetModal';

interface Proyecto {
    id: number;
    nombre: string;
    descripcion: string;
    id_cliente: number;
    cliente_nombre: string;
    id_ubicacion: string;
    ubicacion_nombre: string;
    fecha_inicio: string;
    estado: string;
    valor_total: number;
    budgets?: Array<{
        id: number;
        nombre: string;
        valor_total: number;
        estado: string;
    }>;
    budgets_count: number;
}

interface ProjectsItemProps {
    proyecto: Proyecto;
    setProyectoEditar: (proyecto: Proyecto) => void;
    onEliminar: (id: number) => void;
    onBudgetAdded: (proyectoId: number) => void; // Nueva prop para recargar proyectos
}

export default function ProjectsItem({ proyecto, setProyectoEditar, onEliminar, onBudgetAdded }: ProjectsItemProps) {
    const { toast } = useToast();
    const [proyectoAEliminar, setProyectoAEliminar] = useState<number | null>(null);
    const [loadingEliminar, setLoadingEliminar] = useState(false);
    const [addBudgetModalOpen, setAddBudgetModalOpen] = useState(false);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "aprobado":
                return "bg-green-100 text-green-800 border-green-300";
            case "en_progreso":
                return "bg-blue-100 text-blue-800 border-blue-300";
            case "en_revision":
                return "bg-yellow-100 text-yellow-800 border-yellow-300";
            case "planificacion":
                return "bg-purple-100 text-purple-800 border-purple-300";
            case "completado":
                return "bg-gray-100 text-gray-800 border-gray-300";
            default:
                return "bg-gray-100 text-gray-800 border-gray-300";
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case "aprobado": return "Aprobado";
            case "en_progreso": return "En progreso";
            case "en_revision": return "En revisión";
            case "planificacion": return "Planificación";
            case "completado": return "Completado";
            default: return status;
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    const confirmarEliminacion = async () => {
        if (!proyectoAEliminar) return;

        setLoadingEliminar(true);
        try {
            await apiClient.delete('/proyectos', {
                data: { id: proyectoAEliminar }
            });

            toast({
                variant: "success",
                title: "Proyecto eliminado",
                description: "El proyecto ha sido eliminado correctamente.",
            });
            
            onEliminar(proyectoAEliminar);
            
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.response?.data?.message || "Error al eliminar el proyecto.",
            });
        } finally {
            setLoadingEliminar(false);
            setProyectoAEliminar(null);
        }
    };

    const eliminarProyecto = (id: number) => {
        setProyectoAEliminar(id);
    };

    const handleBudgetAdded = () => {
        // Cierra el modal y recarga los datos del proyecto
        setAddBudgetModalOpen(false);
        onBudgetAdded(proyecto.id);
    };

    return (
        <>
            <Card key={proyecto.id} className="border-green-200 hover:shadow-lg transition-shadow">
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div className="space-y-2">
                            <CardTitle className="text-green-900 flex items-center gap-2">
                                <Building2 className="h-5 w-5 text-green-600" />
                                {proyecto.nombre}
                            </CardTitle>
                            <div className="flex items-center gap-4 text-sm text-green-700">
                                <div className="flex items-center gap-1">
                                    <MapPin className="h-4 w-4" />
                                    {proyecto.ubicacion_nombre}
                                </div>
                                <div className="flex items-center gap-1">
                                    <User className="h-4 w-4" />
                                    {proyecto.cliente_nombre}
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-green-900">
                                {formatCurrency(proyecto.valor_total)}
                            </div>
                            <div className="text-sm text-green-600">Valor Total</div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <h4 className="text-sm font-medium text-green-800 mb-3">
                                Presupuestos del Proyecto ({proyecto.budgets_count || 0})
                            </h4>
                            {(proyecto.budgets && proyecto.budgets.length > 0) ? (
                                <div className="overflow-hidden rounded-lg border border-green-200">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-green-50">
                                                <TableHead className="text-green-800">Presupuesto</TableHead>
                                                <TableHead className="text-green-800">Valor</TableHead>
                                                <TableHead className="text-green-800">Estado</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {proyecto.budgets!.map((budget) => (
                                                <TableRow key={budget.id} className="hover:bg-green-50/50">
                                                    <TableCell className="font-medium text-green-900">{budget.nombre}</TableCell>
                                                    <TableCell className="text-green-800">
                                                        {formatCurrency(budget.valor_total)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge className={getStatusColor(budget.estado)} variant="outline">
                                                            {getStatusText(budget.estado)}
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            ) : (
                                <p className="text-green-600 text-center py-4">
                                    No hay presupuestos asignados a este proyecto.
                                </p>
                            )}
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-green-100">
                            <div className="text-sm text-green-600">
                                Inicio: {new Date(proyecto.fecha_inicio).toLocaleDateString("es-ES")}
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setAddBudgetModalOpen(true)}
                                    className="border-green-300 text-green-700 hover:bg-green-50"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Agregar Presupuesto
                                </Button>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="border-green-300 text-green-700 hover:bg-green-50"
                                        >
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => setProyectoEditar(proyecto)}>
                                            <Edit className="h-4 w-4 mr-2" />
                                            Editar Proyecto
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                            <Calculator className="h-4 w-4 mr-2" />
                                            Generar Reporte
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem 
                                            className="text-red-600"
                                            onClick={() => eliminarProyecto(proyecto.id)}
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Eliminar Proyecto
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <AddBudgetModal
                proyectoId={proyecto.id}
                open={addBudgetModalOpen}
                onOpenChange={setAddBudgetModalOpen}
                onBudgetAdded={handleBudgetAdded}
            />

            <ConfirmDialog
                open={proyectoAEliminar !== null}
                onOpenChange={(open) => !open && setProyectoAEliminar(null)}
                onConfirm={confirmarEliminacion}
                title="¿Estás seguro de eliminar este proyecto?"
                description="Esta acción no se puede deshacer. El proyecto y todos sus presupuestos asociados serán eliminados permanentemente."
                confirmText="Eliminar"
                loading={loadingEliminar}
            />
        </>
    );
}