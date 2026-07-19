"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calculator, Plus, Edit, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import apiClient from "@/app/api/apiClient";
import { ConfiguracionPrestacionesDialog } from "./configuracion-prestaciones-dialog";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useToast } from "@/hooks/use-toast";
import { calcularTotalPrestaciones } from "@/lib/laborUtils";

interface Props {
    auxilioTransporte: number;
}

export function SocialBenefitsDialog({ auxilioTransporte }: Props) {
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    const [configuraciones, setConfiguraciones] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [editar, setEditar] = useState<any>(null);
    const [eliminarId, setEliminarId] = useState<number | null>(null);
    const [showNewConfig, setShowNewConfig] = useState(false);

    const fetchConfiguraciones = async () => {
        setLoading(true);
        try {
            const res = await apiClient.get("/configuraciones-prestaciones");
            setConfiguraciones(res.data.data);
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Error al cargar configuraciones" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open) fetchConfiguraciones();
    }, [open]);

    const handleEliminar = async () => {
        if (!eliminarId) return;
        try {
            await apiClient.delete(`/configuraciones-prestaciones/${eliminarId}`);
            toast({ variant: "success", title: "Eliminada", description: "Configuración eliminada correctamente" });
            fetchConfiguraciones();
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "No se pudo eliminar" });
        } finally {
            setEliminarId(null);
        }
    };

    const handleEditar = (config: any) => {
        setEditar(config);
    };

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" className="gap-2 border-green-300 text-green-700 hover:bg-green-50">
                        <Calculator className="h-4 w-4" />
                        Prestaciones
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-green-900 flex items-center gap-2">
                            <Calculator className="h-5 w-5 text-green-600" />
                            Calculadora de Prestaciones Sociales
                        </DialogTitle>
                        <DialogDescription>
                            Configura los factores de prestaciones sociales y parafiscales. Cada configuración puede ser asignada a un cargo de mano de obra.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex items-center justify-between">
                        <div className="text-sm text-green-700">
                            {configuraciones.length} configuraciones disponibles
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="border-green-300 text-green-700 hover:bg-green-50"
                            onClick={() => setShowNewConfig(true)}
                        >
                            <Plus className="h-3 w-3 mr-1" />
                            Nueva Configuración
                        </Button>
                    </div>

                    <ConfiguracionPrestacionesDialog
                        open={showNewConfig}
                        onOpenChange={setShowNewConfig}
                        onConfiguracionSaved={fetchConfiguraciones}
                    />

                    {loading ? (
                        <div className="text-center py-4">Cargando...</div>
                    ) : configuraciones.length === 0 ? (
                        <div className="text-center py-8 text-green-600">
                            No hay configuraciones de prestaciones. Crea una nueva usando el botón superior.
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-lg border border-green-200">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-green-50">
                                        <TableHead className="text-green-800">Nombre</TableHead>
                                        <TableHead className="text-green-800">Descripción</TableHead>
                                        <TableHead className="text-green-800 text-right">Total %</TableHead>
                                        <TableHead className="text-green-800 text-right">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {configuraciones.map((config) => {
                                        const total = calcularTotalPrestaciones(config);
                                        return (
                                            <TableRow key={config.id} className="hover:bg-green-50/50">
                                                <TableCell className="font-medium text-green-900">{config.nombre}</TableCell>
                                                <TableCell className="text-green-700">{config.descripcion || "-"}</TableCell>
                                                <TableCell className="text-right font-bold text-green-800">{total.toFixed(2)}%</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-blue-600"
                                                            onClick={() => handleEditar(config)}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-red-600"
                                                            onClick={() => setEliminarId(config.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
                        <p className="text-sm text-green-700">
                            <strong>Auxilio de transporte:</strong> {formatCurrency(auxilioTransporte)}
                            <span className="ml-4 text-xs text-green-600">
                                (Se suma al total cuando el salario base es menor o igual a 2 SMMLV)
                            </span>
                        </p>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Diálogo de edición */}
            <ConfiguracionPrestacionesDialog
                open={!!editar}
                onOpenChange={(open) => {
                    if (!open) setEditar(null);
                }}
                configuracionEditar={editar}
                onConfiguracionSaved={fetchConfiguraciones}
            />

            <ConfirmDialog
                open={eliminarId !== null}
                onOpenChange={(open) => !open && setEliminarId(null)}
                onConfirm={handleEliminar}
                title="Eliminar configuración"
                description="¿Estás seguro de eliminar esta configuración? Esta acción no se puede deshacer."
                confirmText="Eliminar"
            />
        </>
    );
}