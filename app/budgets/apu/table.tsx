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
import { ArrowUpDown, Package, Plus, MoreHorizontal, Eye, Edit, Trash2, Unplug, Loader2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, BarChart3 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

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

    useEffect(() => {
        const fetchApus = async () => {  
            setLoadingApus(true);
            try {
                const response = await apiClient.get(`/apus?start=${start}&length=${length}`);
                setApus(response.data.data);
                setTotalRecords(response.data.iTotalRecords);
                setPromedioApus(response.data.valor_promedio);
                setTotalApus(response.data.valor_total);
            } catch (err) {
            } finally {
                setLoadingApus(false);
            }
        };

        fetchApus();
    }, [start, length]);

    const handlePreviousPage = () => {
        if (start - length >= 0) {
            setStart(start - length);
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
        case "Movimiento de Tierras":
            return "bg-amber-100 text-amber-800 border-amber-300"
        case "Hormigón Armado":
            return "bg-gray-100 text-gray-800 border-gray-300"
        case "Albañilería":
            return "bg-orange-100 text-orange-800 border-orange-300"
        case "Instalaciones Eléctricas":
            return "bg-yellow-100 text-yellow-800 border-yellow-300"
        case "Instalaciones Sanitarias":
            return "bg-blue-100 text-blue-800 border-blue-300"
        case "Techumbres":
            return "bg-red-100 text-red-800 border-red-300"
        case "Pavimentación":
            return "bg-slate-100 text-slate-800 border-slate-300"
        case "Terminaciones":
            return "bg-purple-100 text-purple-800 border-purple-300"
        case "Estructura Metálica":
            return "bg-indigo-100 text-indigo-800 border-indigo-300"
        case "Revestimientos":
            return "bg-cyan-100 text-cyan-800 border-cyan-300"
        default:
            return "bg-green-100 text-green-800 border-green-300"
        }
    }

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
            await apiClient.delete('/productos', {
                data: { id: apuAEliminar } // Axios usa 'data' para el cuerpo en DELETE
            });

            toast({
                variant: "success",
                title: `Apus eliminado`,
                description: `El apu ha sido eliminado correctamente.`,
            });
            
            // Actualiza la lista de apus después de eliminar
            const response = await apiClient.get(`/productos?tipo_producto=0&start=${start}&length=${length}`);
            
            setApus(response.data.data);
            setTotalRecords(response.data.iTotalRecords);
            setPromedioApus(response.data.valor_promedio);
            
        } catch (error) {
            console.error("Error al eliminar el apu:", error);
        } finally {
            setLoadingAPUHash(null);
            setAPUAEliminar(null);
        }
    };

    const formatPrice = (price: number): string => {
        return new Intl.NumberFormat("es-CL", {
            style: "currency",
            currency: "CLP",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(price)
    }

    const currentPage = Math.floor(start / length) + 1;
    const totalPages = Math.ceil(totalRecords / length);

    return (<>

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
                    <div className="text-2xl font-bold text-green-900">{promedioApus}</div>
                    <p className="text-xs text-green-600">Por unidad</p>
                </CardContent>
            </Card>

            <Card className="border-green-200 bg-gradient-to-br from-white to-green-50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-green-800">Valor Total</CardTitle>
                    <ArrowUpDown className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-900">{totalApus}</div>
                    <p className="text-xs text-green-600">Suma total</p>
                </CardContent>
            </Card>

        </div>

        <Card className="border-green-200">
            <CardHeader>
                <CardTitle className="text-green-900">Lista de apus</CardTitle>
                <p className="text-green-700">
                    Lista completa de apus disponibles para presupuestos
                </p>
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
                                    <TableCell colSpan={5} className="text-center text-green-900">
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
                                                    <DropdownMenuItem>
                                                        <Edit className="h-4 w-4 mr-2" />
                                                        <Link href={`/budgets/apu/edit/${apu.id}`}>
                                                            Editar
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="text-red-600">
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
            open={apuAEliminar !== null}
            onOpenChange={(open) => !open && setAPUAEliminar(null)}
            onConfirm={confirmarEliminacion}
            title="¿Estás seguro de eliminar este apu?"
            description="Esta acción no se puede deshacer. El apu será eliminado permanentemente."
            confirmText="Eliminar"
            loading={loadingAPUHash === apuAEliminar?.toString()}
        />

    </>);
}