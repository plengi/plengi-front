"use client"

import Link from "next/link";
import type React from "react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, BarChart3, HardHat, Package, Plus, Search, Trash2, Truck, Wrench } from "lucide-react";
import apiClient from '@/app/api/apiClient';

// Constantes
const activityTypes = [
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

const units = [
    "m³",
    "m²",
    "m",
    "kg",
    "Unidad",
    "Global",
    "Jornal"
];

interface SelectedInsumo {
  id: number
  name: string
  unit: string
  unitPrice: number
  type: string
  category: string
  quantity: number
  total: number
  // Campos adicionales según el tipo
  wastePercentage?: number // Para materiales
  performance?: number // Para mano de obra y equipos
  supplierType?: string
  projectId?: number
};

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

// Mapeo de tipos de insumo a tipo_producto
const INSUMO_TYPE_MAP = {
    materials: "0", // Materiales
    equipment: "1", // Equipos
    labor: "2",     // Mano de obra
    transport: "3"  // Transporte
};

export default function NewAPUPage() {
    const [selectedInsumos, setSelectedInsumos] = useState<SelectedInsumo[]>([]);
    const [formData, setFormData] = useState({
        name: "",
        unit: "",
        unitPrice: 0,
        activityType: "",
        code: "",
        description: "",
    });
    const [insumoType, setInsumoType] = useState("materials");
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [apiInsumos, setApiInsumos] = useState<any[]>([]);
    const [pagination, setPagination] = useState({
        start: 0,
        length: 10,
        draw: 1
    });

    // Función para cargar insumos desde la API
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
            
            // Mapea la respuesta de la API al formato esperado
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

    // Efecto para buscar insumos cuando cambia el término de búsqueda o el tipo
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm || searchTerm === "") {
                setPagination(prev => ({...prev, start: 0, draw: 1}));
                fetchInsumos();
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm, insumoType]);

    // Efecto para cargar más resultados
    useEffect(() => {
        if (pagination.start > 0) {
            fetchInsumos();
        }
    }, [pagination.start, pagination.draw]);

    const handleInputChange = (field: string, value: string | number) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        console.log('guardando el formulario');
    }

    const formatPrice = (price: number): string => {
        return new Intl.NumberFormat("es-CL", {
            style: "currency",
            currency: "CLP",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(price)
    }

    // Agrupar insumos por categoría
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

    // Calcular subtotales por categoría
    const categorySubtotals = Object.keys(groupedInsumos).reduce(
        (subtotals, category) => {
        subtotals[category] = groupedInsumos[category].reduce((sum, insumo) => sum + insumo.total, 0)
        return subtotals
        },
        {} as Record<string, number>,
    );

    // Calcular total general
    const totalGeneral = Object.values(categorySubtotals).reduce((sum, subtotal) => sum + subtotal, 0);

    const addInsumo = (insumo: any) => {
        const exists = selectedInsumos.some((item) => item.id === insumo.id && item.category === insumoType);

        if (exists) {
        alert("Este insumo ya ha sido agregado")
        return
        }

        const newInsumo: SelectedInsumo = {
        ...insumo,
        quantity: 1,
        total: insumo.unitPrice,
        ...(insumoType === "materials" && { wastePercentage: 0 }),
        ...((insumoType === "labor" || insumoType === "equipment") && { performance: 1 }),
        supplierType: insumo.supplierType,
        projectId: insumo.projectId
        }

        setSelectedInsumos([...selectedInsumos, newInsumo])
    }

    const updateInsumoField = (index: number, field: keyof SelectedInsumo, value: number) => {
        const updatedInsumos = [...selectedInsumos]
        const insumo = updatedInsumos[index]

        ;(insumo as any)[field] = value

        if (insumo.category === "materials") {
            const wasteMultiplier = 1 + (insumo.wastePercentage || 0) / 100
            insumo.total = insumo.quantity * insumo.unitPrice * wasteMultiplier
        } else if (insumo.category === "labor" || insumo.category === "equipment") {
            const performanceDivisor = insumo.performance || 1
            insumo.total = (insumo.quantity * insumo.unitPrice) / performanceDivisor
        } else {
            insumo.total = insumo.quantity * insumo.unitPrice
        }

        setSelectedInsumos(updatedInsumos)

        const newTotal = updatedInsumos.reduce((sum, item) => sum + item.total, 0)
        handleInputChange("unitPrice", newTotal)
    }

    const removeInsumo = (index: number) => {
        const updatedInsumos = selectedInsumos.filter((_, i) => i !== index)
        setSelectedInsumos(updatedInsumos)

        const newTotal = updatedInsumos.reduce((sum, item) => sum + item.total, 0)
        handleInputChange("unitPrice", newTotal)
    }

    const getCategoryLabel = (category: string) => {
        switch (category) {
        case "materials":
            return "Materiales"
        case "equipment":
            return "Equipos"
        case "labor":
            return "Mano de Obra"
        case "transport":
            return "Transporte"
        default:
            return "Insumo"
        }
    }

    const getCategoryIcon = (category: string) => {
        switch (category) {
        case "materials":
            return <Package className="h-4 w-4 text-green-600" />
        case "equipment":
            return <Wrench className="h-4 w-4 text-green-600" />
        case "labor":
            return <HardHat className="h-4 w-4 text-green-600" />
        case "transport":
            return <Truck className="h-4 w-4 text-green-600" />
        default:
            return <Package className="h-4 w-4 text-green-600" />
        }
    }

    const loadMoreResults = () => {
        setPagination(prev => ({
            start: prev.start + prev.length,
            length: prev.length,
            draw: prev.draw + 1
        }));
    };

    const categoryOrder = ["equipment", "materials", "transport", "labor"]

    return (
        <div className="container mx-auto py-8 space-y-6">

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Link href="/budgets/apu">
                        <Button variant="outline" size="icon" className="h-8 w-8 border-green-200">
                        <ArrowLeft className="h-4 w-4 text-green-600" />
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight text-green-900">Crear Nuevo APU</h1>
                </div>
                <Button
                    type="submit"
                    form="apu-form"
                    className="gap-2 bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-200"
                >
                <Plus className="h-4 w-4" />
                    Guardar APU
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
                            <div className="space-y-0">
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
                            </div>

                            <div className="space-y-0">
                                <Label htmlFor="apu-type" className="text-green-800">
                                    Tipo de Actividad *
                                </Label>
                                <Select
                                    value={formData.activityType}
                                    onValueChange={(value) => handleInputChange("activityType", value)}
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
                            </div>
                        </div>

                        <div className="space-y-0">
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
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-0">
                                <Label htmlFor="apu-unit" className="text-green-800">
                                    Unidad de Medida *
                                </Label>
                                <Select value={formData.unit} onValueChange={(value) => handleInputChange("unit", value)} required>
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
                            </div>

                            <div className="space-y-0">
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

                        <div className="space-y-0">
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
                        <div className="space-y-0">
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

                        <div className="md:col-span-2 space-y-0">
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

                    {/* Insumos seleccionados agrupados por categoría */}
                    <div className="space-y-4">
                        <h1 className="text-green-800 text-lg font-semibold leading-none tracking-tight">Insumos Seleccionados</h1>
                        {selectedInsumos.length > 0 ? (
                            <div className="space-y-6">
                                {categoryOrder.map((category) => {
                                    const categoryInsumos = groupedInsumos[category]
                                    if (!categoryInsumos || categoryInsumos.length === 0) return null

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
                                                        )
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
                                                        )
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
                </CardContent>
            </Card>
        </div>
    );
}