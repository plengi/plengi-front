'use client';

import type React from "react";
import ClienteForm from './form';
import apiClient from '@/app/api/apiClient';
import { useEffect, useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { User, Plus, MoreHorizontal, Edit, Trash2, Loader2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export interface Cliente {
    id: number;
    nombres: string;
    apellidos: string;
    tipo_documento: string;
    numero_documento: string;
    direccion: string;
    email: string;
    telefono: string;
}

interface TablaClientesProps {
    clientes: Cliente[];
    setClientes: React.Dispatch<React.SetStateAction<Cliente[]>>;
}

export default function TablaClientes({ clientes, setClientes }: TablaClientesProps) {

    const { toast } = useToast();
    const [start, setStart] = useState(0);
    const [length, setLength] = useState(10);
    const [totalRecords, setTotalRecords] = useState(0);
    const [loadingClientes, setLoadingClientes] = useState(true);
    const [clienteAEliminar, setClienteAEliminar] = useState<number | null>(null);
    const [clienteEditar, setClienteEditar] = useState<Cliente | null>(null);
    const [loadingClienteHash, setLoadingClienteHash] = useState<String | null>(null);

    useEffect(() => {
        const fetchClientes = async () => {  
            setLoadingClientes(true);
            try {
                const response = await apiClient.get(`/clientes?start=${start}&length=${length}`);
                setClientes(response.data.data);
                setTotalRecords(response.data.iTotalRecords);
            } catch (err) {
            } finally {
                setLoadingClientes(false);
            }
        };

        fetchClientes();
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

    const eliminarCliente = (id_cliente: number) => {
        setClienteAEliminar(id_cliente);
    };

    const confirmarEliminacion = async () => {
        if (!clienteAEliminar) return;

        try {
            setLoadingClienteHash(clienteAEliminar.toString());
            await apiClient.delete('/clientes', {
                data: { id: clienteAEliminar }
            });

            toast({
                variant: "success",
                title: `Cliente eliminado`,
                description: `El cliente ha sido eliminado correctamente.`,
            });
            
            const response = await apiClient.get(`/clientes?start=${start}&length=${length}`);
            
            setClientes(response.data.data);
            setTotalRecords(response.data.iTotalRecords);
            
        } catch (error) {
            console.error("Error al eliminar el cliente:", error);
        } finally {
            setLoadingClienteHash(null);
            setClienteAEliminar(null);
        }
    };

    const currentPage = Math.floor(start / length) + 1;
    const totalPages = Math.ceil(totalRecords / length);

    return (<>
        <ClienteForm 
            setClientes={setClientes} 
            clienteEditar={clienteEditar}
            setClienteEditar={setClienteEditar}
            mostrarBotonCrear={false}
        />

        <Card className="border-green-200">
            <CardHeader>
                <CardTitle className="text-green-900">Lista de clientes</CardTitle>
                <p className="text-green-700">
                    Lista completa de clientes registrados
                </p>
            </CardHeader>
            <CardContent>
                <div className="overflow-hidden rounded-lg border border-green-200">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-green-50">
                                <TableHead className="text-green-800">Nombres</TableHead>
                                <TableHead className="text-green-800">Apellidos</TableHead>
                                <TableHead className="text-green-800">Tipo Documento</TableHead>
                                <TableHead className="text-green-800">Número Documento</TableHead>
                                <TableHead className="text-green-800">Dirección</TableHead>
                                <TableHead className="text-green-800">Email</TableHead>
                                <TableHead className="text-green-800">Teléfono</TableHead>
                                <TableHead className="text-green-800 w-[100px]">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loadingClientes ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center">
                                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-green-600" />
                                    </TableCell>
                                </TableRow>
                            ) : clientes.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center text-green-900">
                                        No hay clientes registrados
                                    </TableCell>
                                </TableRow>
                            ) : (
                                clientes.map((cliente) => (

                                    <TableRow key={cliente.id} className="hover:bg-green-50/50">
                                        <TableCell className="font-medium text-green-900">{cliente.nombres}</TableCell>
                                        <TableCell className="text-green-900">{cliente.apellidos}</TableCell>
                                        <TableCell className="text-green-900">{cliente.tipo_documento}</TableCell>
                                        <TableCell className="text-green-900">{cliente.numero_documento}</TableCell>
                                        <TableCell className="text-green-900">{cliente.direccion}</TableCell>
                                        <TableCell className="text-green-900">{cliente.email}</TableCell>
                                        <TableCell className="text-green-900">{cliente.telefono}</TableCell>
                                        <TableCell className="text-green-900">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="center">
                                                    <DropdownMenuItem
                                                        onClick={() => setClienteEditar(cliente)}
                                                    >
                                                        <Edit className="h-4 w-4 mr-2" />
                                                        Editar
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => eliminarCliente(cliente.id)}
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
                                Mostrando {start + 1} a {Math.min(start + length, totalRecords)} de {totalRecords} clientes
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
            open={clienteAEliminar !== null}
            onOpenChange={(open) => !open && setClienteAEliminar(null)}
            onConfirm={confirmarEliminacion}
            title="¿Estás seguro de eliminar este cliente?"
            description="Esta acción no se puede deshacer. El cliente será eliminado permanentemente."
            confirmText="Eliminar"
            loading={loadingClienteHash === clienteAEliminar?.toString()}
        />

    </>);
}