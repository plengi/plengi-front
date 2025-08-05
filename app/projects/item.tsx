'use client';

import type React from "react";
import FormProyectos from './form';
import apiClient from '@/app/api/apiClient';
import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Building2, MapPin, MoreHorizontal, Eye, Edit, Trash2, Unplug, Loader2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface Proyecto {
    id: number;
    nombre: string;
    tipo_obra: string;
    id_ciudad: string;
    fecha: string;
}

export default function ProjectsItem() {

    const [proyectos, setProyectos] = useState<Proyecto[]>([]);

    function Projecto() {
        return (
            <Card key={1} className="border-green-200 hover:shadow-lg transition-shadow">
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div className="space-y-2">
                            <CardTitle className="text-green-900 flex items-center gap-2">
                                <Building2 className="h-5 w-5 text-green-600" />
                                PROYECTO DE PRUEBAS
                            </CardTitle>
                            <div className="flex items-center gap-4 text-sm text-green-700">
                                <div className="flex items-center gap-1">
                                    <MapPin className="h-4 w-4" />
                                    MEDELLIN ANTIOQUIA
                                </div>
                                <Badge variant="outline" className="border-green-300 text-green-700">
                                    TIPO DE OBRA 1
                                </Badge>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-green-900">${'600.000'}</div>
                            <div className="text-sm text-green-600">Valor Total</div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <h4 className="text-sm font-medium text-green-800 mb-3">
                            Presupuestos del Proyecto (3)
                            </h4>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (<>
        <Projecto />
        <Card className="border-green-200">
            <CardContent className="flex flex-col items-center justify-center py-12">
                <Building2 className="h-12 w-12 text-green-400 mb-4" />
                <h3 className="text-lg font-medium text-green-900 mb-2">No se encontraron proyectos</h3>
                <p className="text-green-600 text-center mb-4">
                    No hay proyectos que coincidan con los criterios de búsqueda.
                </p>
                <FormProyectos
                    setProyectos={setProyectos}
                    mostrarBotonCrear={true}
                />
            </CardContent>
        </Card>
    </>);
}