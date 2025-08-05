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

export interface Empresa {
    razon_social: string;
    nit: string;
    direccion: string;
    email: string;
    telefono: string;
    updated_at: string;
    created_at: string;
    id: number;
    token_db: string;
    hash: string;
}

interface FormEmpresasProps {
    empresaEditar?: Empresa | null;
    mostrarBotonCrear?: true | false;
    setEmpresas: React.Dispatch<React.SetStateAction<Empresa[]>>;
    setEmpresaEditar?: React.Dispatch<React.SetStateAction<Empresa | null>>;
}

export default function CompanyForm({ setEmpresas, empresaEditar, setEmpresaEditar, mostrarBotonCrear }: FormEmpresasProps) {

    const { toast } = useToast();
    const [error, setError] = useState('');
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [formData, setFormData] = useState({
        id: 0,
        razon_social: "",
        email: "",
        telefono: "",
        direccion: "",
        nit: "",
    });

    useEffect(() => {
        if (empresaEditar) {
            setFormData({
                id: empresaEditar.id,
                razon_social: empresaEditar.razon_social,
                email: empresaEditar.email,
                telefono: empresaEditar.telefono,
                direccion: empresaEditar.direccion, // Asegúrate que coincidan los nombres
                nit: empresaEditar.nit
            });
            setOpen(true);
        }
    }, [empresaEditar]);

    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen);
        if (!isOpen) {
        // Resetear el formulario al cerrar
        setFormData({
            id: 0,
            razon_social: "",
            email: "",
            telefono: "",
            direccion: "",
            nit: "",
        });
        if (setEmpresaEditar) setEmpresaEditar(null);
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
            const endpoint = '/empresas';
            const action = formData.id ? 'actualizada' : 'creada';

            const response = await apiClient[method](endpoint, formData);
            const responseData = response.data;

            if (response.data.success) {
                setEmpresas(prev => [responseData.data, ...prev]);
                toast({
                    variant: "success",
                    title: `Empresa ${action}`,
                    description: `La empresa ha sido ${action} correctamente.`,
                });
            }

            handleClose();
        } catch (err) {
            toast({
                variant: "destructive",
                title: "Error Empresa",
                description: "Error al crear empresa.",
            });
        } finally {
            setLoading(false);
        }
    }

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.razon_social) newErrors.razon_social = "Requerido";
        if (!formData.nit) newErrors.nit = "Requerido";
        if (!formData.email) newErrors.email = "Requerido";
        else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = "Email inválido";
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleClose = () => {
        setOpen(false);
        setFormData({
        id: 0,
        razon_social: "",
        email: "",
        telefono: "",
        direccion: "",
        nit: "",
        });
        if (setEmpresaEditar) setEmpresaEditar(null);
    };    

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>

            <DialogTrigger asChild>
                {mostrarBotonCrear ? (
                    <Button className="gap-2 bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-200">
                        <Plus className="h-4 w-4" />
                        Nueva Empresa
                    </Button>
                    ) : ('')
                }
            </DialogTrigger>

            <DialogContent className="sm:max-w-[500px] border-green-200">

                <DialogHeader>
                    <DialogTitle className="text-green-900 flex items-center gap-2 text-3xl">
                        <Building2 className="h-5 w-5 text-green-600" />
                        {formData.id ? 'Editar Empresa' : 'Crear Nueva Empresa'}
                    </DialogTitle>
                    <DialogDescription className="text-green-600">
                        Completa la información de la empresa para {formData.id ? 'editarla' : 'crearla'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-0">
                        <Label htmlFor="razon_social" className="text-green-800">
                            Razón social <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="razon_social"
                            name="razon_social"
                            placeholder="Nombre Empresa SAS"
                            value={formData.razon_social}
                            onChange={(e) => handleInputChange("razon_social", e.target.value)}
                            className="border-green-200 focus:border-green-400 focus:ring-green-400"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-0">
                            <Label htmlFor="nit" className="text-green-800">
                                Nit <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="nit"
                                name="nit"
                                placeholder="1036548794"
                                value={formData.nit}
                                onChange={(e) => handleInputChange("nit", e.target.value)}
                                className="border-green-200 focus:border-green-400 focus:ring-green-400"
                                required
                            />
                        </div>

                        <div className="space-y-0">
                            <Label htmlFor="nit" className="text-green-800">
                                Email <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="email"
                                name="email"
                                placeholder="email@plengi.com"
                                value={formData.email}
                                onChange={(e) => handleInputChange("email", e.target.value)}
                                className="border-green-200 focus:border-green-400 focus:ring-green-400"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">   
                        <div className="space-y-0">
                            <Label htmlFor="nit" className="text-green-800">
                                Direción
                            </Label>
                            <Input
                                id="direccion"
                                name="direccion"
                                placeholder="Av. 58A #854"
                                value={formData.direccion}
                                onChange={(e) => handleInputChange("direccion", e.target.value)}
                                className="border-green-200 focus:border-green-400 focus:ring-green-400"
                            />
                        </div>

                        <div className="space-y-0">
                            <Label htmlFor="nit" className="text-green-800">
                                Telefono
                            </Label>
                            <Input
                                id="telefono"
                                name="telefono"
                                placeholder="3145872544"
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
                        ) : formData.id ? 'Actualizar empresa' : 'Crear Empresa'}
                        </Button>
                    </DialogFooter>

                </form>

            </DialogContent>

            <Toaster />
        </Dialog>
    );
}