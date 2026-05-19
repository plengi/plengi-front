"use client";

import type React from "react";
import apiClient from "@/app/api/apiClient";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Combobox } from "@headlessui/react";
import { Plus, Check, Loader, Building2, ChevronsUpDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export interface Proyecto {
  id: number;
  nombre: string;
  descripcion: string;
  id_cliente: number;
  cliente_nombre: string;
  id_ubicacion: string;
  ubicacion_nombre: string;
  fecha_inicio: string;
  estado: string;
  valor_total: number;
  budgets?: any[];
  budgets_count: number;
}

interface Ciudad {
  id: number;
  nombre: string;
  nombre_completo: string;
  text: string;
}

interface Cliente {
  id: number;
  nombres: string;
  apellidos: string;
  text: string;
}

interface FormProyectosProps {
  proyectoEditar?: Proyecto | null;
  mostrarBotonCrear?: true | false;
  setProyectos: React.Dispatch<React.SetStateAction<Proyecto[]>>;
  setProyectoEditar?: React.Dispatch<React.SetStateAction<Proyecto | null>>;
}

const estadosProyecto = [
  { id: "planificacion", nombre: "Planificación" },
  { id: "en_progreso", nombre: "En progreso" },
  { id: "en_revision", nombre: "En revisión" },
  { id: "aprobado", nombre: "Aprobado" },
  { id: "completado", nombre: "Completado" },
];

export default function ProjectsForm({
  setProyectos,
  proyectoEditar,
  setProyectoEditar,
  mostrarBotonCrear,
}: FormProyectosProps) {
  const { toast } = useToast();
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedEstado, setSelectedEstado] = useState<string>("");

  // Estados para el combobox de ciudades
  const [ciudades, setCiudades] = useState<Ciudad[]>([]);
  const [ciudadQuery, setCiudadQuery] = useState("");
  const [selectedCiudad, setSelectedCiudad] = useState<Ciudad | null>(null);
  const [loadingCiudades, setLoadingCiudades] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(
    null,
  );

  // Estados para el combobox de clientes
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteQuery, setClienteQuery] = useState("");
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [loadingClientes, setLoadingClientes] = useState(false);
  const [debounceTimerClientes, setDebounceTimerClientes] =
    useState<NodeJS.Timeout | null>(null);

  const [formData, setFormData] = useState({
    id: 0,
    nombre: "",
    descripcion: "",
    id_cliente: null as number | null,
    id_ubicacion: "",
    fecha_inicio: new Date().toISOString().split("T")[0],
    estado: "planificacion",
  });

  useEffect(() => {
    if (proyectoEditar) {
      setFormData({
        id: proyectoEditar.id,
        nombre: proyectoEditar.nombre,
        descripcion: proyectoEditar.descripcion || "",
        id_cliente: proyectoEditar.id_cliente,
        id_ubicacion: proyectoEditar.id_ubicacion,
        fecha_inicio: proyectoEditar.fecha_inicio.split("T")[0],
        estado: proyectoEditar.estado,
      });

      setSelectedEstado(proyectoEditar.estado);

      // Busca la ciudad en la lista ya cargada
      if (ciudades.length > 0 && proyectoEditar.id_ubicacion) {
        const ciudadEditada = ciudades.find(
          (c) => c.id.toString() === proyectoEditar.id_ubicacion,
        );
        if (ciudadEditada) {
          setSelectedCiudad(ciudadEditada);
        }
      }

      // Busca el cliente en la lista ya cargada
      if (clientes.length > 0 && proyectoEditar.id_cliente) {
        const clienteEditado = clientes.find(
          (c) => c.id === proyectoEditar.id_cliente,
        );
        if (clienteEditado) {
          setSelectedCliente(clienteEditado);
        }
      }

      setOpen(true);
    }
  }, [proyectoEditar, ciudades, clientes]);

  // Efecto para cargar ciudades y clientes cuando se abre el diálogo
  useEffect(() => {
    if (open) {
      fetchCiudades();
      fetchClientes();

      // Si estamos editando y no encontramos los datos en las listas cargadas
      if (proyectoEditar) {
        // Ciudad
        if (
          proyectoEditar.id_ubicacion &&
          !ciudades.find((c) => c.id.toString() === proyectoEditar.id_ubicacion)
        ) {
          apiClient
            .get(`/ciudades/${proyectoEditar.id_ubicacion}`)
            .then((response) => {
              if (response.data.success) {
                setSelectedCiudad(response.data.data);
              }
            })
            .catch((error) => {
              console.error("Error fetching ciudad:", error);
            });
        }

        // Cliente
        if (
          proyectoEditar.id_cliente &&
          !clientes.find((c) => c.id === proyectoEditar.id_cliente)
        ) {
          apiClient
            .get(`/clientes/${proyectoEditar.id_cliente}`)
            .then((response) => {
              if (response.data.success) {
                setSelectedCliente(response.data.data);
              }
            })
            .catch((error) => {
              console.error("Error fetching cliente:", error);
            });
        }
      }
    }
  }, [open]);

  // Efecto para el debounce de búsqueda de ciudades
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

  // Efecto para el debounce de búsqueda de clientes
  useEffect(() => {
    if (debounceTimerClientes) {
      clearTimeout(debounceTimerClientes);
    }

    const timer = setTimeout(() => {
      fetchClientes(clienteQuery);
    }, 500);

    setDebounceTimerClientes(timer);

    return () => {
      if (debounceTimerClientes) {
        clearTimeout(debounceTimerClientes);
      }
    };
  }, [clienteQuery]);

  // Función para buscar ciudades con debounce
  const fetchCiudades = async (query: string = "") => {
    setLoadingCiudades(true);
    try {
      const response = await apiClient.get(`/ciudades-combo?search=${query}`);
      if (response.data) {
        setCiudades(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching ciudades:", error);
    } finally {
      setLoadingCiudades(false);
    }
  };

  // Función para buscar clientes con debounce
  const fetchClientes = async (query: string = "") => {
    setLoadingClientes(true);
    try {
      const response = await apiClient.get(`/clientes-combo?search=${query}`);
      if (response.data) {
        setClientes(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching clientes:", error);
    } finally {
      setLoadingClientes(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setFormData({
        id: 0,
        nombre: "",
        descripcion: "",
        id_cliente: null as number | null,
        id_ubicacion: "",
        fecha_inicio: new Date().toISOString().split("T")[0],
        estado: "planificacion",
      });
      setSelectedEstado("planificacion");
      setSelectedCiudad(null);
      setSelectedCliente(null);
      setCiudadQuery("");
      setClienteQuery("");
      if (setProyectoEditar) setProyectoEditar(null);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const method = formData.id ? "put" : "post";
      const endpoint = "/proyectos";
      const action = formData.id ? "actualizado" : "creado";

      const response = await apiClient[method](endpoint, formData);
      const responseData = response.data;

      if (response.data.success) {
        if (formData.id) {
          // Actualizar el proyecto en la lista
          setProyectos((prev) =>
            prev.map((proyecto) =>
              proyecto.id === formData.id ? responseData.data : proyecto,
            ),
          );
        } else {
          // Agregar el nuevo proyecto a la lista
          setProyectos((prev) => [responseData.data, ...prev]);
        }
        toast({
          variant: "success",
          title: `Proyecto ${action}`,
          description: `El proyecto ha sido ${action} correctamente.`,
        });
      }

      handleClose();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error Proyecto",
        description: err.response?.data?.message || "Error al crear proyecto.",
      });
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.nombre) newErrors.nombre = "Requerido";
    //if (!formData.id_cliente) newErrors.id_cliente = "Requerido";
    if (!formData.id_ubicacion) newErrors.id_ubicacion = "Requerido";
    if (!formData.fecha_inicio) newErrors.fecha_inicio = "Requerido";
    if (!formData.estado) newErrors.estado = "Requerido";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleClose = () => {
    setOpen(false);
    setFormData({
      id: 0,
      nombre: "",
      descripcion: "",
      id_cliente: 0,
      id_ubicacion: "",
      fecha_inicio: new Date().toISOString().split("T")[0],
      estado: "planificacion",
    });
    setSelectedEstado("planificacion");
    setSelectedCiudad(null);
    setSelectedCliente(null);
    setCiudadQuery("");
    setClienteQuery("");
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
        ) : (
          ""
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px] border-green-200">
        <DialogHeader>
          <DialogTitle className="text-green-900 flex items-center gap-2 text-3xl">
            <Building2 className="h-5 w-5 text-green-600" />
            {formData.id ? "Editar Proyecto" : "Crear Nuevo Proyecto"}
          </DialogTitle>
          <DialogDescription className="text-green-600">
            Completa la información del proyecto para{" "}
            {formData.id ? "editarlo" : "crearlo"}
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
              placeholder="Nombre del Proyecto"
              value={formData.nombre}
              onChange={(e) => handleInputChange("nombre", e.target.value)}
              className="border-green-200 focus:border-green-400 focus:ring-green-400"
              required
            />
            {errors.nombre && (
              <p className="text-red-500 text-sm">{errors.nombre}</p>
            )}
          </div>

          <div className="space-y-0">
            <Label htmlFor="descripcion" className="text-green-800">
              Descripción
            </Label>
            <Textarea
              id="descripcion"
              name="descripcion"
              placeholder="Descripción del proyecto..."
              value={formData.descripcion}
              onChange={(e) => handleInputChange("descripcion", e.target.value)}
              className="border-green-200 focus:border-green-400 focus:ring-green-400 min-h-[80px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-0">
              <Label htmlFor="cliente" className="text-green-800">
                Cliente <span className="text-red-500"></span>
              </Label>
              <Combobox
                value={selectedCliente}
                onChange={(cliente) => {
                  setSelectedCliente(cliente);
                  handleInputChange("id_cliente", cliente ? cliente.id : null);
                }}
              >
                <div className="relative">
                  <Combobox.Input
                    className="flex h-10 w-full rounded-md border border-green-200 bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    displayValue={(cliente: Cliente) =>
                      cliente ? `${cliente.nombres}` : ""
                    }
                    onChange={(event) => setClienteQuery(event.target.value)}
                    placeholder="Buscar cliente..."
                  />
                  <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                    <ChevronsUpDown
                      className="h-5 w-5 text-gray-400"
                      aria-hidden="true"
                    />
                  </Combobox.Button>
                </div>
                <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                  {loadingClientes ? (
                    <div className="relative cursor-default select-none px-4 py-2 text-gray-700">
                      Cargando...
                    </div>
                  ) : clientes.length === 0 ? (
                    <div className="relative cursor-default select-none px-4 py-2 text-gray-700">
                      No se encontraron clientes
                    </div>
                  ) : (
                    clientes.map((cliente) => (
                      <Combobox.Option
                        key={cliente.id}
                        value={cliente}
                        className={({ active }) =>
                          `relative cursor-default select-none py-2 pl-10 pr-4 ${
                            active
                              ? "bg-green-100 text-green-900"
                              : "text-gray-900"
                          }`
                        }
                      >
                        {({ selected, active }) => (
                          <>
                            <span
                              className={`block truncate ${selected ? "font-medium" : "font-normal"}`}
                            >
                              {cliente.nombres}
                            </span>
                            {selected && (
                              <span
                                className={`absolute inset-y-0 left-0 flex items-center pl-3 text-green-600`}
                              >
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
              {errors.id_cliente && (
                <p className="text-red-500 text-sm">{errors.id_cliente}</p>
              )}
            </div>

            <div className="space-y-0">
              <Label htmlFor="estado" className="text-green-800">
                Estado <span className="text-red-500">*</span>
              </Label>
              <select
                value={selectedEstado}
                onChange={(e) => {
                  setSelectedEstado(e.target.value);
                  handleInputChange("estado", e.target.value);
                }}
                className="flex h-10 w-full rounded-md border border-green-200 bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              >
                <option value="">Seleccionar estado</option>
                {estadosProyecto.map((estado) => (
                  <option key={estado.id} value={estado.id}>
                    {estado.nombre}
                  </option>
                ))}
              </select>
              {errors.estado && (
                <p className="text-red-500 text-sm">{errors.estado}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-0">
              <Label htmlFor="ciudad" className="text-green-800">
                Ubicación <span className="text-red-500">*</span>
              </Label>
              <Combobox
                value={selectedCiudad}
                onChange={(ciudad) => {
                  setSelectedCiudad(ciudad);
                  handleInputChange(
                    "id_ubicacion",
                    ciudad?.id.toString() || "",
                  );
                }}
              >
                <div className="relative">
                  <Combobox.Input
                    className="flex h-10 w-full rounded-md border border-green-200 bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    displayValue={(ciudad: Ciudad) =>
                      ciudad?.nombre_completo || ciudad?.nombre || ""
                    }
                    onChange={(event) => setCiudadQuery(event.target.value)}
                    placeholder="Buscar ciudad..."
                  />
                  <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                    <ChevronsUpDown
                      className="h-5 w-5 text-gray-400"
                      aria-hidden="true"
                    />
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
                            active
                              ? "bg-green-100 text-green-900"
                              : "text-gray-900"
                          }`
                        }
                      >
                        {({ selected, active }) => (
                          <>
                            <span
                              className={`block truncate ${selected ? "font-medium" : "font-normal"}`}
                            >
                              {ciudad.nombre_completo || ciudad.nombre}
                            </span>
                            {selected && (
                              <span
                                className={`absolute inset-y-0 left-0 flex items-center pl-3 text-green-600`}
                              >
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
              {errors.id_ubicacion && (
                <p className="text-red-500 text-sm">{errors.id_ubicacion}</p>
              )}
            </div>

            <div className="space-y-0">
              <Label htmlFor="fecha_inicio" className="text-green-800">
                Fecha de inicio <span className="text-red-500">*</span>
              </Label>
              <Input
                type="date"
                id="fecha_inicio"
                value={formData.fecha_inicio}
                onChange={(e) =>
                  handleInputChange("fecha_inicio", e.target.value)
                }
                className="border-green-200 focus:border-green-400"
                required
              />
              {errors.fecha_inicio && (
                <p className="text-red-500 text-sm">{errors.fecha_inicio}</p>
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
              ) : formData.id ? (
                "Actualizar Proyecto"
              ) : (
                "Crear Proyecto"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>

      <Toaster />
    </Dialog>
  );
}
