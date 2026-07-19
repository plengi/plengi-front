"use client";

import type React from "react";
import { useEffect, useState } from "react";
import {
    Plus,
    Filter,
    MoreHorizontal,
    Eye,
    Edit,
    Trash2,
    ArrowUpDown,
    Users,
    HardHat,
    Search,
    Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import apiClient from "@/app/api/apiClient";
import { formatCurrency } from "@/lib/format";
import InsumoTable from "../insumos/table";
import InsumoForm from "../insumos/form";
import { Insumo } from '../insumos/form';

interface Cuadrilla {
    id: number;
    nombre: string;
    detalles: {
        id: number;
        id_producto: number;
        cantidad: number;
        producto: Insumo;
    }[];
}

export default function LaborPage() {
    const { loading } = useAuthRedirect();
    const [manoObra, setManoObra] = useState<Insumo[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loadingManoObra, setLoadingManoObra] = useState(false);
    const [config, setConfig] = useState<any>(null);
    const [cuadrillas, setCuadrillas] = useState<Cuadrilla[]>([]);
    const [loadingCuadrillas, setLoadingCuadrillas] = useState(false);
    const [editingBaseParams, setEditingBaseParams] = useState(false);
    const [editingCalcFactors, setEditingCalcFactors] = useState(false);

    // Estado local para editar parámetros
    const [salarioMinimo, setSalarioMinimo] = useState(498100);
    const [auxilioTransporte, setAuxilioTransporte] = useState(176200);
    const [diasLaboralesMes, setDiasLaboralesMes] = useState(30);
    const [horasDiarias, setHorasDiarias] = useState(8);
    const [horasSemanales, setHorasSemanales] = useState(48);
    const [semanasMes, setSemanasMes] = useState(4.3);

    // Cargar datos
    const fetchManoObra = async () => {
        setLoadingManoObra(true);
        try {
            const response = await apiClient.get("/productos?start=0&length=999&tipo_producto=2");
            setManoObra(response.data.data);
        } catch (error) {
            console.error("Error cargando mano de obra:", error);
        } finally {
            setLoadingManoObra(false);
        }
    };

    const fetchConfig = async () => {
        try {
            const res = await apiClient.get("/labor-configuracion");
            const data = res.data.data;
            setConfig(data);
            setSalarioMinimo(data.salario_minimo);
            setAuxilioTransporte(data.auxilio_transporte);
            setDiasLaboralesMes(data.dias_laborales_mes);
            setHorasDiarias(data.horas_diarias);
            setHorasSemanales(data.horas_semanales);
            setSemanasMes(data.semanas_mes);
        } catch (error) {
            console.error("Error cargando configuración:", error);
        }
    };

    const fetchCuadrillas = async () => {
        setLoadingCuadrillas(true);
        try {
            const res = await apiClient.get("/cuadrillas");
            setCuadrillas(res.data.data);
        } catch (error) {
            console.error("Error cargando cuadrillas:", error);
        } finally {
            setLoadingCuadrillas(false);
        }
    };

    useEffect(() => {
        if (!loading) {
            fetchManoObra();
            fetchConfig();
            fetchCuadrillas();
        }
    }, [loading]);

    // Guardar configuración
    const saveConfig = async () => {
        try {
            await apiClient.put("/labor-configuracion", {
                salario_minimo: salarioMinimo,
                auxilio_transporte: auxilioTransporte,
                dias_laborales_mes: diasLaboralesMes,
                horas_diarias: horasDiarias,
                horas_semanales: horasSemanales,
                semanas_mes: semanasMes,
            });
            setEditingBaseParams(false);
            setEditingCalcFactors(false);
            fetchConfig(); // recargar
        } catch (error) {
            console.error("Error guardando configuración:", error);
        }
    };

    // Filtrar mano de obra por búsqueda
    const filteredManoObra = manoObra.filter((item) => {
        const term = searchTerm.toLowerCase();
        return (
            item.nombre.toLowerCase().includes(term) ||
            item.tipo_proveedor.toLowerCase().includes(term) ||
            (item.mano_obra?.especialidad?.toLowerCase().includes(term) || false)
        );
    });

    // Estadísticas
    const totalLabor = filteredManoObra.length;
    const uniqueSpecialties = new Set(filteredManoObra.map((item) => item.mano_obra?.especialidad).filter(Boolean));
    const uniqueSuppliers = new Set(filteredManoObra.map((item) => item.tipo_proveedor));
    const avgPrice = filteredManoObra.length
        ? filteredManoObra.reduce((sum, item) => sum + item.valor, 0) / filteredManoObra.length
        : 0;

    // Función para calcular total de prestaciones desde JSON
    const calcularTotalPrestaciones = (manoObra: any) => {
        if (!manoObra?.prestaciones) return 0;
        let total = 0;
        const categorias = ["seguridad_social", "prestaciones", "parafiscales", "otros"] as const;
        categorias.forEach((cat) => {
            const factores = manoObra.prestaciones[cat] || [];
            factores.forEach((f: any) => {
                if (f.activo) total += f.porcentaje;
            });
        });
        return total;
    };

    if (loading || loadingManoObra) {
        return <div className="p-4 text-center">Cargando Mano de Obra...</div>;
    }

    return (
        <>
            <header className="flex h-16 shrink-0 items-center gap-2 border-b border-green-100 px-4 bg-gradient-to-r from-green-50 to-white">
                <SidebarTrigger className="-ml-1 text-green-600 hover:bg-green-100" />
                <div className="flex flex-1 items-center gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-green-500" />
                        <Input
                            placeholder="Buscar mano de obra..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8 border-green-200 focus:border-green-400 focus:ring-green-400"
                        />
                    </div>
                    <Button
                        variant="outline"
                        size="icon"
                        className="border-green-200 hover:bg-green-50 hover:border-green-300 bg-transparent"
                    >
                        <Bell className="h-4 w-4 text-green-600" />
                    </Button>
                </div>
            </header>

            <main className="flex-1 space-y-6 p-6 bg-gradient-to-br from-green-50/30 to-white" suppressHydrationWarning>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-green-900">Mano de Obra</h1>
                        <p className="text-green-700">Gestiona el catálogo de recursos humanos para tus proyectos</p>
                    </div>
                    <div className="flex gap-2">
                        {/* Eliminado SocialBenefitsDialog */}
                    </div>
                </div>

                {/* Tarjetas de resumen */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="border-green-200 bg-gradient-to-br from-white to-green-50">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-green-800">Total Mano de Obra</CardTitle>
                            <HardHat className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-900">{totalLabor}</div>
                            <p className="text-xs text-green-600">Recursos disponibles</p>
                        </CardContent>
                    </Card>
                    <Card className="border-green-200 bg-gradient-to-br from-white to-green-50">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-green-800">Especialidades</CardTitle>
                            <Filter className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-900">{uniqueSpecialties.size}</div>
                            <p className="text-xs text-green-600">Tipos diferentes</p>
                        </CardContent>
                    </Card>
                    <Card className="border-green-200 bg-gradient-to-br from-white to-green-50">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-green-800">Proveedores</CardTitle>
                            <Users className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-900">{uniqueSuppliers.size}</div>
                            <p className="text-xs text-green-600">Empresas activas</p>
                        </CardContent>
                    </Card>
                    <Card className="border-green-200 bg-gradient-to-br from-white to-green-50">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-green-800">Tarifa Promedio</CardTitle>
                            <ArrowUpDown className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-900">
                                {formatCurrency(Math.round(avgPrice))}
                            </div>
                            <p className="text-xs text-green-600">Por hora</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Parámetros Base y Factores de Cálculo */}
                <div className="grid gap-6 md:grid-cols-2">
                    <Card className="border-green-200 bg-gradient-to-br from-white to-green-50">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-green-900">Parámetros Base</CardTitle>
                                <CardDescription className="text-green-700">
                                    Valores de referencia para cálculos de presupuesto
                                </CardDescription>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    if (editingBaseParams) {
                                        saveConfig();
                                    } else {
                                        setEditingBaseParams(true);
                                    }
                                }}
                                className="border-green-300 text-green-700 hover:bg-green-50"
                            >
                                <Edit className="h-4 w-4 mr-1" />
                                {editingBaseParams ? "Guardar" : "Editar"}
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-hidden rounded-lg border border-green-200">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-green-50">
                                            <TableHead className="text-green-800">Concepto</TableHead>
                                            <TableHead className="text-green-800 text-right">Valor</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        <TableRow className="hover:bg-green-50/50">
                                            <TableCell className="font-medium text-green-900">Salario Mínimo Colombia 2026</TableCell>
                                            <TableCell className="text-right">
                                                {editingBaseParams ? (
                                                    <Input
                                                        type="number"
                                                        value={salarioMinimo}
                                                        onChange={(e) => setSalarioMinimo(Number(e.target.value))}
                                                        className="h-7 w-32 text-right border-green-300 ml-auto"
                                                    />
                                                ) : (
                                                    <span className="text-green-800 font-semibold">{formatCurrency(salarioMinimo)}</span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                        <TableRow className="hover:bg-green-50/50">
                                            <TableCell className="font-medium text-green-900">Auxilio de Transporte</TableCell>
                                            <TableCell className="text-right">
                                                {editingBaseParams ? (
                                                    <Input
                                                        type="number"
                                                        value={auxilioTransporte}
                                                        onChange={(e) => setAuxilioTransporte(Number(e.target.value))}
                                                        className="h-7 w-32 text-right border-green-300 ml-auto"
                                                    />
                                                ) : (
                                                    <span className="text-green-800 font-semibold">{formatCurrency(auxilioTransporte)}</span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                        <TableRow className="hover:bg-green-50/50">
                                            <TableCell className="font-medium text-green-900">Días Laborales por Mes</TableCell>
                                            <TableCell className="text-right">
                                                {editingBaseParams ? (
                                                    <Input
                                                        type="number"
                                                        value={diasLaboralesMes}
                                                        onChange={(e) => setDiasLaboralesMes(Number(e.target.value))}
                                                        className="h-7 w-20 text-right border-green-300 ml-auto"
                                                    />
                                                ) : (
                                                    <span className="text-green-800 font-semibold">{diasLaboralesMes} días</span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-green-200 bg-gradient-to-br from-white to-green-50">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-green-900">Factores de Cálculo</CardTitle>
                                <CardDescription className="text-green-700">
                                    Información adicional para presupuestos
                                </CardDescription>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    if (editingCalcFactors) {
                                        saveConfig();
                                    } else {
                                        setEditingCalcFactors(true);
                                    }
                                }}
                                className="border-green-300 text-green-700 hover:bg-green-50"
                            >
                                <Edit className="h-4 w-4 mr-1" />
                                {editingCalcFactors ? "Guardar" : "Editar"}
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-hidden rounded-lg border border-green-200">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-green-50">
                                            <TableHead className="text-green-800">Concepto</TableHead>
                                            <TableHead className="text-green-800 text-right">Valor</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        <TableRow className="hover:bg-green-50/50">
                                            <TableCell className="font-medium text-green-900">Horas Laborales Diarias</TableCell>
                                            <TableCell className="text-right">
                                                {editingCalcFactors ? (
                                                    <Input
                                                        type="number"
                                                        value={horasDiarias}
                                                        onChange={(e) => setHorasDiarias(Number(e.target.value))}
                                                        className="h-7 w-20 text-right border-green-300 ml-auto"
                                                    />
                                                ) : (
                                                    <span className="text-green-800 font-semibold">{horasDiarias} horas</span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                        <TableRow className="hover:bg-green-50/50">
                                            <TableCell className="font-medium text-green-900">Horas Laborales Semanales</TableCell>
                                            <TableCell className="text-right">
                                                {editingCalcFactors ? (
                                                    <Input
                                                        type="number"
                                                        value={horasSemanales}
                                                        onChange={(e) => setHorasSemanales(Number(e.target.value))}
                                                        className="h-7 w-20 text-right border-green-300 ml-auto"
                                                    />
                                                ) : (
                                                    <span className="text-green-800 font-semibold">{horasSemanales} horas</span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                        <TableRow className="hover:bg-green-50/50">
                                            <TableCell className="font-medium text-green-900">Semanas Laborales por Mes</TableCell>
                                            <TableCell className="text-right">
                                                {editingCalcFactors ? (
                                                    <Input
                                                        type="number"
                                                        step="0.1"
                                                        value={semanasMes}
                                                        onChange={(e) => setSemanasMes(Number(e.target.value))}
                                                        className="h-7 w-20 text-right border-green-300 ml-auto"
                                                    />
                                                ) : (
                                                    <span className="text-green-800 font-semibold">{semanasMes} semanas</span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Botón para crear mano de obra */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <InsumoForm
                            setInsumos={setManoObra}
                            tipoProducto={2}
                            titulo="Mano de Obra"
                            descripcion="Completa la información de la mano de obra"
                            icon={<HardHat className="h-5 w-5 text-green-600" />}
                            mostrarBotonCrear={true}
                            onSuccess={fetchManoObra}
                            config={config}
                        />
                        <NewCuadrillaDialog onCuadrillaAdded={fetchCuadrillas} />
                    </div>
                    <div className="text-sm text-green-600">
                        {filteredManoObra.length} recurso{filteredManoObra.length !== 1 ? "s" : ""} encontrado
                        {filteredManoObra.length !== 1 ? "s" : ""}
                    </div>
                </div>

                {/* Tabla de mano de obra */}
                <InsumoTable
                    insumos={filteredManoObra}
                    setInsumos={setManoObra}
                    tipoProducto={2}
                    titulo="Mano de Obra"
                    descripcion="Lista completa de recursos humanos disponibles para presupuestos"
                    icon={<HardHat className="h-4 w-4" />}
                    config={config}
                />

                {/* Sección de Cuadrillas */}
                <Card className="border-green-200">
                    <CardHeader>
                        <CardTitle className="text-green-900 flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Cuadrillas de Trabajo
                        </CardTitle>
                        <CardDescription className="text-green-700">
                            Equipos de trabajo conformados por diferentes tipos de mano de obra
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loadingCuadrillas ? (
                            <div className="text-center py-4 text-green-600">Cargando cuadrillas...</div>
                        ) : cuadrillas.length === 0 ? (
                            <div className="text-center py-4 text-green-600">No hay cuadrillas registradas</div>
                        ) : (
                            <div className="overflow-hidden rounded-lg border border-green-200">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-green-50">
                                            <TableHead className="text-green-800">Cuadrilla</TableHead>
                                            <TableHead className="text-green-800">Integrantes</TableHead>
                                            <TableHead className="text-green-800 text-right">Jornal sin Prestaciones</TableHead>
                                            <TableHead className="text-green-800 text-right">Jornal con Prestaciones</TableHead>
                                            <TableHead className="text-green-800 w-[100px]">Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody suppressHydrationWarning>
                                        {cuadrillas.map((cuadrilla) => {
                                            let totalJornalSinPrestaciones = 0;
                                            let totalJornalConPrestaciones = 0;

                                            cuadrilla.detalles.forEach((detalle) => {
                                                const labor = manoObra.find((p) => p.id === detalle.id_producto);
                                                if (labor && labor.mano_obra && config) {
                                                    const jornal = labor.mano_obra.salario_base / config.dias_laborales_mes;
                                                    const totalPrestaciones = calcularTotalPrestaciones(labor.mano_obra);
                                                    const jornalWithBenefits = jornal * (1 + totalPrestaciones / 100);
                                                    totalJornalSinPrestaciones += jornal * detalle.cantidad;
                                                    totalJornalConPrestaciones += jornalWithBenefits * detalle.cantidad;
                                                }
                                            });

                                            const memberNames = cuadrilla.detalles.map((detalle) => {
                                                const labor = manoObra.find((p) => p.id === detalle.id_producto);
                                                return labor ? `${labor.nombre}${detalle.cantidad > 1 ? ` x${detalle.cantidad}` : ""}` : "";
                                            }).filter(Boolean);

                                            return (
                                                <TableRow key={cuadrilla.id} className="hover:bg-green-50/50">
                                                    <TableCell className="font-medium text-green-900">{cuadrilla.nombre}</TableCell>
                                                    <TableCell className="text-green-700">
                                                        <div className="space-y-1">
                                                            {memberNames.map((name, idx) => (
                                                                <div key={idx} className="text-xs text-green-600">
                                                                    • {name}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-green-800 font-medium text-right">
                                                        {formatCurrency(Math.round(totalJornalSinPrestaciones))}
                                                    </TableCell>
                                                    <TableCell className="text-green-900 font-bold text-right bg-green-50">
                                                        {formatCurrency(Math.round(totalJornalConPrestaciones))}
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
                                                                    <Eye className="h-4 w-4 mr-2" />
                                                                    Ver detalles
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem>
                                                                    <Edit className="h-4 w-4 mr-2" />
                                                                    Editar
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    className="text-red-600"
                                                                    onClick={async () => {
                                                                        try {
                                                                            await apiClient.delete(`/cuadrillas/${cuadrilla.id}`);
                                                                            fetchCuadrillas();
                                                                        } catch (error) {
                                                                            console.error("Error eliminando cuadrilla:", error);
                                                                        }
                                                                    }}
                                                                >
                                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                                    Eliminar
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>
        </>
    );
}

// Componente para crear cuadrilla (similar al mock pero usando API)
function NewCuadrillaDialog({ onCuadrillaAdded }: { onCuadrillaAdded?: () => void }) {
    const [open, setOpen] = useState(false);
    const [manoObra, setManoObra] = useState<Insumo[]>([]);
    const [formData, setFormData] = useState({
        nombre: "",
        miembros: [{ id_producto: "", cantidad: 1 }],
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            apiClient.get("/productos?tipo_producto=2&start=0&length=999")
                .then(res => setManoObra(res.data.data))
                .catch(console.error);
        }
    }, [open]);

    const handleAddMember = () => {
        setFormData((prev) => ({
            ...prev,
            miembros: [...prev.miembros, { id_producto: "", cantidad: 1 }],
        }));
    };

    const handleRemoveMember = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            miembros: prev.miembros.filter((_, i) => i !== index),
        }));
    };

    const handleMemberChange = (index: number, field: string, value: string | number) => {
        setFormData((prev) => ({
            ...prev,
            miembros: prev.miembros.map((m, i) => (i === index ? { ...m, [field]: value } : m)),
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.nombre || formData.miembros.some((m) => !m.id_producto || m.cantidad < 1)) {
            alert("Por favor, completa todos los campos correctamente");
            return;
        }

        setLoading(true);
        try {
            await apiClient.post("/cuadrillas", {
                nombre: formData.nombre,
                detalles: formData.miembros.map((m) => ({
                    id_producto: parseInt(m.id_producto),
                    cantidad: m.cantidad,
                })),
            });
            setOpen(false);
            setFormData({ nombre: "", miembros: [{ id_producto: "", cantidad: 1 }] });
            if (onCuadrillaAdded) onCuadrillaAdded();
        } catch (error) {
            console.error("Error creando cuadrilla:", error);
            alert("Error al crear la cuadrilla");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2 bg-green-600 hover:bg-green-700 text-white">
                    <Users className="h-4 w-4" />
                    Agregar Cuadrilla
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-green-900">Crear Nueva Cuadrilla</DialogTitle>
                    <DialogDescription className="text-green-700">
                        Forma equipos de trabajo combinando diferentes tipos de mano de obra
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="cuadrilla-name" className="text-green-800">
                            Nombre de la Cuadrilla *
                        </Label>
                        <Input
                            id="cuadrilla-name"
                            placeholder="Ej: Equipo de Cimentación"
                            value={formData.nombre}
                            onChange={(e) => setFormData((prev) => ({ ...prev, nombre: e.target.value }))}
                            className="border-green-200"
                            required
                        />
                    </div>

                    <div className="space-y-3">
                        <Label className="text-green-800">Miembros de la Cuadrilla *</Label>
                        {formData.miembros.map((member, index) => (
                            <div key={index} className="flex gap-2 items-end p-3 bg-green-50 rounded-lg border border-green-200">
                                <div className="flex-1">
                                    <Label className="text-xs text-green-700 mb-1 block">Cargo</Label>
                                    <Select
                                        value={member.id_producto}
                                        onValueChange={(value) => handleMemberChange(index, "id_producto", value)}
                                        required
                                    >
                                        <SelectTrigger className="border-green-200">
                                            <SelectValue placeholder="Seleccionar cargo" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {manoObra.map((labor) => (
                                                <SelectItem key={labor.id} value={labor.id.toString()}>
                                                    {labor.nombre}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="w-20">
                                    <Label className="text-xs text-green-700 mb-1 block">Cantidad</Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={member.cantidad}
                                        onChange={(e) => handleMemberChange(index, "cantidad", Number(e.target.value))}
                                        className="border-green-200"
                                        required
                                    />
                                </div>
                                {formData.miembros.length > 1 && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleRemoveMember(index)}
                                        className="text-red-600 hover:text-red-900 hover:bg-red-50"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        ))}
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleAddMember}
                            className="w-full border-green-300 text-green-700 hover:bg-green-50"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Agregar Miembro
                        </Button>
                    </div>

                    <DialogFooter className="gap-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            className="border-green-300 text-green-700 hover:bg-green-50"
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white" disabled={loading}>
                            {loading ? "Creando..." : "Crear Cuadrilla"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}