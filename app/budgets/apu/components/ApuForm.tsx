'use client';

import { useRouter } from "next/navigation";
import Link from "next/link";
import type React from "react";
import apiClient from '@/app/api/apiClient';
import { useEffect, useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    ArrowLeft, BarChart3, HardHat, Package, Plus, Save, Search,
    Trash2, Truck, Wrench, Loader
} from "lucide-react";

// Constantes
export const activityTypes = [
    "Movimiento de Tierras",
    "Hormigón Armado",
    "Albañilería",
    "Instalaciones Eléctricas",
    "Instalaciones Sanitarias",
    "Techumbres",
    "Pavimentación",
    "Terminaciones",
    "Estructura Metálica",
    "Revestimientos",
    "Otros",
];

export const units = [
    "m³",
    "m²",
    "m",
    "kg",
    "Unidad",
    "Global",
    "Jornal"
];

export interface SelectedInsumo {
    id: number;
    name: string;
    unit: string;
    unitPrice: number;
    type: string;
    category: string;
    quantity: number;
    total: number;
    wastePercentage?: number;
    performance?: number;
    supplierType?: string;
    projectId?: number;
}

export interface ApuFormData {
    id?: number;
    name: string;
    unit: string;
    unitPrice: number;
    tipo_actividad: string;
    code: string;
    description: string;
}

interface ApiProducto {
    id: number;
    id_proyecto: number;
    tipo_proveedor: string;
    nombre: string;
    unidad_medida: string;
    tipo_producto: string;
    valor: number;
    cantidad_productos?: number;
    total_productos?: number;
    detalle?: any;
    created_at: string;
    updated_at: string;
}

interface ApiResponse {
    success: boolean;
    draw: number;
    iTotalRecords: number;
    iTotalDisplayRecords: number;
    data: ApiProducto[];
    valor_promedio: string;
    perPage: number;
    message: string;
}

const INSUMO_TYPE_MAP = {
    materials: "0",
    equipment: "1",
    labor: "2",
    transport: "3"
};

interface ApuFormProps {
    mode: 'create' | 'edit';
    apuId?: number;
    onSuccess?: () => void;
}

export default function ApuForm({ mode, apuId, onSuccess }: ApuFormProps) {
    const router = useRouter();
    const { toast } = useToast();

    const [totalGeneral, setTotalGeneral] = useState(0);
    const [selectedInsumos, setSelectedInsumos] = useState<SelectedInsumo[]>([]);
    const [formData, setFormData] = useState<ApuFormData>({
        id: apuId,
        name: "",
        unit: "",
        unitPrice: 0,
        tipo_actividad: "",
        code: "",
        description: "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [insumoType, setInsumoType] = useState("materials");
    const [loadingSave, setLoadingSave] = useState(false);
    const [loadingData, setLoadingData] = useState(mode === 'edit');
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [apiInsumos, setApiInsumos] = useState<any[]>([]);
    const [pagination, setPagination] = useState({
        start: 0,
        length: 10,
        draw: 1
    });

    // Cargar datos del APU si estamos en modo edición
    useEffect(() => {
        if (mode === 'edit' && apuId) {
            fetchAPUData();
        }
    }, [mode, apuId]);

    const fetchAPUData = async () => {
        try {
            setLoadingData(true);
            const response = await apiClient.get(`/apu-find?id_apu=${apuId}`);
            const apuData = response.data.data;

            setFormData({
                id: apuData.id,
                name: apuData.nombre,
                unit: apuData.unidad_medida,
                unitPrice: apuData.valor_total,
                tipo_actividad: apuData.tipo_actividad,
                code: apuData.codigo,
                description: apuData.descripcion || "",
            });

            if (apuData.insumos && apuData.insumos.length > 0) {
                const mappedInsumos = apuData.insumos.map((insumo: any) => ({
                    id: insumo.id,
                    name: insumo.nombre,
                    unit: insumo.unidad_medida,
                    unitPrice: insumo.valor_unitario,
                    type: insumo.tipo_insumo,
                    category: getCategoryFromType(insumo.tipo_insumo),
                    quantity: insumo.cantidad,
                    total: insumo.valor_total,
                    wastePercentage: insumo.porcentaje_desperdicio || 0,
                    performance: insumo.rendimiento || 1,
                    supplierType: insumo.tipo_proveedor,
                    projectId: insumo.id_proyecto
                }));

                setSelectedInsumos(mappedInsumos);
                const suma = mappedInsumos.reduce((sum: number, i: SelectedInsumo) => sum + i.total, 0);
                setTotalGeneral(suma);
                handleInputChange("unitPrice", suma);
            } else {
                const total = Number(apuData.valor_total) || 0;
                setTotalGeneral(total);
                handleInputChange("unitPrice", total);
            }
        } catch (error) {
            console.error("Error al cargar datos del APU:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "No se pudieron cargar los datos del APU.",
            });
        } finally {
            setLoadingData(false);
        }
    };

    const fetchInsumos = async () => {
        if (!searchTerm && searchTerm === "") {
            setApiInsumos([]);
            return;
        }

        setIsLoading(true);
        try {
            const tipoProducto = INSUMO_TYPE_MAP[insumoType as keyof typeof INSUMO_TYPE_MAP];
            const response = await apiClient.get<ApiResponse>(`/productos`, {
                params: {
                    tipo_producto: tipoProducto,
                    search: searchTerm,
                    start: pagination.start,
                    length: pagination.length,
                    draw: pagination.draw
                }
            });

            const mappedInsumos = response.data.data.map((item: ApiProducto) => ({
                id: item.id,
                name: item.nombre,
                unit: item.unidad_medida,
                unitPrice: item.valor,
                type: item.tipo_producto,
                category: insumoType,
                supplierType: item.tipo_proveedor,
                averageValue: response.data.valor_promedio,
                projectId: item.id_proyecto,
                details: item.detalle
            }));

            if (pagination.start > 0) {
                setApiInsumos(prev => [...prev, ...mappedInsumos]);
            } else {
                setApiInsumos(mappedInsumos);
            }
        } catch (error) {
            console.error("Error al cargar insumos:", error);
            setApiInsumos([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm || searchTerm === "") {
                setPagination(prev => ({ ...prev, start: 0, draw: 1 }));
                fetchInsumos();
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm, insumoType]);

    useEffect(() => {
        if (pagination.start > 0) {
            fetchInsumos();
        }
    }, [pagination.start, pagination.draw]);

    const getCategoryFromType = (type: string): string => {
        for (const [key, value] of Object.entries(INSUMO_TYPE_MAP)) {
            if (value === type) return key;
        }
        return "materials";
    };

    const handleInputChange = (field: keyof ApuFormData, value: string | number) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoadingSave(true);

        if (!validateForm()) {
            setLoadingSave(false);
            return;
        };

        if (selectedInsumos.length === 0) {
            setLoadingSave(false);
            toast({
                variant: "destructive",
                title: "Error APU",
                description: "Debes agregar al menos un insumo al APU.",
            });
            return;
        }

        try {
            const endpoint = `/apus`;
            const apuData = {
                ...formData,
                insumos: selectedInsumos,
            };

            let response;
            if (mode === 'edit') {
                response = await apiClient.put(endpoint, apuData);
            } else {
                response = await apiClient.post(endpoint, apuData);
            }

            const responseData = response.data;

            if (responseData.success) {
                toast({
                    variant: "success",
                    title: `APU ${mode === 'edit' ? 'actualizado' : 'creado'}`,
                    description: `El APU ha sido ${mode === 'edit' ? 'actualizado' : 'creado'} correctamente.`,
                });

                if (onSuccess) {
                    onSuccess();
                } else {
                    router.push("/budgets/apu");
                }
            }

        } catch (err) {
            toast({
                variant: "destructive",
                title: "Error",
                description: `Error al ${mode === 'edit' ? 'actualizar' : 'crear'} el APU.`,
            });
        } finally {
            setLoadingSave(false);
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.code) newErrors.code = "Requerido";
        if (!formData.tipo_actividad) newErrors.tipo_actividad = "Requerido";
        if (!formData.name) newErrors.name = "Requerido";
        if (!formData.unit) newErrors.unit = "Requerido";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const formatPrice = (price: number): string => {
        return new Intl.NumberFormat("es-CL", {
            style: "currency",
            currency: "CLP",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(price)
    }

    const groupedInsumos = selectedInsumos.reduce(
        (groups, insumo) => {
            const category = insumo.category
            if (!groups[category]) {
                groups[category] = []
            }
            groups[category].push(insumo)
            return groups
        },
        {} as Record<string, SelectedInsumo[]>,
    )

    const categorySubtotals = Object.keys(groupedInsumos).reduce(
        (subtotals, category) => {
            subtotals[category] = groupedInsumos[category].reduce((sum, insumo) => sum + insumo.total, 0)
            return subtotals
        },
        {} as Record<string, number>,
    );

    const addInsumo = (insumo: any) => {
        const exists = selectedInsumos.some((item) => item.id === insumo.id && item.category === insumoType);

        if (exists) {
            toast({
                variant: "destructive",
                title: "Insumo duplicado",
                description: "Este insumo ya ha sido agregado",
            });
            return;
        }

        const quantity = 1;
        const unitPrice = insumo.unitPrice;
        const wastePercentage = insumoType === "materials" ? 0 : undefined;
        const performance = (insumoType === "labor" || insumoType === "equipment") ? 1 : undefined;

        let total = quantity * unitPrice;
        if (insumoType === "materials") {
            total = quantity * unitPrice * (1 + (wastePercentage || 0) / 100);
        } else if (insumoType === "labor" || insumoType === "equipment") {
            total = (quantity * unitPrice) / (performance || 1);
        }

        const newInsumo: SelectedInsumo = {
            ...insumo,
            quantity,
            total,
            ...(insumoType === "materials" && { wastePercentage }),
            ...((insumoType === "labor" || insumoType === "equipment") && { performance }),
            supplierType: insumo.supplierType,
            projectId: insumo.projectId
        }

        setSelectedInsumos((prev) => {
            const list = [...prev, newInsumo];
            const sumTotal = list.reduce((sum, item) => sum + item.total, 0);
            setTotalGeneral(sumTotal);
            handleInputChange("unitPrice", sumTotal);
            return list;
        });
    }

    const updateInsumoField = (index: number, field: keyof SelectedInsumo, value: number) => {
        const updatedInsumos = [...selectedInsumos];
        const insumo = updatedInsumos[index];

        (insumo as any)[field] = value;

        if (insumo.category === "materials") {
            const wasteMultiplier = 1 + (insumo.wastePercentage || 0) / 100;
            insumo.total = insumo.quantity * insumo.unitPrice * wasteMultiplier;
        } else if (insumo.category === "labor" || insumo.category === "equipment") {
            const performanceDivisor = insumo.performance || 1;
            insumo.total = (insumo.quantity * insumo.unitPrice) / performanceDivisor;
        } else {
            insumo.total = insumo.quantity * insumo.unitPrice;
        }

        setSelectedInsumos(updatedInsumos);
        const newTotal = updatedInsumos.reduce((sum, item) => sum + item.total, 0);
        setTotalGeneral(newTotal);
        handleInputChange("unitPrice", newTotal);
    };

    const removeInsumo = (index: number) => {
        const updatedInsumos = selectedInsumos.filter((_, i) => i !== index);
        setSelectedInsumos(updatedInsumos);
        const newTotal = updatedInsumos.reduce((sum, item) => sum + item.total, 0);
        setTotalGeneral(newTotal);
        handleInputChange("unitPrice", newTotal);
    };

    const getCategoryLabel = (category: string) => {
        switch (category) {
            case "materials": return "Materiales"
            case "equipment": return "Equipos"
            case "labor": return "Mano de Obra"
            case "transport": return "Transporte"
            default: return "Insumo"
        }
    }

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case "materials": return <Package className="h-4 w-4 text-green-600" />
            case "equipment": return <Wrench className="h-4 w-4 text-green-600" />
            case "labor": return <HardHat className="h-4 w-4 text-green-600" />
            case "transport": return <Truck className="h-4 w-4 text-green-600" />
            default: return <Package className="h-4 w-4 text-green-600" />
        }
    }

    const loadMoreResults = () => {
        setPagination(prev => ({
            start: prev.start + prev.length,
            length: prev.length,
            draw: prev.draw + 1
        }));
    };

    const categoryOrder = ["equipment", "materials", "transport", "labor"];

    if (loadingData) {
        return (
            <div className="container mx-auto py-8 space-y-6">
                <div className="flex items-center gap-2">
                    <Link href="/budgets/apu">
                        <Button variant="outline" size="icon" className="h-8 w-8 border-green-200">
                            <ArrowLeft className="h-4 w-4 text-green-600" />
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight text-green-900">
                        {mode === 'edit' ? 'Cargando APU...' : 'Preparando formulario...'}
                    </h1>
                </div>
                <div className="flex justify-center items-center h-64">
                    <Loader className="h-8 w-8 animate-spin text-green-600" />
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Link href="/budgets/apu">
                        <Button variant="outline" size="icon" className="h-8 w-8 border-green-200">
                            <ArrowLeft className="h-4 w-4 text-green-600" />
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight text-green-900">
                        {mode === 'edit' ? 'Editar APU' : 'Nuevo APU'}
                    </h1>
                </div>
                <Button
                    type="submit"
                    form="apu-form"
                    className="gap-2 bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-200"
                    disabled={loadingSave}
                >
                    {loadingSave ? (
                        <Loader className="h-4 w-4 animate-spin" />
                    ) : (
                        <Save className="h-4 w-4" />
                    )}
                    {mode === 'edit' ? 'Actualizar APU' : 'Crear APU'}
                </Button>
            </div>

            <Card className="border-green-200">
                <CardHeader>
                    <CardTitle className="text-green-900 flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-green-600" />
                        Información del APU
                    </CardTitle>
                    <CardDescription className="text-green-600">
                        Completa la información básica del Análisis de Precio Unitario.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form id="apu-form" onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="apu-code" className="text-green-800">
                                    Código APU *
                                </Label>
                                <Input
                                    id="apu-code"
                                    placeholder="Ej: APU-011"
                                    value={formData.code}
                                    onChange={(e) => handleInputChange("code", e.target.value)}
                                    className="border-green-200 focus:border-green-400 focus:ring-green-400"
                                    required
                                />
                                {errors.code && <p className="text-red-500 text-sm">{errors.code}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="apu-type" className="text-green-800">
                                    Tipo de Actividad *
                                </Label>
                                <Select
                                    value={formData.tipo_actividad}
                                    onValueChange={(value) => handleInputChange("tipo_actividad", value)}
                                    required
                                >
                                    <SelectTrigger className="border-green-200 focus:border-green-400 focus:ring-green-400">
                                        <SelectValue placeholder="Seleccionar tipo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {activityTypes.map((type) => (
                                            <SelectItem key={type} value={type}>
                                                {type}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.tipo_actividad && <p className="text-red-500 text-sm">{errors.tipo_actividad}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="apu-name" className="text-green-800">
                                Nombre de la Actividad *
                            </Label>
                            <Input
                                id="apu-name"
                                placeholder="Ej: Excavación Manual en Tierra"
                                value={formData.name}
                                onChange={(e) => handleInputChange("name", e.target.value)}
                                className="border-green-200 focus:border-green-400 focus:ring-green-400"
                                required
                            />
                            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="apu-unit" className="text-green-800">
                                    Unidad de Medida *
                                </Label>
                                <Select
                                    value={formData.unit}
                                    onValueChange={(value) => handleInputChange("unit", value)}
                                    required
                                >
                                    <SelectTrigger className="border-green-200 focus:border-green-400 focus:ring-green-400">
                                        <SelectValue placeholder="Seleccionar unidad" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {units.map((unit) => (
                                            <SelectItem key={unit} value={unit}>
                                                {unit}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.unit && <p className="text-red-500 text-sm">{errors.unit}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="apu-price" className="text-green-800">
                                    Precio Unitario Total
                                </Label>
                                <Input
                                    id="apu-price"
                                    type="text"
                                    value={formatPrice(totalGeneral)}
                                    className="border-green-200 focus:border-green-400 focus:ring-green-400 bg-gray-50 font-semibold"
                                    readOnly
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="apu-description" className="text-green-800">
                                Descripción
                            </Label>
                            <Input
                                id="apu-description"
                                placeholder="Descripción detallada de la actividad"
                                value={formData.description}
                                onChange={(e) => handleInputChange("description", e.target.value)}
                                className="border-green-200 focus:border-green-400 focus:ring-green-400"
                            />
                        </div>
                    </form>
                </CardContent>
            </Card>

            <Card className="border-green-200">
                <CardHeader>
                    <CardTitle className="text-green-900 flex items-center gap-2">
                        <Package className="h-5 w-5 text-green-600" />
                        Insumos del APU
                    </CardTitle>
                    <CardDescription className="text-green-600">
                        Agrega los insumos necesarios para realizar esta actividad.
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="insumo-type" className="text-green-800">
                                Tipo de Insumo
                            </Label>
                            <Select value={insumoType} onValueChange={setInsumoType}>
                                <SelectTrigger className="border-green-200 focus:border-green-400 focus:ring-green-400">
                                    <SelectValue placeholder="Seleccionar tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="materials">Materiales</SelectItem>
                                    <SelectItem value="equipment">Equipos</SelectItem>
                                    <SelectItem value="labor">Mano de Obra</SelectItem>
                                    <SelectItem value="transport">Transporte</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="md:col-span-2 space-y-2">
                            <Label htmlFor="insumo-search" className="text-green-800">
                                Buscar Insumo
                            </Label>
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-green-500" />
                                <Input
                                    id="insumo-search"
                                    placeholder="Buscar por nombre o proveedor..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-8 border-green-200 focus:border-green-400 focus:ring-green-400"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Resultados de búsqueda */}
                    {isLoading ? (
                        <div className="text-center py-3 text-green-600 bg-green-50/50 rounded-lg border border-green-100">
                            Buscando insumos...
                        </div>
                    ) : searchTerm && apiInsumos.length > 0 ? (
                        <div className="border border-green-100 rounded-lg overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-green-50">
                                        <TableHead className="text-green-800">Insumo</TableHead>
                                        <TableHead className="text-green-800">Unidad</TableHead>
                                        <TableHead className="text-green-800">Precio</TableHead>
                                        <TableHead className="text-green-800">Tipo Proveedor</TableHead>
                                        <TableHead className="text-green-800 w-[80px]">Acción</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {apiInsumos.map((insumo) => (
                                        <TableRow key={`${insumoType}-${insumo.id}`} className="hover:bg-green-50/50">
                                            <TableCell className="font-medium text-green-900">{insumo.name}</TableCell>
                                            <TableCell>{insumo.unit}</TableCell>
                                            <TableCell>{formatPrice(insumo.unitPrice)}</TableCell>
                                            <TableCell>{insumo.supplierType}</TableCell>
                                            <TableCell>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => addInsumo(insumo)}
                                                    className="h-8 w-8 p-0"
                                                >
                                                    <Plus className="h-4 w-4 text-green-600" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <div className="p-2 border-t border-green-200 bg-green-50 text-center">
                                <Button
                                    variant="ghost"
                                    onClick={loadMoreResults}
                                    disabled={isLoading}
                                    className="text-green-600 hover:bg-green-100"
                                >
                                    {isLoading ? 'Cargando...' : 'Cargar más resultados'}
                                </Button>
                            </div>
                        </div>
                    ) : searchTerm && !isLoading && apiInsumos.length === 0 ? (
                        <div className="text-center py-3 text-green-600 bg-green-50/50 rounded-lg border border-green-100">
                            No se encontraron insumos que coincidan con la búsqueda
                        </div>
                    ) : null}

                    {/* Insumos seleccionados */}
                    <div className="space-y-4">
                        <h3 className="text-green-800 text-lg font-semibold">Insumos Seleccionados</h3>
                        {selectedInsumos.length > 0 ? (
                            <div className="space-y-6">
                                {categoryOrder.map((category) => {
                                    const categoryInsumos = groupedInsumos[category];
                                    if (!categoryInsumos || categoryInsumos.length === 0) return null;

                                    return (
                                        <div key={category} className="border border-green-100 rounded-lg overflow-hidden">
                                            <div className="bg-green-100 px-4 py-3 border-b border-green-200">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        {getCategoryIcon(category)}
                                                        <h5 className="font-semibold text-green-800">{getCategoryLabel(category)}</h5>
                                                    </div>
                                                    <div className="text-green-700 font-medium">
                                                        Subtotal: {formatPrice(categorySubtotals[category] || 0)}
                                                    </div>
                                                </div>
                                            </div>

                                            <Table>
                                                <TableHeader>
                                                    <TableRow className="bg-green-50">
                                                        <TableHead className="text-green-800">Insumo</TableHead>
                                                        <TableHead className="text-green-800">Unidad</TableHead>
                                                        <TableHead className="text-green-800">Precio Unit.</TableHead>
                                                        <TableHead className="text-green-800">Cantidad</TableHead>
                                                        {category === "materials" && (
                                                            <TableHead className="text-green-800">% Desperdicio</TableHead>
                                                        )}
                                                        {(category === "labor" || category === "equipment") && (
                                                            <TableHead className="text-green-800">Rendimiento</TableHead>
                                                        )}
                                                        <TableHead className="text-green-800">Total</TableHead>
                                                        <TableHead className="text-green-800 w-[50px]"></TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {categoryInsumos.map((insumo, categoryIndex) => {
                                                        const globalIndex = selectedInsumos.findIndex(
                                                            (item) => item.id === insumo.id && item.category === insumo.category,
                                                        );
                                                        return (
                                                            <TableRow key={`${category}-${categoryIndex}`} className="hover:bg-green-50/50">
                                                                <TableCell className="font-medium text-green-900">{insumo.name}</TableCell>
                                                                <TableCell>{insumo.unit}</TableCell>
                                                                <TableCell>{formatPrice(insumo.unitPrice)}</TableCell>
                                                                <TableCell>
                                                                    <Input
                                                                        type="number"
                                                                        min="0.01"
                                                                        step="0.01"
                                                                        value={insumo.quantity}
                                                                        onChange={(e) =>
                                                                            updateInsumoField(globalIndex, "quantity", Number.parseFloat(e.target.value) || 0)
                                                                        }
                                                                        className="w-20 h-8 text-sm border-green-200"
                                                                    />
                                                                </TableCell>
                                                                {category === "materials" && (
                                                                    <TableCell>
                                                                        <Input
                                                                            type="number"
                                                                            min="0"
                                                                            max="100"
                                                                            step="0.1"
                                                                            value={insumo.wastePercentage || 0}
                                                                            onChange={(e) =>
                                                                                updateInsumoField(
                                                                                    globalIndex,
                                                                                    "wastePercentage",
                                                                                    Number.parseFloat(e.target.value) || 0,
                                                                                )
                                                                            }
                                                                            className="w-20 h-8 text-sm border-green-200"
                                                                            placeholder="0"
                                                                        />
                                                                    </TableCell>
                                                                )}
                                                                {(category === "labor" || category === "equipment") && (
                                                                    <TableCell>
                                                                        <Input
                                                                            type="number"
                                                                            min="0.01"
                                                                            step="0.01"
                                                                            value={insumo.performance || 1}
                                                                            onChange={(e) =>
                                                                                updateInsumoField(
                                                                                    globalIndex,
                                                                                    "performance",
                                                                                    Number.parseFloat(e.target.value) || 1,
                                                                                )
                                                                            }
                                                                            className="w-20 h-8 text-sm border-green-200"
                                                                            placeholder="1.0"
                                                                        />
                                                                    </TableCell>
                                                                )}
                                                                <TableCell className="font-medium">{formatPrice(insumo.total)}</TableCell>
                                                                <TableCell>
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => removeInsumo(globalIndex)}
                                                                        className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </TableCell>
                                                            </TableRow>
                                                        );
                                                    })}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-6 text-green-600 bg-green-50/50 rounded-lg border border-green-100">
                                No hay insumos seleccionados. Busca y agrega insumos para completar el APU.
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-4 pt-4">
                        <Link href="/budgets/apu">
                            <Button variant="outline" className="border-green-300 text-green-700 hover:bg-green-50">
                                Cancelar
                            </Button>
                        </Link>
                        <Button
                            type="submit"
                            form="apu-form"
                            className="bg-green-600 hover:bg-green-700 text-white"
                            disabled={loadingSave}
                        >
                            {loadingSave ? (
                                <Loader className="h-4 w-4 animate-spin" />
                            ) : (
                                <Plus className="h-4 w-4" />
                            )}
                            {mode === 'edit' ? 'Actualizar APU' : 'Crear APU'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}