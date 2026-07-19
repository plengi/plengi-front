"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";  // ← quitamos DialogTrigger
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Edit2, Check, X, ChevronDown, ChevronRight } from "lucide-react"; // quitamos Settings2
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import apiClient from "@/app/api/apiClient";
import { formatCurrency } from "@/lib/format";

// ---------- Tipos ----------
interface Factor {
    id?: number;
    categoria: string;        // "seguridad_social", "prestaciones", "parafiscales", "otros"
    nombre_factor: string;
    descripcion: string;
    porcentaje: number;
    activo: boolean;
}

interface Configuracion {
    id?: number;
    nombre: string;
    descripcion: string;
    detalles: Factor[];
    salarioBase?: number;     // solo frontend
    transportEnabled?: boolean; // solo frontend
}

interface Props {
    onConfiguracionSaved?: () => void;
    configuracionEditar?: Configuracion | null;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

// ---------- Constantes ----------
const CATEGORIAS = [
    { key: "seguridad_social", label: "Seguridad Social" },
    { key: "prestaciones", label: "Prestaciones" },
    { key: "parafiscales", label: "Parafiscales" },
    { key: "otros", label: "Otros" },
];

const CATEGORY_COLORS: Record<string, string> = {
    seguridad_social: "bg-blue-100 text-blue-800 border-blue-300",
    prestaciones: "bg-green-100 text-green-800 border-green-300",
    parafiscales: "bg-amber-100 text-amber-800 border-amber-300",
    otros: "bg-gray-100 text-gray-800 border-gray-300",
};

const DEFAULT_AUXILIO_TRANSPORTE = 176200;
const DEFAULT_SALARIO_BASE = 498100;

export function ConfiguracionPrestacionesDialog({
    onConfiguracionSaved,
    configuracionEditar,
    open: controlledOpen,
    onOpenChange: controlledOnOpenChange,
}: Props) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    // Estado interno
    const [config, setConfig] = useState<Configuracion>({
        nombre: "",
        descripcion: "",
        detalles: [],
        salarioBase: DEFAULT_SALARIO_BASE,
        transportEnabled: true,
    });

    // Estados auxiliares
    const [editingName, setEditingName] = useState(false);
    const [tempName, setTempName] = useState("");
    const [editingFactorId, setEditingFactorId] = useState<number | null>(null);
    const [tempPercentage, setTempPercentage] = useState("");
    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
        seguridad_social: true,
        prestaciones: true,
        parafiscales: true,
        otros: true,
    });
    const [showAddFactor, setShowAddFactor] = useState(false);
    const [newFactorName, setNewFactorName] = useState("");
    const [newFactorCategory, setNewFactorCategory] = useState<string>("otros");
    const [newFactorPct, setNewFactorPct] = useState("");
    const [newFactorDesc, setNewFactorDesc] = useState("");

    // Control de apertura
    const isOpen = controlledOpen ?? false;
    const setIsOpen = controlledOnOpenChange || (() => { });

    // Al editar una configuración existente, cargar datos (pero NO abrir el diálogo manualmente)
    useEffect(() => {
        if (configuracionEditar) {
            // Normalizar datos para evitar errores de tipo
            const detallesNormalizados = configuracionEditar.detalles.map((d) => ({
                ...d,
                porcentaje: Number(d.porcentaje) || 0,
                activo: Boolean(d.activo),
            }));
            setConfig({
                ...configuracionEditar,
                detalles: detallesNormalizados,
                salarioBase: DEFAULT_SALARIO_BASE,
                transportEnabled: true,
            });
            setEditingName(false);
            setTempName(configuracionEditar.nombre);
            setEditingFactorId(null);
            setShowAddFactor(false);
            setExpandedCategories({
                seguridad_social: true,
                prestaciones: true,
                parafiscales: true,
                otros: true,
            });
        }
    }, [configuracionEditar]);

    // Resetear al cerrar
    const handleClose = () => {
        setIsOpen(false);
        setConfig({
            nombre: "",
            descripcion: "",
            detalles: [],
            salarioBase: DEFAULT_SALARIO_BASE,
            transportEnabled: true,
        });
        setEditingName(false);
        setEditingFactorId(null);
        setShowAddFactor(false);
        setNewFactorName("");
        setNewFactorCategory("otros");
        setNewFactorPct("");
        setNewFactorDesc("");
    };

    // ---------- Acciones sobre factores (sin cambios) ----------
    const toggleFactor = (factorId: number) => {
        setConfig((prev) => ({
            ...prev,
            detalles: prev.detalles.map((f) =>
                f.id === factorId ? { ...f, activo: !f.activo } : f
            ),
        }));
    };

    const toggleCategory = (catKey: string) => {
        setExpandedCategories((prev) => ({
            ...prev,
            [catKey]: !prev[catKey],
        }));
    };

    const startEditFactor = (factor: Factor) => {
        setEditingFactorId(factor.id || 0);
        setTempPercentage(factor.porcentaje.toString());
    };

    const saveFactorEdit = (factorId: number) => {
        const pct = parseFloat(tempPercentage);
        if (isNaN(pct) || pct < 0) return;
        setConfig((prev) => ({
            ...prev,
            detalles: prev.detalles.map((f) =>
                f.id === factorId ? { ...f, porcentaje: pct } : f
            ),
        }));
        setEditingFactorId(null);
    };

    const deleteFactor = (factorId: number) => {
        setConfig((prev) => ({
            ...prev,
            detalles: prev.detalles.filter((f) => f.id !== factorId),
        }));
    };

    const addFactor = () => {
        if (!newFactorName.trim() || !newFactorPct) return;
        const pct = parseFloat(newFactorPct);
        if (isNaN(pct)) return;
        const newFactor: Factor = {
            nombre_factor: newFactorName.trim(),
            categoria: newFactorCategory,
            descripcion: newFactorDesc.trim() || "",
            porcentaje: pct,
            activo: true,
        };
        setConfig((prev) => ({
            ...prev,
            detalles: [...prev.detalles, newFactor],
        }));
        setNewFactorName("");
        setNewFactorCategory("otros");
        setNewFactorPct("");
        setNewFactorDesc("");
        setShowAddFactor(false);
    };

    // ---------- Calcular totales ----------
    const totalSelected = config.detalles
        .filter((f) => f.activo)
        .reduce((sum, f) => sum + f.porcentaje, 0);

    const auxilioTransporte = 176200;
    const transportPercentage =
        config.salarioBase && config.salarioBase > 0
            ? (auxilioTransporte / config.salarioBase) * 100
            : 0;

    const totalWithTransport =
        config.transportEnabled ? totalSelected + transportPercentage : totalSelected;

    // ---------- Guardar ----------
    const handleSubmit = async () => {
        if (!config.nombre.trim()) {
            toast({ variant: "destructive", title: "Error", description: "El nombre es requerido" });
            return;
        }
        if (config.detalles.length === 0) {
            toast({ variant: "destructive", title: "Error", description: "Agrega al menos un factor" });
            return;
        }

        setLoading(true);
        try {
            const payload = {
                nombre: config.nombre.trim(),
                descripcion: config.descripcion || "",
                detalles: config.detalles.map((d) => ({
                    id: d.id,
                    categoria: d.categoria,
                    nombre_factor: d.nombre_factor,
                    descripcion: d.descripcion,
                    porcentaje: d.porcentaje,
                    activo: d.activo,
                })),
            };

            let response;
            if (config.id) {
                response = await apiClient.put(`/configuraciones-prestaciones/${config.id}`, payload);
            } else {
                response = await apiClient.post("/configuraciones-prestaciones", payload);
            }

            if (response.data.success) {
                toast({
                    variant: "success",
                    title: "Configuración guardada",
                    description: `"${config.nombre}" fue ${config.id ? "actualizada" : "creada"} correctamente.`,
                });
                if (onConfiguracionSaved) onConfiguracionSaved();
                handleClose();
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Error al guardar configuración",
            });
        } finally {
            setLoading(false);
        }
    };

    // ---------- Renderizado ----------
    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                {/* (el contenido es exactamente igual al que ya tenías, solo cambiamos el wrapper) */}
                <DialogHeader>
                    <DialogTitle className="text-green-900 text-xl">
                        {config.id ? `Editar Configuración: ${config.nombre}` : "Nueva Configuración de Prestaciones"}
                    </DialogTitle>
                    <DialogDescription className="text-green-700">
                        Configura los factores de prestaciones sociales y parafiscales. Todos los factores pueden ser activados o desactivados según tu necesidad.
                    </DialogDescription>
                </DialogHeader>

                {/* --- Panel de la configuración --- */}
                <div className="border border-green-200 rounded-xl bg-white overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between bg-green-50 px-4 py-3 border-b border-green-200">
                        <div className="flex items-center gap-2 flex-1">
                            {editingName ? (
                                <div className="flex items-center gap-2 flex-1">
                                    <Input
                                        value={tempName}
                                        onChange={(e) => setTempName(e.target.value)}
                                        className="h-7 text-sm border-green-300 focus:border-green-500 max-w-xs"
                                        autoFocus
                                    />
                                    <Button
                                        size="icon"
                                        className="h-6 w-6 bg-green-600 hover:bg-green-700"
                                        onClick={() => {
                                            setConfig((prev) => ({ ...prev, nombre: tempName.trim() }));
                                            setEditingName(false);
                                        }}
                                    >
                                        <Check className="h-3 w-3" />
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-6 w-6"
                                        onClick={() => {
                                            setTempName(config.nombre);
                                            setEditingName(false);
                                        }}
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    <span className="font-semibold text-green-900">{config.nombre}</span>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-6 w-6 text-green-600 hover:text-green-900"
                                        onClick={() => {
                                            setEditingName(true);
                                            setTempName(config.nombre);
                                        }}
                                    >
                                        <Edit2 className="h-3 w-3" />
                                    </Button>
                                </>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-right">
                                <div className="text-xs text-green-600">Total seleccionado</div>
                                <div className="text-lg font-bold text-green-700">
                                    {totalSelected.toFixed(2)}%
                                </div>
                            </div>
                            <div className="text-right border-l border-green-300 pl-3">
                                <div className="text-xs text-green-600">+ Transporte</div>
                                <div className="text-lg font-bold text-green-900">
                                    {totalWithTransport.toFixed(2)}%
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sección de Transporte */}
                    <div className="px-4 py-3 border-b border-green-100 bg-green-50/50">
                        <div className="flex items-center gap-4">
                            <input
                                type="checkbox"
                                checked={config.transportEnabled}
                                onChange={(e) =>
                                    setConfig((prev) => ({ ...prev, transportEnabled: e.target.checked }))
                                }
                                className="w-4 h-4 accent-green-600 cursor-pointer"
                            />
                            <div className="flex-1">
                                <Label className="text-green-800 text-sm font-medium">Auxilio de Transporte</Label>
                                <div className="flex items-center gap-4 mt-1">
                                    <div className="text-sm text-green-600">
                                        Valor:{" "}
                                        <span className="font-semibold text-green-800">
                                            ${auxilioTransporte.toLocaleString("es-CO")}
                                        </span>
                                    </div>
                                    <div className="text-sm text-green-600">
                                        Equivale a:{" "}
                                        <span className="font-semibold text-green-800">
                                            {transportPercentage.toFixed(2)}%
                                        </span>{" "}
                                        del salario base
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 mt-2 pl-8">
                            <Label className="text-green-700 text-xs whitespace-nowrap">
                                Salario base para cálculo:
                            </Label>
                            <Input
                                type="number"
                                value={config.salarioBase}
                                onChange={(e) =>
                                    setConfig((prev) => ({
                                        ...prev,
                                        salarioBase: parseFloat(e.target.value) || DEFAULT_SALARIO_BASE,
                                    }))
                                }
                                className="h-7 w-32 text-sm border-green-300 focus:border-green-500"
                            />
                            <span className="text-xs text-green-500">
                                (El % de transporte se calcula: Auxilio / Salario Base)
                            </span>
                        </div>
                    </div>

                    {/* Factores agrupados por categoría */}
                    <div className="divide-y divide-green-100">
                        {CATEGORIAS.map((cat) => {
                            const catFactors = config.detalles.filter((f) => f.categoria === cat.key);
                            if (catFactors.length === 0) return null;
                            const isExpanded = expandedCategories[cat.key];
                            const catTotal = catFactors
                                .filter((f) => f.activo)
                                .reduce((s, f) => s + f.porcentaje, 0);

                            return (
                                <div key={cat.key}>
                                    <button
                                        type="button"
                                        className="w-full flex items-center justify-between px-4 py-2 bg-gray-50 hover:bg-gray-100 text-left"
                                        onClick={() => toggleCategory(cat.key)}
                                    >
                                        <div className="flex items-center gap-2">
                                            {isExpanded ? (
                                                <ChevronDown className="h-3 w-3 text-gray-500" />
                                            ) : (
                                                <ChevronRight className="h-3 w-3 text-gray-500" />
                                            )}
                                            <Badge className={`text-xs ${CATEGORY_COLORS[cat.key]}`} variant="outline">
                                                {cat.label}
                                            </Badge>
                                            <span className="text-xs text-gray-500">
                                                ({catFactors.length} factores)
                                            </span>
                                        </div>
                                        <span className="text-xs font-semibold text-gray-700">
                                            {catTotal.toFixed(2)}%
                                        </span>
                                    </button>

                                    {isExpanded && (
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-gray-50/50">
                                                    <TableHead className="text-xs text-gray-600 w-8 pl-6">Sel.</TableHead>
                                                    <TableHead className="text-xs text-gray-600">Factor</TableHead>
                                                    <TableHead className="text-xs text-gray-600">Descripción</TableHead>
                                                    <TableHead className="text-xs text-gray-600 text-right">%</TableHead>
                                                    <TableHead className="text-xs text-gray-600 w-16 text-center">
                                                        Acción
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {catFactors.map((factor) => {
                                                    const isSelected = factor.activo;
                                                    const isEditing = editingFactorId === factor.id;
                                                    return (
                                                        <TableRow
                                                            key={factor.id || `new-${Math.random()}`}
                                                            className={`${isSelected ? "bg-white" : "bg-gray-50 opacity-60"} hover:opacity-100`}
                                                        >
                                                            <TableCell className="pl-6">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isSelected}
                                                                    onChange={() => toggleFactor(factor.id || 0)}
                                                                    className="w-4 h-4 accent-green-600 cursor-pointer"
                                                                />
                                                            </TableCell>
                                                            <TableCell className="text-sm font-medium text-gray-900">
                                                                {factor.nombre_factor}
                                                            </TableCell>
                                                            <TableCell className="text-xs text-gray-500">
                                                                {factor.descripcion || "—"}
                                                            </TableCell>
                                                            <TableCell className="text-right font-semibold text-green-800">
                                                                {isEditing ? (
                                                                    <div className="flex items-center gap-1 justify-end">
                                                                        <Input
                                                                            type="number"
                                                                            step="0.01"
                                                                            value={tempPercentage}
                                                                            onChange={(e) => setTempPercentage(e.target.value)}
                                                                            className="h-6 w-20 text-xs border-green-300"
                                                                            autoFocus
                                                                        />
                                                                        <Button
                                                                            size="icon"
                                                                            className="h-5 w-5 bg-green-600 hover:bg-green-700"
                                                                            onClick={() => saveFactorEdit(factor.id || 0)}
                                                                        >
                                                                            <Check className="h-3 w-3" />
                                                                        </Button>
                                                                        <Button
                                                                            size="icon"
                                                                            variant="ghost"
                                                                            className="h-5 w-5"
                                                                            onClick={() => setEditingFactorId(null)}
                                                                        >
                                                                            <X className="h-3 w-3" />
                                                                        </Button>
                                                                    </div>
                                                                ) : (
                                                                    <span>{factor.porcentaje.toFixed(2)}%</span>
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                                <div className="flex items-center justify-center gap-1">
                                                                    {!isEditing && (
                                                                        <Button
                                                                            size="icon"
                                                                            variant="ghost"
                                                                            className="h-6 w-6 text-blue-600 hover:text-blue-800"
                                                                            onClick={() => startEditFactor(factor)}
                                                                        >
                                                                            <Edit2 className="h-3 w-3" />
                                                                        </Button>
                                                                    )}
                                                                    <Button
                                                                        size="icon"
                                                                        variant="ghost"
                                                                        className="h-6 w-6 text-red-500 hover:text-red-700"
                                                                        onClick={() => deleteFactor(factor.id || 0)}
                                                                    >
                                                                        <Trash2 className="h-3 w-3" />
                                                                    </Button>
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Botón Agregar Factor */}
                    <div className="border-t border-green-200 px-4 py-3 bg-green-50/30">
                        {showAddFactor ? (
                            <div className="space-y-2">
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <Label className="text-xs text-green-800">Nombre del Factor</Label>
                                        <Input
                                            value={newFactorName}
                                            onChange={(e) => setNewFactorName(e.target.value)}
                                            className="h-7 text-sm border-green-300"
                                            placeholder="Ej: Fondo Mutual"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-xs text-green-800">Categoría</Label>
                                        <select
                                            value={newFactorCategory}
                                            onChange={(e) => setNewFactorCategory(e.target.value)}
                                            className="h-7 w-full text-sm border border-green-300 rounded px-2 focus:outline-none focus:border-green-500 bg-white"
                                        >
                                            {CATEGORIAS.map((c) => (
                                                <option key={c.key} value={c.key}>
                                                    {c.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <Label className="text-xs text-green-800">Porcentaje (%)</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={newFactorPct}
                                            onChange={(e) => setNewFactorPct(e.target.value)}
                                            className="h-7 text-sm border-green-300"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-xs text-green-800">Descripción (opcional)</Label>
                                        <Input
                                            value={newFactorDesc}
                                            onChange={(e) => setNewFactorDesc(e.target.value)}
                                            className="h-7 text-sm border-green-300"
                                            placeholder="Descripción del factor"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        className="bg-green-600 hover:bg-green-700 text-white h-7 text-xs"
                                        onClick={addFactor}
                                    >
                                        <Check className="h-3 w-3 mr-1" />
                                        Guardar Factor
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-7 text-xs border-green-300 text-green-700"
                                        onClick={() => setShowAddFactor(false)}
                                    >
                                        Cancelar
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <Button
                                size="sm"
                                variant="outline"
                                className="border-green-300 text-green-700 hover:bg-green-50 h-7 text-xs"
                                onClick={() => setShowAddFactor(true)}
                            >
                                <Plus className="h-3 w-3 mr-1" />
                                Agregar Factor
                            </Button>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <DialogFooter className="mt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleClose}
                        className="border-green-300 text-green-700 hover:bg-green-50"
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading}
                        className="bg-green-600 hover:bg-green-700 text-white"
                    >
                        {loading ? "Guardando..." : config.id ? "Actualizar Configuración" : "Crear Configuración"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}