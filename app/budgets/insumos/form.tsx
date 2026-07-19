'use client';

import type React from "react";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";
import apiClient from '@/app/api/apiClient';
import { formatCurrency } from "@/lib/format";

export interface Insumo {
    id: number;
    nombre: string;
    tipo_proveedor: string;
    unidad_medida: string;
    tipo_producto: number;
    valor: number;
    mano_obra?: {
        salario_base: number;
        tipo_salario: string;
        multiplicador: number | null;
        especialidad: string;
        jornada_horas: number;
        prestaciones?: any;
    };
}

interface InsumoFormProps {
    setInsumos: React.Dispatch<React.SetStateAction<Insumo[]>>;
    insumoEditar?: Insumo | null;
    setInsumoEditar?: (insumo: Insumo | null) => void;
    tipoProducto: number;
    titulo: string;
    descripcion: string;
    icon?: React.ReactNode;
    mostrarBotonCrear?: boolean;
    onSuccess?: () => void;
    config?: any;
}

const MINIMUM_SALARY = 498100; // Salario mínimo Colombia 2026

export default function InsumoForm({
    setInsumos,
    insumoEditar,
    setInsumoEditar,
    tipoProducto,
    titulo,
    descripcion,
    icon,
    mostrarBotonCrear = true,
    onSuccess,
    config,
}: InsumoFormProps) {
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<any>({
        nombre: '',
        tipo_proveedor: '',
        unidad_medida: '',
        valor: '',
        // Para mano de obra
        salario_base: '',
        especialidad: '',
        tipo_salario: 'monthly',
        multiplicador: '',
        jornada_horas: 8,
        // Nuevos campos para el diseño de salario
        salaryInputType: 'monthly',
        salaryValue: '',
        salaryMultiplier: 1,
    });

    // Resetear formulario al abrir/cerrar
    useEffect(() => {
        if (open) {
            if (insumoEditar) {
                setFormData({
                    nombre: insumoEditar.nombre,
                    tipo_proveedor: insumoEditar.tipo_proveedor,
                    unidad_medida: insumoEditar.unidad_medida,
                    valor: insumoEditar.valor.toString(),
                    salario_base: insumoEditar.mano_obra?.salario_base?.toString() || '',
                    especialidad: insumoEditar.mano_obra?.especialidad || '',
                    tipo_salario: insumoEditar.mano_obra?.tipo_salario || 'monthly',
                    multiplicador: insumoEditar.mano_obra?.multiplicador?.toString() || '',
                    jornada_horas: insumoEditar.mano_obra?.jornada_horas || 8,
                    salaryInputType: 'monthly',
                    salaryValue: insumoEditar.mano_obra?.salario_base?.toString() || '',
                    salaryMultiplier: (insumoEditar.mano_obra?.salario_base || 0) / MINIMUM_SALARY || 1,
                });
            } else {
                setFormData({
                    nombre: '',
                    tipo_proveedor: '',
                    unidad_medida: '',
                    valor: '',
                    salario_base: '',
                    especialidad: '',
                    tipo_salario: 'monthly',
                    multiplicador: '',
                    jornada_horas: 8,
                    salaryInputType: 'monthly',
                    salaryValue: '',
                    salaryMultiplier: 1,
                });
            }
        }
    }, [open, insumoEditar]);

    const handleChange = (field: string, value: any) => {
        setFormData((prev: any) => ({ ...prev, [field]: value }));
    };

    // Calcular salario base según el tipo de entrada
    const getBaseSalary = () => {
        const value = Number(formData.salaryValue);
        const multiplier = Number(formData.salaryMultiplier);
        switch (formData.salaryInputType) {
            case 'monthly':
                return value;
            case 'daily':
                return value * 30;
            case 'multiplier':
                return MINIMUM_SALARY * multiplier;
            default:
                return 0;
        }
    };

    const baseSalary = getBaseSalary();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload: any = {
                nombre: formData.nombre,
                tipo_proveedor: formData.tipo_proveedor,
                unidad_medida: formData.unidad_medida,
                tipo_producto: tipoProducto,
                valor: parseFloat(formData.valor) || 0,
            };

            // Si es mano de obra (tipo 2), agregar los campos específicos
            if (tipoProducto === 2) {
                // Usamos el salario calculado
                payload.salario_base = baseSalary;
                payload.especialidad = formData.especialidad;
                payload.tipo_salario = formData.tipo_salario;
                payload.multiplicador = formData.multiplicador ? parseFloat(formData.multiplicador) : null;
                payload.jornada_horas = parseInt(formData.jornada_horas) || 8;
                // No enviamos id_configuracion_prestaciones
            }

            if (insumoEditar) {
                await apiClient.put('/productos', { id: insumoEditar.id, ...payload });
                toast({ variant: "success", title: "Actualizado", description: `${titulo} actualizado correctamente` });
            } else {
                await apiClient.post('/productos', payload);
                toast({ variant: "success", title: "Creado", description: `${titulo} creado correctamente` });
            }

            setOpen(false);
            if (setInsumoEditar) setInsumoEditar(null);
            if (onSuccess) onSuccess();

            window.dispatchEvent(new CustomEvent('insumoActualizado', {
                detail: { tipoProducto }
            }));

        } catch (error: any) {
            console.error('Error guardando insumo:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: error.response?.data?.message || 'Error al guardar el insumo'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(newOpen) => {
            if (!newOpen && setInsumoEditar) setInsumoEditar(null);
            setOpen(newOpen);
        }}>
            {mostrarBotonCrear && (
                <DialogTrigger asChild>
                    <Button className="gap-2 bg-green-600 hover:bg-green-700 text-white">
                        <Plus className="h-4 w-4" />
                        Agregar {titulo}
                    </Button>
                </DialogTrigger>
            )}
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-green-200">
                <DialogHeader>
                    <DialogTitle className="text-green-900 flex items-center gap-2">
                        {icon}
                        {insumoEditar ? `Editar ${titulo}` : `Nuevo ${titulo}`}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className={`grid ${tipoProducto === 2 ? "grid-cols-1" : "grid-cols-2"} gap-4`}>
                        <div className="space-y-2">
                            <Label htmlFor="nombre" className="text-green-800">{tipoProducto === 2 ? "Nombre del cargo" : "Nombre"} *</Label>
                            <Input
                                id="nombre"
                                value={formData.nombre}
                                onChange={(e) => handleChange('nombre', e.target.value)}
                                className="border-green-200"
                                required
                            />
                        </div>
                        {tipoProducto != 2 && (
                        <div className="space-y-2">
                            <Label htmlFor="tipo_proveedor" className="text-green-800">Tipo Proveedor *</Label>
                            <Select
                                value={formData.tipo_proveedor}
                                onValueChange={(value) => handleChange('tipo_proveedor', value)}
                                required
                            >
                                <SelectTrigger className="border-green-200">
                                    <SelectValue placeholder="Seleccionar" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="empresa">Empresa</SelectItem>
                                    <SelectItem value="independiente">Independiente</SelectItem>
                                    <SelectItem value="cooperativa">Cooperativa</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>)}
                    </div>
                    {tipoProducto != 2 && (
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="unidad_medida" className="text-green-800">Unidad de Medida *</Label>
                            <Input
                                id="unidad_medida"
                                value={formData.unidad_medida}
                                onChange={(e) => handleChange('unidad_medida', e.target.value)}
                                className="border-green-200"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="valor" className="text-green-800">Valor *</Label>
                            <Input
                                id="valor"
                                type="number"
                                step="0.01"
                                value={formData.valor}
                                onChange={(e) => handleChange('valor', e.target.value)}
                                className="border-green-200"
                                required
                            />
                        </div>
                    </div>)}

                    {/* Campos específicos para mano de obra con el nuevo diseño */}
                    {tipoProducto === 2 && (
                        <>
                            {/* Tipo de Entrada de Salario */}
                            <div className="space-y-2">
                                <Label className="text-green-800">Tipo de Salario *</Label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { value: "monthly", label: "Mensual", icon: "📅" },
                                        { value: "daily", label: "Jornal", icon: "📆" },
                                        { value: "multiplier", label: "Multiplicador", icon: "✕" },
                                    ].map((option) => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => handleChange("salaryInputType", option.value)}
                                            className={`p-3 rounded-lg border-2 transition-all text-center ${
                                                formData.salaryInputType === option.value
                                                    ? "border-green-500 bg-green-100 text-green-900 font-semibold"
                                                    : "border-green-200 bg-white text-green-700 hover:border-green-300"
                                            }`}
                                        >
                                            <div className="text-lg">{option.icon}</div>
                                            <div className="text-xs">{option.label}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Entrada de Salario Dinámica */}
                            <div className="space-y-2">
                                {formData.salaryInputType === "monthly" && (
                                    <>
                                        <Label htmlFor="salary-input" className="text-green-800">
                                            Salario Base Mensual (COP) *
                                        </Label>
                                        <Input
                                            id="salary-input"
                                            type="number"
                                            placeholder="Ej: 1500000"
                                            value={formData.salaryValue}
                                            onChange={(e) => handleChange("salaryValue", e.target.value)}
                                            className="border-green-200 focus:border-green-400 focus:ring-green-400"
                                            required
                                        />
                                    </>
                                )}
                                {formData.salaryInputType === "daily" && (
                                    <>
                                        <Label htmlFor="salary-input" className="text-green-800">
                                            Jornal Básico (COP) *
                                        </Label>
                                        <Input
                                            id="salary-input"
                                            type="number"
                                            placeholder="Ej: 50000"
                                            value={formData.salaryValue}
                                            onChange={(e) => handleChange("salaryValue", e.target.value)}
                                            className="border-green-200 focus:border-green-400 focus:ring-green-400"
                                            required
                                        />
                                    </>
                                )}
                                {formData.salaryInputType === "multiplier" && (
                                    <>
                                        <Label htmlFor="salary-input" className="text-green-800">
                                            Factor Multiplicador del SMMLV *
                                        </Label>
                                        <Input
                                            id="salary-input"
                                            type="number"
                                            step="0.1"
                                            placeholder="Ej: 2.5"
                                            value={formData.salaryMultiplier}
                                            onChange={(e) => handleChange("salaryMultiplier", e.target.value)}
                                            className="border-green-200 focus:border-green-400 focus:ring-green-400"
                                            required
                                        />
                                    </>
                                )}
                                {/* Mostrar salario base calculado */}
                                {formData.salaryValue && (
                                    <div className="bg-green-50 border border-green-200 rounded p-3 mt-2">
                                        <p className="text-sm font-medium text-green-900">
                                            Salario Base Calculado: <span className="font-bold text-green-700">{formatCurrency(Math.round(baseSalary))}</span>
                                        </p>
                                        <p className="text-xs text-green-600">
                                            Factor: {(baseSalary / MINIMUM_SALARY).toFixed(2)}x del SMMLV
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="especialidad" className="text-green-800">Especialidad *</Label>
                                    <Select
                                        value={formData.especialidad}
                                        onValueChange={(value) => handleChange('especialidad', value)}
                                        required
                                    >
                                        <SelectTrigger className="border-green-200">
                                            <SelectValue placeholder="Seleccionar" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Supervisión">Supervisión</SelectItem>
                                            <SelectItem value="Albañilería">Albañilería</SelectItem>
                                            <SelectItem value="Soldadura">Soldadura</SelectItem>
                                            <SelectItem value="Operación Maquinaria">Operación Maquinaria</SelectItem>
                                            <SelectItem value="Electricidad">Electricidad</SelectItem>
                                            <SelectItem value="Plomería">Plomería</SelectItem>
                                            <SelectItem value="Carpintería">Carpintería</SelectItem>
                                            <SelectItem value="Ayudantía">Ayudantía</SelectItem>
                                            <SelectItem value="Otro">Otro</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </>
                    )}

                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            className="border-green-300 text-green-700 hover:bg-green-50"
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white" disabled={loading}>
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (insumoEditar ? 'Actualizar' : 'Crear')}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}