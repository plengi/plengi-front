'use client';

import type React from "react";
import apiClient from '@/app/api/apiClient';
import { useEffect, useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Combobox } from "@headlessui/react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { 
    Plus,
    Check,
    Wrench,
    Loader,
    Building2,
    ChevronsUpDown
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

export interface Proyecto {
    id: number;
    nombre: string;
    tipo_obra: string;
    id_ciudad: string;
    fecha: string;
}

interface Ciudad {
    id: number;
    nombre: string;
    nombre_completo: string;
    text: string;
}

interface FormProyectosProps {
    proyectoEditar?: Proyecto | null;
    mostrarBotonCrear?: true | false;
    setProyectos: React.Dispatch<React.SetStateAction<Proyecto[]>>;
    setProyectoEditar?: React.Dispatch<React.SetStateAction<Proyecto | null>>;
}

export default function ProjectsForm({ setProyectos, proyectoEditar, setProyectoEditar, mostrarBotonCrear }: FormProyectosProps) {

    const { toast } = useToast();
    const [error, setError] = useState('');
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [selectedTipoObra, setSelectedTipoObra] = useState<string>("");

    // Estados para el combobox de ciudades
    const [ciudades, setCiudades] = useState<Ciudad[]>([]);
    const [ciudadQuery, setCiudadQuery] = useState('');
    const [selectedCiudad, setSelectedCiudad] = useState<Ciudad | null>(null);
    const [loadingCiudades, setLoadingCiudades] = useState(false);
    const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

    const [formData, setFormData] = useState({
        id: 0,
        nombre: "",
        tipo_obra: "",
        id_ciudad: "",
        fecha: new Date().toISOString().split('T')[0],
    });

    useEffect(() => {
        if (proyectoEditar) {
            setFormData({
                id: proyectoEditar.id,
                nombre: proyectoEditar.nombre,
                tipo_obra: proyectoEditar.tipo_obra,
                id_ciudad: proyectoEditar.id_ciudad,
                fecha: proyectoEditar.fecha
            });

            // Busca la ciudad en la lista ya cargada
            if (ciudades.length > 0) {
                const ciudadEditada = ciudades.find(c => c.id.toString() === proyectoEditar.id_ciudad);
                if (ciudadEditada) {
                    setSelectedCiudad(ciudadEditada);
                }
            }
            
            setOpen(true);
        }
    }, [proyectoEditar, ciudades]); // Añade ciudades como dependencia

    // Efecto para cargar ciudades iniciales y cuando se edita
    useEffect(() => {
        if (open) {
            fetchCiudades();
            
            // Si estamos editando, buscar la ciudad correspondiente
            if (proyectoEditar) {
                apiClient.get(`/ciudades/${proyectoEditar.id_ciudad}`)
                .then(response => {
                    if (response.data.success) {
                        setSelectedCiudad(response.data.data);
                    }
                })
                .catch(error => {
                    console.error("Error fetching ciudad:", error);
                });
            }
        }
    }, [open, proyectoEditar]);

    // Efecto para el debounce de búsqueda
    useEffect(() => {
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }
        
        const timer = setTimeout(() => {
            fetchCiudades(ciudadQuery);
        }, 500);
        
        setDebounceTimer(timer);
        
        return () => {
            if (debounceTimer) {
                clearTimeout(debounceTimer);
            }
        };
    }, [ciudadQuery]);

    // Función para buscar ciudades con debounce
    const fetchCiudades = async (query: string = '') => {
        setLoadingCiudades(true);
        try {
            const response = await apiClient.get(`/ciudades-combo?search=${query}`);
            if (response.data) {
                setCiudades(response.data.data); // Accede a data.data según tu respuesta
            }
        } catch (error) {
            console.error("Error fetching ciudades:", error);
        } finally {
            setLoadingCiudades(false);
        }
    };

    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen);
        if (!isOpen) {
        // Resetear el formulario al cerrar
        setFormData({
            id: 0,
            nombre: "",
            tipo_obra: "",
            id_ciudad: "",
            fecha: "",
        });
        if (setProyectoEditar) setProyectoEditar(null);
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
            const endpoint = '/proyectos';
            const action = formData.id ? 'actualizado' : 'creado';

            const response = await apiClient[method](endpoint, formData);
            const responseData = response.data;

            if (response.data.success) {
                setProyectos(prev => [responseData.data, ...prev]);
                toast({
                    variant: "success",
                    title: `Proyecto ${action}`,
                    description: `El proyecto ha sido ${action} correctamente.`,
                });
            }

            handleClose();
        } catch (err) {
            toast({
                variant: "destructive",
                title: "Error Proyecto",
                description: "Error al crear empresa.",
            });
        } finally {
            setLoading(false);
        }
    }

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.nombre) newErrors.nombre = "Requerido";
        if (!formData.tipo_obra) newErrors.tipo_obra = "Requerido";
        if (!formData.id_ciudad) newErrors.id_ciudad = "Requerido";
        if (!formData.fecha) newErrors.fecha = "Requerido";
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleClose = () => {
        setOpen(false);
        setFormData({
            id: 0,
            nombre: "",
            tipo_obra: "",
            id_ciudad: "",
            fecha: "",
        });
        setSelectedCiudad(null);
        setCiudadQuery('');
        if (setProyectoEditar) setProyectoEditar(null);
    };    

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>

            <DialogTrigger asChild>
                {mostrarBotonCrear ? (
                    <Button className="gap-2 bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-200">
                        <Plus className="h-4 w-4" />
                        Nuevo Proyecto
                    </Button>
                    ) : ('')
                }
            </DialogTrigger>

            <DialogContent className="sm:max-w-[500px] border-green-200">

                <DialogHeader>
                    <DialogTitle className="text-green-900 flex items-center gap-2 text-3xl">
                        <Building2 className="h-5 w-5 text-green-600" />
                        {formData.id ? 'Editar Proyecto' : 'Crear Nueva Proyecto'}
                    </DialogTitle>
                    <DialogDescription className="text-green-600">
                        Completa la información del proyecto para {formData.id ? 'editarlo' : 'crearlo'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-0">
                        <Label htmlFor="nombre" className="text-green-800">
                            Nombre del proyecto <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="nombre"
                            name="nombre"
                            placeholder="Nombre Proyecto SAS"
                            value={formData.nombre}
                            onChange={(e) => handleInputChange("nombre", e.target.value)}
                            className="border-green-200 focus:border-green-400 focus:ring-green-400"
                            required
                        />
                        {errors.nombre && (
                            <p className="text-red-500 text-sm">{errors.nombre}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-0">
                            <Label htmlFor="section-select" className="text-green-800">
                                Tipo de obra
                            </Label>
                            <div className="flex gap-2">
                                <Select
                                    value={selectedTipoObra}
                                    onValueChange={(value) => {
                                        setSelectedTipoObra(value);
                                        handleInputChange("tipo_obra", value);
                                    }}
                                >
                                    <SelectTrigger className="border-green-200 focus:border-green-400 focus:ring-green-400">
                                        <SelectValue placeholder="Seleccionar sección" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem key={1} value={"1"}>A</SelectItem>
                                        <SelectItem key={2} value={"2"}>B</SelectItem>
                                        <SelectItem key={3} value={"3"}>C</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {errors.tipo_obra && (
                                <p className="text-red-500 text-sm">{errors.tipo_obra}</p>
                            )}
                        </div>

                        <div className="space-y-0">
                            <Label htmlFor="ciudad" className="text-green-800">
                                Ciudad <span className="text-red-500">*</span>
                            </Label>
                            <Combobox value={selectedCiudad} onChange={(ciudad) => {
                                setSelectedCiudad(ciudad);
                                handleInputChange("id_ciudad", ciudad?.id.toString() || "");
                            }}>
                                <div className="relative">
                                    <Combobox.Input
                                        className="flex h-10 w-full rounded-md border border-green-200 bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        displayValue={(ciudad: Ciudad) => ciudad?.nombre_completo || ciudad?.nombre || ''}
                                        onChange={(event) => setCiudadQuery(event.target.value)}
                                        placeholder="Buscar ciudad..."
                                    />
                                    <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                                        <ChevronsUpDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                    </Combobox.Button>
                                </div>
                                <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                    {loadingCiudades ? (
                                        <div className="relative cursor-default select-none px-4 py-2 text-gray-700">
                                            Cargando...
                                        </div>
                                    ) : ciudades.length === 0 ? (
                                        <div className="relative cursor-default select-none px-4 py-2 text-gray-700">
                                            No se encontraron ciudades
                                        </div>
                                    ) : (
                                        ciudades.map((ciudad) => (
                                            <Combobox.Option
                                                key={ciudad.id}
                                                value={ciudad}
                                                className={({ active }) =>
                                                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                                        active ? 'bg-green-100 text-green-900' : 'text-gray-900'
                                                    }`
                                                }
                                            >
                                                {({ selected, active }) => (
                                                    <>
                                                        <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                                            {ciudad.nombre_completo || ciudad.nombre}
                                                        </span>
                                                        {selected && (
                                                            <span className={`absolute inset-y-0 left-0 flex items-center pl-3 text-green-600`}>
                                                                <Check className="h-5 w-5" aria-hidden="true" />
                                                            </span>
                                                        )}
                                                    </>
                                                )}
                                            </Combobox.Option>
                                        ))
                                    )}
                                </Combobox.Options>
                            </Combobox>
                            {errors.id_ciudad && (
                                <p className="text-red-500 text-sm">{errors.id_ciudad}</p>
                            )}
                        </div>


                    </div>

                    <div className="space-y-0">
                        <Label htmlFor="fecha" className="text-green-800">
                            Fecha <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            type="date"
                            id="fecha"
                            value={formData.fecha}
                            onChange={(e) => handleInputChange("fecha", e.target.value)}
                            className="border-green-200 focus:border-green-400"
                            required
                        />
                        {errors.fecha && (
                            <p className="text-red-500 text-sm">{errors.fecha}</p>
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
                        ) : formData.id ? 'Actualizar Proyecto' : 'Crear Proyecto'}
                        </Button>
                    </DialogFooter>

                </form>

            </DialogContent>

            <Toaster />
        </Dialog>
    );
}