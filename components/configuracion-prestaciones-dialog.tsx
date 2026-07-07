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
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Save, X } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import apiClient from "@/app/api/apiClient";
import { formatCurrency } from "@/lib/format";
import { calcularTotalPrestaciones } from "@/lib/laborUtils";

interface Factor {
    id?: number;
    categoria: string;
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
}

interface Props {
    onConfiguracionSaved?: () => void;
    configuracionEditar?: Configuracion | null;
    trigger?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

const CATEGORIAS = [
    { value: "seguridad_social", label: "Seguridad Social" },
    { value: "prestaciones", label: "Prestaciones" },
    { value: "parafiscales", label: "Parafiscales" },
    { value: "otros", label: "Otros" },
];

export function ConfiguracionPrestacionesDialog({
    onConfiguracionSaved,
    configuracionEditar,
    trigger,
    open: controlledOpen,
    onOpenChange: controlledOnOpenChange,
}: Props) {
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [configuracion, setConfiguracion] = useState<Configuracion>({
        nombre: "",
        descripcion: "",
        detalles: [],
    });

    const isOpen = controlledOpen !== undefined ? controlledOpen : open;
    const setIsOpen = controlledOnOpenChange || setOpen;

    useEffect(() => {
        if (configuracionEditar) {
            setConfiguracion({
                nombre: configuracionEditar.nombre,
                descripcion: configuracionEditar.descripcion || "",
                detalles: configuracionEditar.detalles.map((d) => ({ ...d })),
            });
            setIsOpen(true);
        }
    }, [configuracionEditar]);

    const agregarFactor = () => {
        setConfiguracion((prev) => ({
            ...prev,
            detalles: [
                ...prev.detalles,
                {
                    categoria: "seguridad_social",
                    nombre_factor: "",
                    descripcion: "",
                    porcentaje: 0,
                    activo: true,
                },
            ],
        }));
    };

    const eliminarFactor = (index: number) => {
        setConfiguracion((prev) => ({
            ...prev,
            detalles: prev.detalles.filter((_, i) => i !== index),
        }));
    };

    const actualizarFactor = (index: number, field: keyof Factor, value: any) => {
        setConfiguracion((prev) => ({
            ...prev,
            detalles: prev.detalles.map((f, i) =>
                i === index ? { ...f, [field]: value } : f
            ),
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!configuracion.nombre.trim()) {
            toast({ variant: "destructive", title: "Error", description: "El nombre es requerido" });
            return;
        }
        if (configuracion.detalles.length === 0) {
            toast({ variant: "destructive", title: "Error", description: "Agrega al menos un factor" });
            return;
        }

        setLoading(true);
        try {
            const payload = {
                nombre: configuracion.nombre,
                descripcion: configuracion.descripcion,
                detalles: configuracion.detalles.map((d) => ({
                    id: d.id,
                    categoria: d.categoria,
                    nombre_factor: d.nombre_factor,
                    descripcion: d.descripcion,
                    porcentaje: d.porcentaje,
                    activo: d.activo,
                })),
            };

            let response;
            if (configuracion.id) {
                response = await apiClient.put(`/configuraciones-prestaciones/${configuracion.id}`, payload);
            } else {
                response = await apiClient.post("/configuraciones-prestaciones", payload);
            }

            if (response.data.success) {
                toast({
                    variant: "success",
                    title: "Configuración guardada",
                    description: `La configuración "${configuracion.nombre}" fue ${configuracion.id ? 'actualizada' : 'creada'} correctamente.`,
                });
                if (onConfiguracionSaved) onConfiguracionSaved();
                handleClose();
            }
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Error al guardar configuración" });
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setIsOpen(false);
        setConfiguracion({ nombre: "", descripcion: "", detalles: [] });
    };

    const totalPrestaciones = calcularTotalPrestaciones(configuracion);

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-green-900">
                        {configuracion.id ? `Editar Configuración: ${configuracion.nombre}` : "Nueva Configuración de Prestaciones"}
                    </DialogTitle>
                    <DialogDescription>
                        Configura los factores de prestaciones sociales y parafiscales para cada rango salarial.
                        Puedes activar o desactivar cada factor según tu necesidad.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Nombre de la Configuración *</Label>
                            <Input
                                value={configuracion.nombre}
                                onChange={(e) => setConfiguracion((p) => ({ ...p, nombre: e.target.value }))}
                                placeholder="Ej: Prestaciones Estándar"
                                required
                            />
                        </div>
                        <div>
                            <Label>Descripción</Label>
                            <Input
                                value={configuracion.descripcion}
                                onChange={(e) => setConfiguracion((p) => ({ ...p, descripcion: e.target.value }))}
                                placeholder="Descripción opcional"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <Label className="text-base font-semibold">Factores</Label>
                        <Button type="button" variant="outline" size="sm" onClick={agregarFactor}>
                            <Plus className="h-4 w-4 mr-1" /> Agregar Factor
                        </Button>
                    </div>

                    {configuracion.detalles.map((factor, index) => (
                        <div key={index} className="border border-green-200 rounded-lg p-4 bg-green-50/50">
                            <div className="flex items-start gap-3">
                                <div className="flex-1 grid grid-cols-3 gap-2">
                                    <div>
                                        <Label className="text-xs">Categoría</Label>
                                        <select
                                            className="w-full rounded border border-green-200 p-1 text-sm"
                                            value={factor.categoria}
                                            onChange={(e) => actualizarFactor(index, "categoria", e.target.value)}
                                        >
                                            {CATEGORIAS.map((cat) => (
                                                <option key={cat.value} value={cat.value}>{cat.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <Label className="text-xs">Factor</Label>
                                        <Input
                                            className="h-8 text-sm"
                                            value={factor.nombre_factor}
                                            onChange={(e) => actualizarFactor(index, "nombre_factor", e.target.value)}
                                            placeholder="Ej: Pensión"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-xs">Descripción</Label>
                                        <Input
                                            className="h-8 text-sm"
                                            value={factor.descripcion}
                                            onChange={(e) => actualizarFactor(index, "descripcion", e.target.value)}
                                            placeholder="Aporte patronal"
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-20">
                                        <Label className="text-xs">%</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            className="h-8 text-sm"
                                            value={factor.porcentaje}
                                            onChange={(e) => actualizarFactor(index, "porcentaje", Number(e.target.value))}
                                        />
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Label className="text-xs">Activo</Label>
                                        <Switch
                                            checked={factor.activo}
                                            onCheckedChange={(checked) => actualizarFactor(index, "activo", checked)}
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-red-600 hover:text-red-800"
                                        onClick={() => eliminarFactor(index)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {configuracion.detalles.length > 0 && (
                        <div className="bg-green-100 border border-green-300 rounded p-3 text-sm">
                            <p className="font-semibold">Total seleccionado: <span className="text-green-800">{totalPrestaciones.toFixed(2)}%</span></p>
                            <p className="text-xs text-green-600">* Solo se suman los factores activos</p>
                        </div>
                    )}

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleClose}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700">
                            {loading ? "Guardando..." : "Guardar Configuración"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}