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
    User,
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

export interface Cliente {
    id: number;
    nombres: string;
    apellidos: string;
    tipo_documento: string;
    numero_documento: string;
    direccion: string;
    email: string;
    telefono: string;
}

interface FormClienteProps {
    clienteEditar?: Cliente | null;
    mostrarBotonCrear?: true | false;
    setClientes: React.Dispatch<React.SetStateAction<Cliente[]>>;
    setClienteEditar?: React.Dispatch<React.SetStateAction<Cliente | null>>;
}

const tiposDocumento = [
    { id: "CC", nombre: 'Cédula de Ciudadanía' },
    { id: "CE", nombre: 'Cédula de Extranjería' },
    { id: "NIT", nombre: 'NIT' },
    { id: "PASAPORTE", nombre: 'Pasaporte' },
    { id: "OTRO", nombre: 'Otro' },
];

export default function ClienteForm({ setClientes, clienteEditar, setClienteEditar, mostrarBotonCrear }: FormClienteProps) {

    const { toast } = useToast();
    const [error, setError] = useState('');
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedTipoDocumento, setSelectedTipoDocumento] = useState<string>("");
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [formData, setFormData] = useState({
        id: 0,
        nombres: "",
        apellidos: "",
        tipo_documento: "",
        numero_documento: "",
        direccion: "",
        email: "",
        telefono: "",
    });

    useEffect(() => {
        if (clienteEditar) {
            setFormData({
                id: clienteEditar.id,
                nombres: clienteEditar.nombres,
                apellidos: clienteEditar.apellidos,
                tipo_documento: clienteEditar.tipo_documento,
                numero_documento: clienteEditar.numero_documento,
                direccion: clienteEditar.direccion,
                email: clienteEditar.email,
                telefono: clienteEditar.telefono,
            });
            
            setSelectedTipoDocumento(clienteEditar.tipo_documento);
            setOpen(true);
        }
    }, [clienteEditar]);

    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen);
        if (!isOpen) {
            setFormData({
                id: 0,
                nombres: "",
                apellidos: "",
                tipo_documento: "",
                numero_documento: "",
                direccion: "",
                email: "",
                telefono: "",
            });
            setSelectedTipoDocumento("");
            if (setClienteEditar) setClienteEditar(null);
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
            const endpoint = '/clientes';
            const action = formData.id ? 'actualizado' : 'creado';

            const response = await apiClient[method](endpoint, formData);
            const responseData = response.data;

            if (response.data.success) {
                if (formData.id) {
                    // Actualizar el cliente en la lista
                    setClientes(prev => prev.map(cliente => 
                        cliente.id === formData.id ? responseData.data : cliente
                    ));
                } else {
                    // Agregar el nuevo cliente a la lista
                    setClientes(prev => [responseData.data, ...prev]);
                }
                toast({
                    variant: "success",
                    title: `Cliente ${action}`,
                    description: `El cliente ha sido ${action} correctamente.`,
                });
            }

            handleClose();
        } catch (err) {
            toast({
                variant: "destructive",
                title: "Error Cliente",
                description: "Error al crear cliente.",
            });
        } finally {
            setLoading(false);
        }
    }

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.nombres) newErrors.nombres = "Requerido";
        if (!formData.tipo_documento) newErrors.tipo_documento = "Requerido";
        if (!formData.numero_documento) newErrors.numero_documento = "Requerido";
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleClose = () => {
        setOpen(false);
        setFormData({
            id: 0,
            nombres: "",
            apellidos: "",
            tipo_documento: "",
            numero_documento: "",
            direccion: "",
            email: "",
            telefono: "",
        });
        setSelectedTipoDocumento("");
        if (setClienteEditar) setClienteEditar(null);
    };   

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>

            <DialogTrigger asChild>
                {mostrarBotonCrear ? (
                    <Button className="gap-2 bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-200">
                        <Plus className="h-4 w-4" />
                        Nuevo Cliente
                    </Button>
                    ) : ('')
                }
            </DialogTrigger>

            <DialogContent className="sm:max-w-[500px] border-green-200">

                <DialogHeader>
                    <DialogTitle className="text-green-900 flex items-center gap-2 text-3xl">
                        <User className="h-5 w-5 text-green-600" />
                        {formData.id ? 'Editar Cliente' : 'Crear nuevo cliente'}
                    </DialogTitle>
                    <DialogDescription className="text-green-600">
                        Completa la información del cliente para {formData.id ? 'editarlo' : 'crearlo'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-0">
                        <Label htmlFor="nombres" className="text-green-800">
                            Nombres <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="nombres"
                            name="nombres"
                            placeholder="John"
                            value={formData.nombres}
                            onChange={(e) => handleInputChange("nombres", e.target.value)}
                            className="border-green-200 focus:border-green-400 focus:ring-green-400"
                            required
                        />
                        {errors.nombres && (
                            <p className="text-red-500 text-sm">{errors.nombres}</p>
                        )}
                    </div>

                    <div className="space-y-0">
                        <Label htmlFor="apellidos" className="text-green-800">
                            Apellidos
                        </Label>
                        <Input
                            id="apellidos"
                            name="apellidos"
                            placeholder="Doe"
                            value={formData.apellidos}
                            onChange={(e) => handleInputChange("apellidos", e.target.value)}
                            className="border-green-200 focus:border-green-400 focus:ring-green-400"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-0">
                            <Label htmlFor="tipo_documento" className="text-green-800">
                                Tipo de Documento <span className="text-red-500">*</span>
                            </Label>
                            <div className="flex gap-2">
                                <Select
                                    value={selectedTipoDocumento}
                                    onValueChange={(value) => {
                                        setSelectedTipoDocumento(value);
                                        handleInputChange("tipo_documento", value);
                                    }}
                                >
                                    <SelectTrigger className="border-green-200 focus:border-green-400 focus:ring-green-400">
                                        <SelectValue placeholder="Seleccionar tipo de documento" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {tiposDocumento.map((tipo) => (
                                            <SelectItem key={tipo.id} value={tipo.id}>
                                                {tipo.nombre}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            {errors.tipo_documento && (
                                <p className="text-red-500 text-sm">{errors.tipo_documento}</p>
                            )}
                        </div>

                        <div className="space-y-0">
                            <Label htmlFor="numero_documento" className="text-green-800">
                                Número de Documento <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="numero_documento"
                                name="numero_documento"
                                placeholder="123456789"
                                value={formData.numero_documento}
                                onChange={(e) => handleInputChange("numero_documento", e.target.value)}
                                className="border-green-200 focus:border-green-400 focus:ring-green-400"
                                required
                            />
                            {errors.numero_documento && (
                                <p className="text-red-500 text-sm">{errors.numero_documento}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-0">
                        <Label htmlFor="direccion" className="text-green-800">
                            Dirección
                        </Label>
                        <Input
                            id="direccion"
                            name="direccion"
                            placeholder="Calle 123 # 45-67"
                            value={formData.direccion}
                            onChange={(e) => handleInputChange("direccion", e.target.value)}
                            className="border-green-200 focus:border-green-400 focus:ring-green-400"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-0">
                            <Label htmlFor="email" className="text-green-800">
                                Email
                            </Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="cliente@example.com"
                                value={formData.email}
                                onChange={(e) => handleInputChange("email", e.target.value)}
                                className="border-green-200 focus:border-green-400 focus:ring-green-400"
                            />
                        </div>

                        <div className="space-y-0">
                            <Label htmlFor="telefono" className="text-green-800">
                                Teléfono
                            </Label>
                            <Input
                                id="telefono"
                                name="telefono"
                                placeholder="+57 123 456 7890"
                                value={formData.telefono}
                                onChange={(e) => handleInputChange("telefono", e.target.value)}
                                className="border-green-200 focus:border-green-400 focus:ring-green-400"
                            />
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
                            ) : formData.id ? 'Actualizar Cliente' : 'Crear Cliente'}
                        </Button>
                    </DialogFooter>

                </form>

            </DialogContent>

            <Toaster />
        </Dialog>
    );
}