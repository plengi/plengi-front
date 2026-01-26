'use client';

import type React from "react";
import apiClient from '@/app/api/apiClient';
import { useEffect, useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { 
    Plus,
    Loader,
    Building2,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";

export interface Insumo {
    id: number;
    nombre: string;
    unidad_medida: string;
    valor: number;
    tipo_proveedor: string;
    tipo_producto: number;
}

interface InsumoFormProps {
    insumoEditar?: Insumo | null;
    mostrarBotonCrear?: boolean;
    setInsumos: React.Dispatch<React.SetStateAction<Insumo[]>>;
    setInsumoEditar?: React.Dispatch<React.SetStateAction<Insumo | null>>;
    tipoProducto: number;
    titulo: string;
    descripcion: string;
    icon?: React.ReactNode;
}

const units = [
    { id: "1", nombre: 'kg' },
    { id: "2", nombre: 'm³' },
    { id: "3", nombre: 'm²' },
    { id: "4", nombre: 'Metro lineal' },
    { id: "5", nombre: 'Bolsa 50kg' },
    { id: "6", nombre: 'Galón' },
    { id: "7", nombre: 'Litro' },
    { id: "8", nombre: 'Tonelada' },
];

const proveedores = [
    { id: "1", nombre: 'Proveedor A' },
    { id: "2", nombre: 'Proveedor B' },
    { id: "3", nombre: 'Proveedor C' },
    { id: "4", nombre: 'Proveedor D' },
];

export default function InsumoForm({ 
    setInsumos, 
    insumoEditar, 
    setInsumoEditar, 
    mostrarBotonCrear, 
    tipoProducto, 
    titulo, 
    descripcion,
    icon 
}: InsumoFormProps) {

    const { toast } = useToast();
    const [error, setError] = useState('');
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedUnidadMedida, setSelectedUnidadMedida] = useState<string>("");
    const [selectedProveedor, setSelectedProveedor] = useState<string>("");
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [formData, setFormData] = useState({
        id: 0,
        nombre: "",
        unidad_medida: "",
        valor: 0,
        tipo_proveedor: "",
        tipo_producto: tipoProducto,
    });

    useEffect(() => {
        if (insumoEditar) {
            setFormData({
                id: insumoEditar.id,
                nombre: insumoEditar.nombre,
                unidad_medida: insumoEditar.unidad_medida,
                valor: insumoEditar.valor,
                tipo_proveedor: insumoEditar.tipo_proveedor,
                tipo_producto: insumoEditar.tipo_producto
            });
            
            setSelectedUnidadMedida(insumoEditar.unidad_medida);
            setSelectedProveedor(insumoEditar.tipo_proveedor);
            setOpen(true);
        }
    }, [insumoEditar]);

    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen);
        if (!isOpen) {
            setFormData({
                id: 0,
                nombre: "",
                unidad_medida: "",
                valor: 0,
                tipo_proveedor: "",
                tipo_producto: tipoProducto,
            });
            if (setInsumoEditar) setInsumoEditar(null);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    }

    // En InsumoForm, modificar el handleSubmit:
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
    
        if (!validateForm()) {
            setLoading(false);
            return;
        };

        try {
            const method = formData.id ? 'put' : 'post';
            const endpoint = '/productos';
            const action = formData.id ? 'actualizado' : 'creado';

            const response = await apiClient[method](endpoint, formData);
            const responseData = response.data;

            if (response.data.success) {
                toast({
                    variant: "success",
                    title: `${titulo} ${action}`,
                    description: `El insumo ha sido ${action} correctamente.`,
                });

                handleClose();
                
                // Llamar a una función de callback para refrescar la tabla
                if (typeof window !== 'undefined') {
                    // Disparar un evento personalizado para notificar a la tabla que debe refrescarse
                    window.dispatchEvent(new CustomEvent('insumoActualizado', { 
                        detail: { tipoProducto, action } 
                    }));
                }
            }
        } catch (err) {
            toast({
                variant: "destructive",
                title: `Error ${titulo}`,
                description: `Error al ${formData.id ? 'actualizar' : 'crear'} insumo.`,
            });
        } finally {
            setLoading(false);
        }
    }

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.nombre) newErrors.nombre = "Requerido";
        if (!formData.unidad_medida) newErrors.unidad_medida = "Requerido";
        if (!formData.valor) newErrors.valor = "Requerido";
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleClose = () => {
        setOpen(false);
        setFormData({
            id: 0,
            nombre: "",
            unidad_medida: "",
            valor: 0,
            tipo_proveedor: "",
            tipo_producto: tipoProducto,
        });
        setSelectedUnidadMedida("");
        setSelectedProveedor("");
        if (setInsumoEditar) setInsumoEditar(null);
    };   

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                {mostrarBotonCrear ? (
                    <Button className="gap-2 bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-200">
                        <Plus className="h-4 w-4" />
                        Nuevo {titulo}
                    </Button>
                    ) : ('')
                }
            </DialogTrigger>

            <DialogContent className="sm:max-w-[500px] border-green-200">
                <DialogHeader>
                    <DialogTitle className="text-green-900 flex items-center gap-2 text-3xl">
                        {icon || <Building2 className="h-5 w-5 text-green-600" />}
                        {formData.id ? `Editar ${titulo}` : `Crear nuevo ${titulo}`}
                    </DialogTitle>
                    <DialogDescription className="text-green-600">
                        {descripcion}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-0">
                        <Label htmlFor="nombre" className="text-green-800">
                            Nombre <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="nombre"
                            name="nombre"
                            placeholder={`${titulo} A`}
                            value={formData.nombre}
                            onChange={(e) => handleInputChange("nombre", e.target.value)}
                            className="border-green-200 focus:border-green-400 focus:ring-green-400"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-0">
                            <Label htmlFor="unidad_medida" className="text-green-800">
                                Unidad de medida
                            </Label>
                            <Select
                                value={selectedUnidadMedida}
                                onValueChange={(value) => {
                                    setSelectedUnidadMedida(value);
                                    handleInputChange("unidad_medida", value);
                                }}
                            >
                                <SelectTrigger className="border-green-200 focus:border-green-400 focus:ring-green-400">
                                    <SelectValue placeholder="Seleccionar unidad de medida" />
                                </SelectTrigger>
                                <SelectContent>
                                    {units.map((unit) => (
                                        <SelectItem key={unit.id} value={unit.nombre}>
                                            {unit.nombre}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.unidad_medida && (
                                <p className="text-red-500 text-sm">{errors.unidad_medida}</p>
                            )}
                        </div>

                        <div className="space-y-0">
                            <Label htmlFor="valor" className="text-green-800">
                                Valor Unitario <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="valor"
                                name="valor"
                                type="number"
                                placeholder="0"
                                value={formData.valor}
                                onChange={(e) => handleInputChange("valor", e.target.value)}
                                className="border-green-200 focus:border-green-400 focus:ring-green-400"
                                required
                            />
                            {errors.valor && (
                                <p className="text-red-500 text-sm">{errors.valor}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-0">
                        <Label htmlFor="tipo_proveedor" className="text-green-800">
                            Proveedor
                        </Label>
                        <Select
                            value={selectedProveedor}
                            onValueChange={(value) => {
                                setSelectedProveedor(value);
                                handleInputChange("tipo_proveedor", value);
                            }}
                        >
                            <SelectTrigger className="border-green-200 focus:border-green-400 focus:ring-green-400">
                                <SelectValue placeholder="Seleccionar proveedor" />
                            </SelectTrigger>
                            <SelectContent>
                                {proveedores.map((proveedor) => (
                                    <SelectItem key={proveedor.id} value={proveedor.id}>
                                        {proveedor.nombre}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.tipo_proveedor && (
                            <p className="text-red-500 text-sm">{errors.tipo_proveedor}</p>
                        )}
                    </div>

                    <DialogFooter className="gap-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            className="border-green-300 text-green-700 hover:bg-green-50"
                        >
                            Cancelar
                        </Button>
                        <Button 
                            type="submit" 
                            className="bg-green-600 hover:bg-green-700 text-white"
                            disabled={loading}
                        >
                            {loading ? (
                                <Loader className="h-4 w-4 animate-spin" />
                            ) : formData.id ? `Actualizar ${titulo}` : `Crear ${titulo}`}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
            <Toaster />
        </Dialog>
    );
}