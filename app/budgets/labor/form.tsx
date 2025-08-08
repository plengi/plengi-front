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
    Wrench,
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

export interface Labores {
    id: number;
    nombre: string;
    unidad_medida: string;
    valor: number;
    tipo_proveedor: string;
    tipo_producto: number;
}

interface FormLaboresProps {
    laboresEditar?: Labores | null;
    mostrarBotonCrear?: true | false;
    setLabores: React.Dispatch<React.SetStateAction<Labores[]>>;
    setLaboresEditar?: React.Dispatch<React.SetStateAction<Labores | null>>;
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
const productosTipo = [
    { id: "1", nombre: 'Cemento' },
    { id: "2", nombre: 'Árido' },
    { id: "3", nombre: 'Acero' },
    { id: "4", nombre: 'Mampostería' },
    { id: "5", nombre: 'Madera' },
];
const proveedores = [
    { id: "1", nombre: 'Proveedor A' },
    { id: "2", nombre: 'Proveedor B' },
    { id: "3", nombre: 'Proveedor C' },
    { id: "4", nombre: 'Proveedor D' },
];

export default function CompanyForm({ setLabores, laboresEditar, setLaboresEditar, mostrarBotonCrear }: FormLaboresProps) {

    const { toast } = useToast();
    const [error, setError] = useState('');
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedUnidadMedida, setSelectedUnidadMedida] = useState<string>("");
    const [selectedProveedor, setSelectedProveedor] = useState<string>("");
    const [selectedTipoProducto, setSelectedTipoProducto] = useState<string>("");
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [formData, setFormData] = useState({
        id: 0,
        nombre: "",
        unidad_medida: "",
        valor: 0,
        tipo_proveedor: "",
        tipo_producto: 2,
    });

    useEffect(() => {
        if (laboresEditar) {
            setFormData({
                id: laboresEditar.id,
                nombre: laboresEditar.nombre,
                unidad_medida: laboresEditar.unidad_medida,
                valor: laboresEditar.valor,
                tipo_proveedor: laboresEditar.tipo_proveedor,
                tipo_producto: laboresEditar.tipo_producto
            });
            
            // Actualizar los estados de los selects
            setSelectedUnidadMedida(laboresEditar.unidad_medida);
            setSelectedProveedor(laboresEditar.tipo_proveedor);
            setSelectedTipoProducto(laboresEditar.tipo_producto.toString()); // Asegúrate de convertirlo a string si es número
            
            setOpen(true);
        }
    }, [laboresEditar]);

    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen);
        if (!isOpen) {
        // Resetear el formulario al cerrar
        setFormData({
            id: 0,
            nombre: "",
            unidad_medida: "",
            valor: 0,
            tipo_proveedor: "",
            tipo_producto: 2,
        });
        if (setLaboresEditar) setLaboresEditar(null);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    }

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
                setLabores(prev => [responseData.data, ...prev]);
                toast({
                    variant: "success",
                    title: `Labores ${action}`,
                    description: `El labores ha sido ${action} correctamente.`,
                });
            }

            handleClose();
        } catch (err) {
            toast({
                variant: "destructive",
                title: "Error Labores",
                description: "Error al crear labores.",
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
            tipo_producto: 2,
        });
        setSelectedUnidadMedida("");
        setSelectedProveedor("");
        setSelectedTipoProducto("");
        if (setLaboresEditar) setLaboresEditar(null);
    };   

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>

            <DialogTrigger asChild>
                {mostrarBotonCrear ? (
                    <Button className="gap-2 bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-200">
                        <Plus className="h-4 w-4" />
                        Nueva mano de obra
                    </Button>
                    ) : ('')
                }
            </DialogTrigger>

            <DialogContent className="sm:max-w-[500px] border-green-200">

                <DialogHeader>
                    <DialogTitle className="text-green-900 flex items-center gap-2 text-3xl">
                        <Building2 className="h-5 w-5 text-green-600" />
                        {formData.id ? 'Editar Labores' : 'Crear nuevo labores'}
                    </DialogTitle>
                    <DialogDescription className="text-green-600">
                        Completa la información de la mano de obra para {formData.id ? 'editarlo' : 'crearlo'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-0">
                        <Label htmlFor="razon_social" className="text-green-800">
                            Nombre <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="nombre"
                            name="nombre"
                            placeholder="Mano de obra A"
                            value={formData.nombre}
                            onChange={(e) => handleInputChange("nombre", e.target.value)}
                            className="border-green-200 focus:border-green-400 focus:ring-green-400"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-0">
                            <Label htmlFor="section-select" className="text-green-800">
                                Unidad de medida
                            </Label>
                            <div className="flex gap-2">
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
                            </div>
                            {errors.tipo_obra && (
                                <p className="text-red-500 text-sm">{errors.tipo_obra}</p>
                            )}
                        </div>

                        <div className="space-y-0">
                            <Label htmlFor="labores-price" className="text-green-800">
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

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-0">
                            <Label htmlFor="section-select" className="text-green-800">
                                Proveedor
                            </Label>
                            <div className="flex gap-2">
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
                            </div>
                            {errors.tipo_proveedor && (
                                <p className="text-red-500 text-sm">{errors.tipo_proveedor}</p>
                            )}
                        </div>

                        <div className="space-y-0">
                            <Label htmlFor="section-select" className="text-green-800">
                                Tipo de mano de obra
                            </Label>
                            <div className="flex gap-2">
                                <Select
                                    value={selectedTipoProducto}
                                    onValueChange={(value) => {
                                        handleInputChange("tipo_producto", value);
                                    }}
                                >
                                    <SelectTrigger className="border-green-200 focus:border-green-400 focus:ring-green-400">
                                        <SelectValue placeholder="Seleccionar tipo de mano de obra" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {productosTipo.map((tipos) => (
                                            <SelectItem key={tipos.id} value={tipos.id}>
                                                {tipos.nombre}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            {errors.tipo_proveedor && (
                                <p className="text-red-500 text-sm">{errors.tipo_proveedor}</p>
                            )}
                        </div>
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
                            ) : formData.id ? 'Actualizar Labores' : 'Crear Labores'}
                        </Button>
                    </DialogFooter>

                </form>

            </DialogContent>

            <Toaster />
        </Dialog>
    );
}