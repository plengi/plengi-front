'use client';

import type React from "react";
import FormEmpresas from './form';
import apiClient from '@/app/api/apiClient';
import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, MoreHorizontal, Eye, Edit, Trash2, Unplug, Loader2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export interface Empresa {
    razon_social: string;
    nit: string;
    direccion: string;
    email: string;
    telefono: string;
    updated_at: string;
    created_at: string;
    id: number;
    token_db: string;
    hash: string;
}

interface TablaEmpresasProps {
    empresas: Empresa[];
    setEmpresas: React.Dispatch<React.SetStateAction<Empresa[]>>;
}

export default function TableEmpresas({ empresas, setEmpresas }: TablaEmpresasProps) {

    const [start, setStart] = useState(0);
    const [length, setLength] = useState(15);
    const [totalRecords, setTotalRecords] = useState(0);
    const [loadingEmpresas, setLoadingEmpresas] = useState(true);
    const [empresaEditar, setEmpresaEditar] = useState<Empresa | null>(null);
    const [loadingEmpresaHash, setLoadingEmpresaHash] = useState<String | null>(null);

    useEffect(() => {
        const fetchEmpresas = async () => {  
            setLoadingEmpresas(true);
            try {
                const response = await apiClient.get(`/empresas?start=${start}&length=${length}`);

                setEmpresas(response.data.data);
                setTotalRecords(response.data.iTotalRecords);
            } catch (err) {
            } finally {
                setLoadingEmpresas(false);
            }
        };

        fetchEmpresas();
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

    const currentPage = Math.floor(start / length) + 1;
    const totalPages = Math.ceil(totalRecords / length);

    const seleccionarEmpresa = async (empresa: Empresa) => {
        try {
            // Mostrar estado de carga (opcional)
            setLoadingEmpresaHash(empresa.hash); 
            
            // Llamar al endpoint de conexión
            const response = await apiClient.post('/empresas-seleccionar', {
                hash: empresa.hash
            });
            localStorage.setItem('empresaSeleccionada', JSON.stringify(response.data.empresa));

            if (response.data.empresa) {
                window.location.href = '/dashboard';
            }            
            
        } catch (error) {
            console.error('Error al conectar:', error);
        } finally {
            setLoadingEmpresaHash(null); // Quitar estado de carga
        }
    };

    return (<>
        <FormEmpresas 
            setEmpresas={setEmpresas} 
            empresaEditar={empresaEditar}
            setEmpresaEditar={setEmpresaEditar}
            mostrarBotonCrear={false}
        />

        <Card className="border-green-200">
            <CardHeader>
                <CardTitle className="text-green-900">Lista de empresas</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-hidden rounded-lg border border-green-200">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-green-50">
                                <TableHead className="text-green-800">Razon social</TableHead>
                                <TableHead className="text-green-800">Email</TableHead>
                                <TableHead className="text-green-800">Telefono</TableHead>
                                <TableHead className="text-green-800">Dirección</TableHead>
                                <TableHead className="text-green-800 w-[100px]">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loadingEmpresas ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center">
                                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-green-600" />
                                    </TableCell>
                                </TableRow>
                            ) : empresas.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-green-900">
                                        No hay empresas registradas
                                    </TableCell>
                                </TableRow>
                            ) : (
                                empresas.map((empresa) => (

                                    <TableRow key={empresa.id} className="hover:bg-green-50/50">
                                        <TableCell className="font-medium text-green-900">{empresa.razon_social}</TableCell>
                                        <TableCell className="text-green-900">{empresa.email}</TableCell>
                                        <TableCell className="text-green-900">{empresa.telefono}</TableCell>
                                        <TableCell className="text-green-900">{empresa.direccion}</TableCell>
                                        <TableCell className="text-green-900">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="center">
                                                    <DropdownMenuItem 
                                                        onClick={() => seleccionarEmpresa(empresa)}
                                                        disabled={loadingEmpresaHash === empresa.hash}
                                                        >
                                                        {loadingEmpresaHash === empresa.hash ? (
                                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                        ) : (
                                                            <Unplug className="h-4 w-4 mr-2" />
                                                        )}
                                                        Conectarse
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => setEmpresaEditar(empresa)}>
                                                        <Edit className="h-4 w-4 mr-2" />
                                                        Editar
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
                                Mostrando {start + 1} a {Math.min(start + length, totalRecords)} de {totalRecords} empresas
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
    </>);
}