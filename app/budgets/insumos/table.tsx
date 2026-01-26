'use client';

import type React from "react";
import InsumoForm from './form';
import apiClient from '@/app/api/apiClient';
import { useEffect, useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowUpDown, Package, MoreHorizontal, Edit, Trash2, Loader2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export interface Insumo {
    id: number;
    nombre: string;
    unidad_medida: string;
    valor: number;
    tipo_proveedor: string;
    tipo_producto: number;
}

interface InsumoTableProps {
    insumos: Insumo[];
    setInsumos: React.Dispatch<React.SetStateAction<Insumo[]>>;
    tipoProducto: number;
    titulo: string;
    descripcion: string;
    icon?: React.ReactNode;
}

export default function InsumoTable({ 
    insumos, 
    setInsumos, 
    tipoProducto, 
    titulo,
    descripcion,
    icon 
}: InsumoTableProps) {

    const { toast } = useToast();
    const [start, setStart] = useState(0);
    const [length, setLength] = useState(10);
    const [totalRecords, setTotalRecords] = useState(0);
    const [promedioInsumos, setPromedioInsumos] = useState(0);
    const [loadingInsumos, setLoadingInsumos] = useState(true);
    const [insumoAEliminar, setInsumoAEliminar] = useState<number | null>(null);
    const [insumoEditar, setInsumoEditar] = useState<Insumo | null>(null);
    const [loadingInsumoHash, setLoadingInsumoHash] = useState<string | null>(null);

    useEffect(() => {
        const fetchInsumos = async () => {  
            setLoadingInsumos(true);
            try {
                const response = await apiClient.get(`/productos?tipo_producto=${tipoProducto}&start=${start}&length=${length}`);
                setInsumos(response.data.data);
                setTotalRecords(response.data.iTotalRecords);
                setPromedioInsumos(response.data.valor_promedio || 0);
            } catch (err) {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Error al cargar los insumos",
                });
            } finally {
                setLoadingInsumos(false);
            }
        };

        // Función para manejar el evento de actualización
        const handleInsumoActualizado = (event: CustomEvent) => {
            // Si el evento es para este tipo de producto, refrescar
            if (event.detail.tipoProducto === tipoProducto) {
                fetchInsumos();
            }
        };

        // Escuchar el evento personalizado
        const eventHandler = (e: Event) => handleInsumoActualizado(e as CustomEvent);
        window.addEventListener('insumoActualizado', eventHandler);

        // Cargar insumos inicialmente
        fetchInsumos();

        // Limpiar el event listener
        return () => {
            window.removeEventListener('insumoActualizado', eventHandler);
        };
    }, [start, length, tipoProducto, toast, setInsumos]);

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

    const eliminarInsumo = (id_insumo: number) => {
        setInsumoAEliminar(id_insumo);
    };

    const confirmarEliminacion = async () => {
        if (!insumoAEliminar) return;

        try {
            setLoadingInsumoHash(insumoAEliminar.toString());
            await apiClient.delete('/productos', {
                data: { id: insumoAEliminar }
            });

            toast({
                variant: "success",
                title: `${titulo} eliminado`,
                description: `El ${titulo.toLowerCase()} ha sido eliminado correctamente.`,
            });
            
            const response = await apiClient.get(`/productos?tipo_producto=${tipoProducto}&start=${start}&length=${length}`);
            setInsumos(response.data.data);
            setTotalRecords(response.data.iTotalRecords);
            setPromedioInsumos(response.data.valor_promedio || 0);
            
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Error al eliminar el insumo",
            });
        } finally {
            setLoadingInsumoHash(null);
            setInsumoAEliminar(null);
        }
    };

    const currentPage = Math.floor(start / length) + 1;
    const totalPages = Math.ceil(totalRecords / length);

    return (<>
        <InsumoForm 
            setInsumos={setInsumos} 
            insumoEditar={insumoEditar}
            setInsumoEditar={setInsumoEditar}
            tipoProducto={tipoProducto}
            titulo={titulo}
            descripcion={descripcion}
            icon={icon}
            mostrarBotonCrear={false}
        />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
            <Card className="border-green-200 bg-gradient-to-br from-white to-green-50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-green-800">Total {titulo}</CardTitle>
                    {icon || <Package className="h-4 w-4 text-green-600" />}
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-900">{totalRecords}</div>
                    <p className="text-xs text-green-600">{titulo} disponibles</p>
                </CardContent>
            </Card>

            <Card className="border-green-200 bg-gradient-to-br from-white to-green-50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-green-800">Valor promedio</CardTitle>
                    <ArrowUpDown className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-900">
                        {typeof promedioInsumos === 'number' ? promedioInsumos.toLocaleString('es-CO') : '0'}
                    </div>
                    <p className="text-xs text-green-600">Por unidad</p>
                </CardContent>
            </Card>
        </div>

        <Card className="border-green-200">
            <CardHeader>
                <CardTitle className="text-green-900 flex items-center gap-2">
                    {icon}
                    Lista de {titulo.toLowerCase()}
                </CardTitle>
                <p className="text-green-700">
                    {descripcion}
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
                                <TableHead className="text-green-800">Proveedor</TableHead>
                                <TableHead className="text-green-800 w-[100px]">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loadingInsumos ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center">
                                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-green-600" />
                                    </TableCell>
                                </TableRow>
                            ) : insumos.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-green-900">
                                        No hay {titulo.toLowerCase()} registrados
                                    </TableCell>
                                </TableRow>
                            ) : (
                                insumos.map((insumo) => (
                                    <TableRow key={insumo.id} className="hover:bg-green-50/50">
                                        <TableCell className="font-medium text-green-900">{insumo.nombre}</TableCell>
                                        <TableCell className="text-green-900">{insumo.unidad_medida}</TableCell>
                                        <TableCell className="text-green-900">
                                            {Number(insumo.valor).toLocaleString('es-CO')}
                                        </TableCell>
                                        <TableCell className="text-green-900">{insumo.tipo_proveedor}</TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="center">
                                                    <DropdownMenuItem
                                                        onClick={() => setInsumoEditar(insumo)}
                                                    >
                                                        <Edit className="h-4 w-4 mr-2" />
                                                        Editar
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => eliminarInsumo(insumo.id)}
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
                                Mostrando {start + 1} a {Math.min(start + length, totalRecords)} de {totalRecords} {titulo.toLowerCase()}
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
            open={insumoAEliminar !== null}
            onOpenChange={(open) => !open && setInsumoAEliminar(null)}
            onConfirm={confirmarEliminacion}
            title={`¿Estás seguro de eliminar este ${titulo.toLowerCase()}?`}
            description="Esta acción no se puede deshacer. El insumo será eliminado permanentemente."
            confirmText="Eliminar"
            loading={loadingInsumoHash === insumoAEliminar?.toString()}
        />
    </>);
}