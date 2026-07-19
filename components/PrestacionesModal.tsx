"use client";

import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { getDefaultPrestaciones, PrestacionesData, PrestacionFactor } from "@/constants/prestacionesDefault";
import { formatCurrency } from "@/lib/format";
import apiClient from "@/app/api/apiClient";
import { Insumo } from "@/app/budgets/insumos/form";
import { Label } from "@/components/ui/label";
import { Edit2, Trash2, Check, X, Plus } from "lucide-react";

type CategoriaPrestaciones = Exclude<keyof PrestacionesData, 'auxilio_transporte'>;

interface PrestacionesModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    insumo: Insumo;
    config: any;
    onSave: () => void;
}

export function PrestacionesModal({
    open,
    onOpenChange,
    insumo,
    config,
    onSave,
}: PrestacionesModalProps) {
    const [prestaciones, setPrestaciones] = useState<PrestacionesData | null>(null);
    const [loading, setLoading] = useState(false);
    // Estados para editar porcentaje
    const [editingFactorId, setEditingFactorId] = useState<string | null>(null);
    const [tempPercentage, setTempPercentage] = useState<string>("");

    // Estados para agregar factor
    const [showAddFactor, setShowAddFactor] = useState(false);
    const [newFactorName, setNewFactorName] = useState("");
    const [newFactorCategory, setNewFactorCategory] = useState<CategoriaPrestaciones>("otros");
    const [newFactorPct, setNewFactorPct] = useState("");
    const [newFactorDesc, setNewFactorDesc] = useState("");

    useEffect(() => {
        if (open && insumo && config) {
            const mo = insumo.mano_obra;
            if (mo?.prestaciones) {
                setPrestaciones(mo.prestaciones);
            } else {
                const salarioBase = mo?.salario_base || 0;
                const auxilio = config.auxilio_transporte || 0;
                setPrestaciones(getDefaultPrestaciones(salarioBase, auxilio));
            }
        }
    }, [open, insumo, config]);

    const calcularTotal = () => {
        if (!prestaciones) return 0;
        let total = 0;
        const categorias: CategoriaPrestaciones[] = ["seguridad_social", "prestaciones", "parafiscales", "otros"];
        categorias.forEach((cat) => {
            prestaciones[cat].forEach((factor) => {
                if (factor.activo) {
                    total += factor.porcentaje;
                }
            });
        });
        // Si el auxilio de transporte está activo, sumar su porcentaje
        if (prestaciones.auxilio_transporte.activo) {
            total += prestaciones.auxilio_transporte.porcentaje;
        }
        return total;
    };

    // Actualizar un factor (activar/desactivar o cambiar porcentaje)
    const updateFactor = (
        categoria: CategoriaPrestaciones,
        index: number,
        field: keyof PrestacionFactor,
        value: any
    ) => {
        if (!prestaciones) return;
        const newData = { ...prestaciones };
        const categoriaArray = newData[categoria] as PrestacionFactor[];
        const factor = { ...categoriaArray[index] };
        (factor as any)[field] = value;
        categoriaArray[index] = factor;
        setPrestaciones(newData);
    };

    // Eliminar un factor
    const deleteFactor = (categoria: CategoriaPrestaciones, index: number) => {
        if (!prestaciones) return;
        const newData = { ...prestaciones };
        const categoriaArray = newData[categoria] as PrestacionFactor[];
        categoriaArray.splice(index, 1);
        setPrestaciones(newData);
    };

    // Iniciar edición de porcentaje
    const startEditing = (factorId: string, currentPercentage: number) => {
        setEditingFactorId(factorId);
        setTempPercentage(currentPercentage.toString());
    };

    // Guardar edición de porcentaje
    const saveEditing = (categoria: CategoriaPrestaciones, index: number) => {
        const pct = parseFloat(tempPercentage);
        if (!isNaN(pct) && pct >= 0) {
            updateFactor(categoria, index, "porcentaje", pct);
        }
        setEditingFactorId(null);
        setTempPercentage("");
    };

    // Cancelar edición
    const cancelEditing = () => {
        setEditingFactorId(null);
        setTempPercentage("");
    };

    // Agregar nuevo factor
    const addFactor = () => {
        if (!newFactorName || !newFactorPct) return;
        const pct = parseFloat(newFactorPct);
        if (isNaN(pct) || pct < 0) return;
        if (!prestaciones) return;

        const newFactor: PrestacionFactor = {
            nombre: newFactorName,
            descripcion: newFactorDesc || "",
            porcentaje: pct,
            activo: true,
        };

        const newData = { ...prestaciones };
        const categoriaArray = newData[newFactorCategory] as PrestacionFactor[];
        categoriaArray.push(newFactor);
        setPrestaciones(newData);

        // Resetear campos
        setNewFactorName("");
        setNewFactorCategory("otros");
        setNewFactorPct("");
        setNewFactorDesc("");
        setShowAddFactor(false);
    };

    // Alternar estado del auxilio de transporte
    const toggleTransporte = () => {
        if (!prestaciones) return;
        setPrestaciones({
            ...prestaciones,
            auxilio_transporte: {
                ...prestaciones.auxilio_transporte,
                activo: !prestaciones.auxilio_transporte.activo,
            },
        });
    };

    const handleSave = async () => {
        if (!prestaciones || !insumo) return;
        setLoading(true);
        try {
            await apiClient.put("/productos", {
                id: insumo.id,
                prestaciones: prestaciones,
                nombre: insumo.nombre,
                tipo_proveedor: insumo.tipo_proveedor,
                unidad_medida: insumo.unidad_medida,
                tipo_producto: insumo.tipo_producto,
                valor: insumo.valor,
                salario_base: insumo.mano_obra?.salario_base || 0,
                especialidad: insumo.mano_obra?.especialidad || "",
                tipo_salario: insumo.mano_obra?.tipo_salario || "monthly",
                multiplicador: insumo.mano_obra?.multiplicador || null,
                jornada_horas: insumo.mano_obra?.jornada_horas || 8,
            });
            onSave();
            onOpenChange(false);
        } catch (error) {
            console.error("Error guardando prestaciones:", error);
            alert("Error al guardar las prestaciones");
        } finally {
            setLoading(false);
        }
    };

    if (!prestaciones) return null;

    const totalPrestaciones = calcularTotal();

    const categorias: { key: CategoriaPrestaciones; label: string }[] = [
        { key: "seguridad_social", label: "Seguridad Social" },
        { key: "prestaciones", label: "Prestaciones" },
        { key: "parafiscales", label: "Parafiscales" },
        { key: "otros", label: "Otros" },
    ];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto border-green-200">
                <DialogHeader>
                    <DialogTitle className="text-green-900 flex items-center gap-2">
                        Prestaciones de {insumo.nombre}
                    </DialogTitle>
                </DialogHeader>

                {/* Auxilio de Transporte con checkbox */}
                <div className="bg-green-50 p-3 rounded-md border border-green-200 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Checkbox
                            checked={prestaciones.auxilio_transporte.activo}
                            onCheckedChange={toggleTransporte}
                        />
                        <h4 className="font-semibold text-green-800">Auxilio de Transporte</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm mt-1 pl-6">
                        <span className="text-green-700">Valor:</span>
                        <span className="font-medium">{formatCurrency(prestaciones.auxilio_transporte.valor)}</span>
                        <span className="text-green-700">Equivale a:</span>
                        <span className="font-medium">{prestaciones.auxilio_transporte.porcentaje.toFixed(2)}% del salario base</span>
                        <span className="text-green-700">Salario base:</span>
                        <span className="font-medium">{formatCurrency(insumo.mano_obra?.salario_base || 0)}</span>
                    </div>
                </div>

                {/* Categorías con tabla y acciones */}
                {categorias.map((cat) => {
                    const factores = prestaciones[cat.key] as PrestacionFactor[];
                    const subtotal = factores.filter(f => f.activo).reduce((sum, f) => sum + f.porcentaje, 0);
                    return (
                        <div key={cat.key} className="border border-green-200 rounded-md p-3 mb-3">
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="font-semibold text-green-800">{cat.label}</h4>
                                <span className="text-sm text-green-600">
                                    ({factores.length} factores) {subtotal.toFixed(2)}%
                                </span>
                            </div>

                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-green-100">
                                        <th className="text-left py-1 w-8">Sel.</th>
                                        <th className="text-left py-1">Factor</th>
                                        <th className="text-left py-1">Descripción</th>
                                        <th className="text-right py-1 w-16">%</th>
                                        <th className="text-center py-1 w-20">Acción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {factores.map((factor, idx) => {
                                        const isEditing = editingFactorId === `${cat.key}-${idx}`;
                                        return (
                                            <tr
                                                key={idx}
                                                className={`${factor.activo ? "bg-white" : "bg-gray-50 opacity-60"} hover:opacity-100 border-b border-green-50`}
                                            >
                                                <td className="py-1 pl-1">
                                                    <Checkbox
                                                        checked={factor.activo}
                                                        onCheckedChange={(checked) =>
                                                            updateFactor(cat.key, idx, "activo", !!checked)
                                                        }
                                                    />
                                                </td>
                                                <td className="py-1 font-medium text-gray-900">{factor.nombre}</td>
                                                <td className="py-1 text-xs text-gray-500">{factor.descripcion}</td>
                                                <td className="py-1 text-right font-semibold text-green-800">
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
                                                                onClick={() => saveEditing(cat.key, idx)}
                                                            >
                                                                <Check className="h-3 w-3" />
                                                            </Button>
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                className="h-5 w-5"
                                                                onClick={cancelEditing}
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <span>{factor.porcentaje.toFixed(2)}%</span>
                                                    )}
                                                </td>
                                                <td className="py-1 text-center">
                                                    <div className="flex items-center justify-center gap-1">
                                                        {!isEditing && (
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                className="h-6 w-6 text-blue-600 hover:text-blue-800"
                                                                onClick={() => startEditing(`${cat.key}-${idx}`, factor.porcentaje)}
                                                            >
                                                                <Edit2 className="h-3 w-3" />
                                                            </Button>
                                                        )}
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="h-6 w-6 text-red-500 hover:text-red-700"
                                                            onClick={() => deleteFactor(cat.key, idx)}
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>

                            {/* Botón para agregar factor en esta categoría */}
                            <div className="mt-2">
                                {showAddFactor && newFactorCategory === cat.key ? (
                                    <div className="space-y-2 border-t border-green-200 pt-2">
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
                                            <div className="col-span-2">
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
                                                onClick={() => {
                                                    setShowAddFactor(false);
                                                    setNewFactorName("");
                                                    setNewFactorPct("");
                                                    setNewFactorDesc("");
                                                }}
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
                                        onClick={() => {
                                            setShowAddFactor(true);
                                            setNewFactorCategory(cat.key);
                                        }}
                                    >
                                        <Plus className="h-3 w-3 mr-1" />
                                        Agregar Factor en {cat.label}
                                    </Button>
                                )}
                            </div>
                        </div>
                    );
                })}

                {/* Total */}
                <div className="bg-green-50 p-3 rounded-md border border-green-200 flex justify-between">
                    <span className="font-bold text-green-900">Total Prestaciones</span>
                    <span className="font-bold text-green-900">{totalPrestaciones.toFixed(2)}%</span>
                </div>

                <DialogFooter className="gap-2 pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="border-green-300 text-green-700 hover:bg-green-50"
                    >
                        Cancelar
                    </Button>
                    <Button onClick={handleSave} disabled={loading} className="bg-green-600 hover:bg-green-700 text-white">
                        {loading ? "Guardando..." : "Guardar Prestaciones"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}