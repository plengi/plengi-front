'use client';

import type React from "react";
import FormTransportes from './form';
import apiClient from '@/app/api/apiClient';
import { useEffect, useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowUpDown, Package, Plus, MoreHorizontal, Eye, Edit, Trash2, Unplug, Loader2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
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

export interface Transportes {
    id: number;
    nombre: string;
    unidad_medida: string;
    valor: number;
    tipo_proveedor: string;
    tipo_producto: number;
}

interface TablaTransportesProps {
    transportes: Transportes[];
    setTransportes: React.Dispatch<React.SetStateAction<Transportes[]>>;
}

export default function TableTransportes({ transportes, setTransportes }: TablaTransportesProps) {

    const { toast } = useToast();
    const [start, setStart] = useState(0);
    const [length, setLength] = useState(10);
    const [totalRecords, setTotalRecords] = useState(0);
    const [promedioTransportes, setPromedioTransportes] = useState(0);
    const [loadingTransportes, setLoadingTransportes] = useState(true);
    const [materialAEliminar, setMaterialAEliminar] = useState<number | null>(null);
    const [transportesEditar, setTransportesEditar] = useState<Transportes | null>(null);
    const [loadingMaterialHash, setLoadingMaterialHash] = useState<String | null>(null);

    useEffect(() => {
        const fetchTransportes = async () => {  
            setLoadingTransportes(true);
            try {
                const response = await apiClient.get(`/productos?tipo_producto=3&start=${start}&length=${length}`);
                setTransportes(response.data.data);
                setTotalRecords(response.data.iTotalRecords);
                setPromedioTransportes(response.data.valor_promedio);
            } catch (err) {
            } finally {
                setLoadingTransportes(false);
            }
        };

        fetchTransportes();
    }, [start, length]);

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

    const eliminarMaterial = (id_material: number) => {
        setMaterialAEliminar(id_material);
    };

    const confirmarEliminacion = async () => {
        if (!materialAEliminar) return;

        try {
            setLoadingMaterialHash(materialAEliminar.toString());
            await apiClient.delete('/productos', {
                data: { id: materialAEliminar } // Axios usa 'data' para el cuerpo en DELETE
            });

            toast({
                variant: "success",
                title: `Transportes eliminado`,
                description: `El material ha sido eliminado correctamente.`,
            });
            
            // Actualiza la lista de transportes después de eliminar
            const response = await apiClient.get(`/productos?tipo_producto=3&start=${start}&length=${length}`);
            
            setTransportes(response.data.data);
            setTotalRecords(response.data.iTotalRecords);
            setPromedioTransportes(response.data.valor_promedio);
            
        } catch (error) {
            console.error("Error al eliminar el material:", error);
        } finally {
            setLoadingMaterialHash(null);
            setMaterialAEliminar(null);
        }
    };

    const currentPage = Math.floor(start / length) + 1;
    const totalPages = Math.ceil(totalRecords / length);

    return (<>
        <FormTransportes 
            setTransportes={setTransportes} 
            transportesEditar={transportesEditar}
            setTransportesEditar={setTransportesEditar}
            mostrarBotonCrear={false}
        />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">

            <Card className="border-green-200 bg-gradient-to-br from-white to-green-50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-green-800">Total Transportes</CardTitle>
                    <Package className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-900">{totalRecords}</div>
                    <p className="text-xs text-green-600">Transportes disponibles</p>
                </CardContent>
            </Card>

            <Card className="border-green-200 bg-gradient-to-br from-white to-green-50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-green-800">Valor promedio</CardTitle>
                    <ArrowUpDown className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-900">{promedioTransportes}</div>
                    <p className="text-xs text-green-600">Por unidad</p>
                </CardContent>
            </Card>

        </div>

        <Card className="border-green-200">
            <CardHeader>
                <CardTitle className="text-green-900">Lista de transportes</CardTitle>
                <p className="text-green-700">
                    Lista completa de transportes disponibles para presupuestos
                </p>
            </CardHeader>
            <CardContent>
                <div className="overflow-hidden rounded-lg border border-green-200">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-green-50">
                                <TableHead className="text-green-800">Nombre</TableHead>
                                <TableHead className="text-green-800">Unidad de medida</TableHead>
                                <TableHead className="text-green-800">Valor</TableHead>
                                <TableHead className="text-green-800">Tipo proveedor</TableHead>
                                <TableHead className="text-green-800">Tipo material</TableHead>
                                <TableHead className="text-green-800 w-[100px]">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loadingTransportes ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center">
                                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-green-600" />
                                    </TableCell>
                                </TableRow>
                            ) : transportes.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-green-900">
                                        No hay transportes registradas
                                    </TableCell>
                                </TableRow>
                            ) : (
                                transportes.map((material) => (

                                    <TableRow key={material.id} className="hover:bg-green-50/50">
                                        <TableCell className="font-medium text-green-900">{material.nombre}</TableCell>
                                        <TableCell className="text-green-900">{material.unidad_medida}</TableCell>
                                        <TableCell className="text-green-900">
                                            {Number(material.valor).toLocaleString('es-CO')}
                                        </TableCell>
                                        <TableCell className="text-green-900">{material.tipo_proveedor}</TableCell>
                                        <TableCell className="text-green-900">{material.tipo_producto}</TableCell>
                                        <TableCell className="text-green-900">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="center">
                                                    <DropdownMenuItem
                                                        onClick={() => setTransportesEditar(material)}
                                                    >
                                                        <Edit className="h-4 w-4 mr-2" />
                                                        Editar
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => eliminarMaterial(material.id)}
                                                        className="text-red-600"
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2"/>
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
                                Mostrando {start + 1} a {Math.min(start + length, totalRecords)} de {totalRecords} transportes
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
                                    Página {currentPage} de {totalPages}
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
            open={materialAEliminar !== null}
            onOpenChange={(open) => !open && setMaterialAEliminar(null)}
            onConfirm={confirmarEliminacion}
            title="¿Estás seguro de eliminar este material?"
            description="Esta acción no se puede deshacer. El material será eliminado permanentemente."
            confirmText="Eliminar"
            loading={loadingMaterialHash === materialAEliminar?.toString()}
        />

    </>);
}