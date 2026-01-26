'use client';

import type React from "react";
import { useState, useEffect } from 'react';
import FormProyectos from './form';
import ProjectsItem from './item';
import { Search, Filter, ArrowUpDown, Building2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import apiClient from '@/app/api/apiClient';
import { useToast } from "@/hooks/use-toast";

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
    budgets?: any[];
    budgets_count: number;
}

export default function ProjectsPage() {
    const { loading } = useAuthRedirect();
    const { toast } = useToast();
    const [proyectos, setProyectos] = useState<Proyecto[]>([]);
    const [proyectoEditar, setProyectoEditar] = useState<Proyecto | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [estadoFilter, setEstadoFilter] = useState("all");
    const [loadingProyectos, setLoadingProyectos] = useState(true);

    const estadosDisponibles = [
        { id: "all", nombre: "Todos" },
        { id: "planificacion", nombre: "Planificación" },
        { id: "en_progreso", nombre: "En progreso" },
        { id: "en_revision", nombre: "En revisión" },
        { id: "aprobado", nombre: "Aprobado" },
        { id: "completado", nombre: "Completado" },
    ];

    useEffect(() => {
        if (!loading) {
            fetchProyectos();
        }
    }, [loading]);

    const fetchProyectos = async () => {
        setLoadingProyectos(true);
        try {
            const response = await apiClient.get(`/proyectos?estado=${estadoFilter}`);
            if (response.data.success) {
                setProyectos(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching proyectos:", error);
        } finally {
            setLoadingProyectos(false);
        }
    };

    const handleBudgetAdded = async (proyectoId: number) => {
        // Recargar la lista de proyectos
        await fetchProyectos();
    };

    const filteredProjects = proyectos.filter((project) => {
        const matchesSearch =
            project.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (project.cliente_nombre && project.cliente_nombre.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (project.ubicacion_nombre && project.ubicacion_nombre.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesEstado = estadoFilter === "all" || project.estado === estadoFilter;
        
        return matchesSearch && matchesEstado;
    });

    const handleEliminarProyecto = (id: number) => {
        setProyectos(prev => prev.filter(proyecto => proyecto.id !== id));
    };

    const handleAgregarBudget = (proyectoId: number) => {
        // Aquí implementarías la lógica para agregar un budget al proyecto
        toast({
            variant: "default",
            title: "Agregar Budget",
            description: `Funcionalidad para agregar budget al proyecto ${proyectoId}`,
        });
    };

    const handleRefresh = () => {
        fetchProyectos();
    };

    if (loading) {
        return <div className="p-4 text-center">Cargando...</div>;
    }

    return (<>
        <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-2 border-b border-green-100 px-4 bg-gradient-to-r from-green-50 to-white">
            <SidebarTrigger className="-ml-1 text-green-600 hover:bg-green-100" />
            <div className="flex flex-1 items-center gap-4">
                <h1 className="text-3xl font-bold tracking-tight text-green-900">Proyectos</h1>
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-green-500" />
                    <Input
                        placeholder="Buscar proyectos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 border-green-200 focus:border-green-400 focus:ring-green-400"
                    />
                </div>
                <Button 
                    variant="outline" 
                    onClick={handleRefresh}
                    className="border-green-300 text-green-700 hover:bg-green-50"
                >
                    Actualizar
                </Button>
                <FormProyectos
                    setProyectos={setProyectos}
                    proyectoEditar={proyectoEditar}
                    setProyectoEditar={setProyectoEditar}
                    mostrarBotonCrear={true}
                />
            </div>
        </header>
        <main className="flex-1 space-y-6 p-6 bg-gradient-to-br from-green-50/30 to-white">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-green-900">Proyectos</h1>
                    <p className="text-green-700">Gestiona y visualiza todos tus proyectos de ingeniería civil</p>
                </div>
            </div>

            {/* Filters and Stats */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="gap-2 border-green-300 text-green-700 hover:bg-green-50">
                                <Filter className="h-4 w-4" />
                                Estado: {estadosDisponibles.find(e => e.id === estadoFilter)?.nombre || "Todos"}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            {estadosDisponibles.map((estado) => (
                                <DropdownMenuItem 
                                    key={estado.id} 
                                    onClick={() => setEstadoFilter(estado.id)}
                                >
                                    {estado.nombre}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button variant="outline" className="gap-2 border-green-300 text-green-700 hover:bg-green-50">
                        <ArrowUpDown className="h-4 w-4" />
                        Ordenar
                    </Button>
                </div>
                <div className="text-sm text-green-600">
                    {filteredProjects.length} proyecto{filteredProjects.length !== 1 ? "s" : ""} encontrado
                    {filteredProjects.length !== 1 ? "s" : ""}
                </div>
            </div>

            {/* Projects Grid */}
            {loadingProyectos ? (
                <div className="text-center py-12">
                    <p className="text-green-600">Cargando proyectos...</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {filteredProjects.map((project) => (
                        <ProjectsItem 
                            key={project.id} 
                            proyecto={project}
                            setProyectoEditar={setProyectoEditar}
                            onEliminar={handleEliminarProyecto}
                            onBudgetAdded={handleBudgetAdded} 
                        />
                    ))}
                </div>
            )}

            {!loadingProyectos && filteredProjects.length === 0 && (
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
            )}
        </main>
    </>);
}