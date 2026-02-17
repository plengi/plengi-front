"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Phone,
  Edit,
  X,
  MapPin,
  Calendar,
  Clock,
  Globe2,
  Mail,
  Save,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Building2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Importar Avatar
import apiClient from "../api/apiClient";
import { Combobox } from "@headlessui/react";

export default function ProfilePage() {

  const { toast } = useToast();

  // === Estados ===
  const [userData, setUserData] = useState<any>(null);
  const [empresa, setEmpresa] = useState<any>(null);
  const [editData, setEditData] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  // === Ciudades ===
  const [ciudades, setCiudades] = useState<any[]>([]);
  const [ciudadQuery, setCiudadQuery] = useState("");
  const [selectedCiudad, setSelectedCiudad] = useState<any | null>(null);
  const [loadingCiudades, setLoadingCiudades] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(
    null,
  );

  // Campos permitidos para actualizar
  const allowedFields = [
    "firstname",
    "lastname",
    "username",
    "email",
    "phone",
    "address",
    "city",
    "country",
    "about",
  ];

  //combo ciudades con debounce
  const fetchCiudades = async (query: string = "") => {
    setLoadingCiudades(true);
    try {
      const response = await apiClient.get(`/ciudades-combo?search=${query}`);
      if (response.data?.data) {
        setCiudades(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching ciudades:", error);
    } finally {
      setLoadingCiudades(false);
    }
  };

  //obtener usuario y empresa del localStorage al cargar el componente
  useEffect(() => {
    const userFromStorage = localStorage.getItem("user");
    let userData = userFromStorage ? JSON.parse(userFromStorage) : null;
    setUserData(userData);
  }, []);

  // Obtener empresa del localStorage al cargar el componente
  useEffect(() => {
    const empresaFromStorage = localStorage.getItem("empresaSeleccionada");
    let empresaData = empresaFromStorage
      ? JSON.parse(empresaFromStorage)
      : null;
    setEmpresa(empresaData);
  }, []);

  // Efecto para manejar el debounce de la búsqueda de ciudades
  useEffect(() => {
    if (debounceTimer) clearTimeout(debounceTimer);

    const timer = setTimeout(() => {
      fetchCiudades(ciudadQuery);
    }, 500);

    setDebounceTimer(timer);

    return () => clearTimeout(timer);
  }, [ciudadQuery]);

  // Efecto para cargar ciudades y seleccionar la ciudad actual al entrar en modo edición
  useEffect(() => {
    if (isEditing) {
      fetchCiudades();

      if (userData?.city_id) {
        apiClient
          .get(`/ciudades/${userData.city_id}`)
          .then((res) => {
            if (res.data?.data) {
              setSelectedCiudad(res.data.data);
            }
          })
          .catch((err) => console.error(err));
      }
    }
  }, [isEditing]);

  // === Handlers ===
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setEditData((prev: any) => ({
      ...prev,
      [id]: value,
    }));
  };

  // Iniciar edición y cargar datos actuales en el formulario
  const handleEdit = () => {
    if (!userData) return;

    setEditData({
      username: userData.username ?? "",
      email: userData.email ?? "",
      firstname: userData.firstname ?? "",
      lastname: userData.lastname ?? "",
      phone: userData.phone ?? "",
      company: userData.company ?? "",
      department: userData.department ?? "",
      address: userData.address ?? "",
    });

    setIsEditing(true);
  };

  // Guardar cambios en el perfil
  const handleSave = async () => {
    if (!editData) return;

    const cleanedData = Object.fromEntries(
      Object.entries(editData).filter(
        ([key, value]) =>
          allowedFields.includes(key) &&
          value !== "" &&
          value !== null &&
          value !== undefined,
      ),
    );

    if (Object.keys(cleanedData).length === 0) {
      toast({
        variant: "default",
        title: "Sin cambios",
        description: "No se han realizado cambios para guardar",
      });
      return;
    }

    try {
      const response = await apiClient.put("/profile", cleanedData);

      const { user, message } = response.data;

      setUserData((prev: any) => ({
        ...prev,
        ...user,
      }));

      localStorage.setItem(
        "user",
        JSON.stringify({
          ...userData,
          ...user,
        }),
      );

      setIsEditing(false);
      toast({
        variant: "success",
        title: "Perfil actualizado",
        description: message || "Tu perfil ha sido actualizado correctamente",
      });
    } catch (error: any) {
      console.error("Error al actualizar perfil:", error);

      const msg =
        error.response?.data?.message || "No se pudo actualizar el perfil";

      toast({
        variant: "destructive",
        title: "Error al actualizar perfil",
        description: msg,
      });
    }
  };

  // Cancelar edición y revertir cambios
  const handleCancel = () => {
    if (userData) {
      setEditData({
        username: userData.username ?? "",
        email: userData.email ?? "",
        firstname: userData.firstname ?? "",
        lastname: userData.lastname ?? "",
        phone: userData.phone ?? "",
        company: userData.company ?? "",
        department: userData.department ?? "",

        address: userData.address ?? "",
      });
    }

    setIsEditing(false);
  };

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-green-100 px-4 bg-gradient-to-r from-green-50 to-white dark:from-background dark:to-card">
        <SidebarTrigger className="-ml-1 text-green-600 hover:bg-green-100 dark:text-foreground dark:hover:bg-secondary" />
        <div className="flex flex-1 items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-green-600 hover:text-green-800 dark:text-muted-foreground dark:hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Volver al Dashboard</span>
          </Link>
          <div className="ml-auto"></div>
        </div>
      </header>

      <main className="flex-1 space-y-6 p-6 bg-gradient-to-br from-green-50/30 to-white dark:from-background dark:to-card">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-green-900 dark:text-foreground">
              Perfil de Usuario
            </h1>
            <p className="text-green-700 dark:text-muted-foreground">
              Gestiona tu información personal y de contacto
            </p>
          </div>
          {!isEditing && (
            <Button
              onClick={handleEdit}
              className="gap-2 bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-200 dark:bg-primary dark:hover:bg-primary/90 dark:shadow-none"
            >
              <Edit className="h-4 w-4" />
              Editar Perfil
            </Button>
          )}
        </div>

        <Card className="border-green-200 bg-gradient-to-br from-white to-green-50 dark:border-border dark:from-card dark:to-card">
          <CardHeader className="flex flex-col items-center text-center">
            <Avatar className="h-24 w-24 mb-4 border-2 border-green-500 dark:border-primary">
              <AvatarFallback className="text-green-600 dark:text-primary-foreground bg-green-100 dark:bg-primary/20 text-xl font-semibold">
                {userData?.username
                  ?.split(" ")
                  .filter(Boolean)
                  .map((n: string) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase() || "PG"}
              </AvatarFallback>
            </Avatar>

            <CardTitle className="text-green-900 dark:text-foreground text-2xl">
              {userData?.username || "Usuario"}
            </CardTitle>
            <CardDescription className="text-green-600 dark:text-muted-foreground">
              {userData?.role || "Rol no asignado"}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="grid grid-cols-[auto_1fr] items-center gap-4">
              <Mail className="h-5 w-5 text-green-600 dark:text-primary" />
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-muted-foreground">
                  Correo Electrónico
                </p>
                <p className="text-base text-green-900 dark:text-foreground">
                  {userData?.email || "Correo electrónico"}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-[auto_1fr] items-center gap-4">
              <Phone className="h-5 w-5 text-green-600 dark:text-primary" />
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-muted-foreground">
                  Teléfono
                </p>
                <p className="text-base text-green-900 dark:text-foreground">
                  {userData?.phone || "Teléfono no asignado"}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-[auto_1fr] items-center gap-4">
              <Building2 className="h-5 w-5 text-green-600 dark:text-primary" />
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-muted-foreground">
                  Empresa
                </p>
                <p className="text-base text-green-900 dark:text-foreground">
                  {empresa?.razon_social || "Empresa no asignada"}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-[auto_1fr] items-center gap-4">
              <Globe2 className="h-5 w-5 text-green-600 dark:text-primary" />
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-muted-foreground">
                  Ubicación
                </p>
                <p className="text-base text-green-900 dark:text-foreground">
                  {userData?.city || "Ubicación no asignado  "}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-[auto_1fr] items-center gap-4">
              <Calendar className="h-5 w-5 text-green-600 dark:text-primary" />
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-muted-foreground">
                  Miembro Desde
                </p>
                <p className="text-base text-green-900 dark:text-foreground">
                  {userData?.created_at
                    ? new Date(userData.created_at).toLocaleDateString("es-CO")
                    : "Fecha no asignada"}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-[auto_1fr] items-center gap-4">
              <MapPin className="h-5 w-5 text-green-600 dark:text-primary" />
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-muted-foreground">
                  Dirección
                </p>
                <p className="text-base text-green-900 dark:text-foreground">
                  {userData?.address || "Dirección no asignada"}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-[auto_1fr] items-center gap-4">
              <Clock className="h-5 w-5 text-green-600 dark:text-primary" />
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-muted-foreground">
                  Último Acceso
                </p>
                <p className="text-base text-green-900 dark:text-foreground">
                  {userData?.previous_login_at
                    ? new Date(userData.previous_login_at).toLocaleString(
                        "es-CO",
                      )
                    : "Primer acceso"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {editData && (
          <Dialog open={isEditing} onOpenChange={setIsEditing}>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto border-green-200 dark:border-border dark:bg-card">
              <DialogHeader>
                <DialogTitle className="text-green-900 flex items-center gap-2 dark:text-foreground">
                  <Edit className="h-5 w-5 text-green-600 dark:text-primary" />
                  Editar Perfil
                </DialogTitle>
                <DialogDescription className="text-green-600 dark:text-muted-foreground">
                  Actualiza tu información personal. Haz clic en guardar cuando
                  hayas terminado.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="firstname"
                    className="text-green-800 dark:text-muted-foreground"
                  >
                    Nombres
                  </Label>
                  <Input
                    id="firstname"
                    placeholder="Nombres"
                    value={editData.firstname}
                    onChange={handleInputChange}
                    className="border-green-200 focus:border-green-400 focus:ring-green-400 dark:border-border dark:bg-input dark:text-foreground dark:focus:border-primary dark:focus:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="lastname"
                    className="text-green-800 dark:text-muted-foreground"
                  >
                    Apellidos
                  </Label>
                  <Input
                    id="lastname"
                    placeholder="Apellidos"
                    value={editData.lastname}
                    onChange={handleInputChange}
                    className="border-green-200 focus:border-green-400 focus:ring-green-400 dark:border-border dark:bg-input dark:text-foreground dark:focus:border-primary dark:focus:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="username"
                    className="text-green-800 dark:text-muted-foreground"
                  >
                    Nombre de usuario
                  </Label>
                  <Input
                    id="username"
                    placeholder="Nombre de usuario"
                    value={editData.username}
                    onChange={handleInputChange}
                    className="border-green-200 focus:border-green-400 focus:ring-green-400 dark:border-border dark:bg-input dark:text-foreground dark:focus:border-primary dark:focus:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-green-800 dark:text-muted-foreground"
                  >
                    Correo Electrónico
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="correo@example.com"
                    value={editData.email}
                    onChange={handleInputChange}
                    className="border-green-200 focus:border-green-400 focus:ring-green-400 dark:border-border dark:bg-input dark:text-foreground dark:focus:border-primary dark:focus:ring-primary"
                  />
                </div>
                {/* <div className="space-y-2">
                  <Label
                    htmlFor="role"
                    className="text-green-800 dark:text-muted-foreground"
                  >
                    Rol
                  </Label>
                  <Input
                    id="role"
                    placeholder="Rol no asignado"
                    value={editData.role}
                    onChange={handleInputChange}
                    className="border-green-200 focus:border-green-400 focus:ring-green-400 dark:border-border dark:bg-input dark:text-foreground dark:focus:border-primary dark:focus:ring-primary"
                  />
                </div> */}
                <div className="space-y-2">
                  <Label
                    htmlFor="phone"
                    className="text-green-800 dark:text-muted-foreground"
                  >
                    Teléfono
                  </Label>
                  <Input
                    id="phone"
                    placeholder="Teléfono no asignado"
                    value={editData.phone}
                    onChange={handleInputChange}
                    className="border-green-200 focus:border-green-400 focus:ring-green-400 dark:border-border dark:bg-input dark:text-foreground dark:focus:border-primary dark:focus:ring-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-green-800 dark:text-muted-foreground">
                    Ciudad
                  </Label>

                  <div className="relative">
                    <Combobox
                      value={selectedCiudad}
                      onChange={(ciudad) => {
                        setSelectedCiudad(ciudad);
                        setEditData((prev) => ({
                          ...prev,
                          city: ciudad
                            ? String(ciudad.nombre_completo || ciudad.nombre)
                            : "",
                        }));
                      }}
                    >
                      <div className="relative">
                        <Combobox.Input
                          className="flex h-10 w-full rounded-md border border-green-200 bg-background px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-green-400"
                          displayValue={(ciudad: any) =>
                            ciudad?.nombre_completo || ciudad?.nombre || ""
                          }
                          onChange={(event) =>
                            setCiudadQuery(event.target.value)
                          }
                          placeholder="Buscar ciudad..."
                        />

                        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                          ⌄
                        </Combobox.Button>
                      </div>

                      <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-sm shadow-lg">
                        {loadingCiudades ? (
                          <div className="px-4 py-2">Cargando...</div>
                        ) : ciudades.length === 0 ? (
                          <div className="px-4 py-2">
                            No se encontraron ciudades
                          </div>
                        ) : (
                          ciudades.map((ciudad) => (
                            <Combobox.Option
                              key={ciudad.id}
                              value={ciudad}
                              className={({ active }) =>
                                `cursor-pointer select-none py-2 px-4 ${
                                  active ? "bg-green-100 text-green-900" : ""
                                }`
                              }
                            >
                              {ciudad.nombre_completo || ciudad.nombre}
                            </Combobox.Option>
                          ))
                        )}
                      </Combobox.Options>
                    </Combobox>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="address"
                    className="text-green-800 dark:text-muted-foreground"
                  >
                    Dirección
                  </Label>
                  <Input
                    id="address"
                    placeholder="Dirección no asignada"
                    value={editData.address}
                    onChange={handleInputChange}
                    className="border-green-200 focus:border-green-400 focus:ring-green-400 dark:border-border dark:bg-input dark:text-foreground dark:focus:border-primary dark:focus:ring-primary"
                  />
                </div>
              </div>

              <DialogFooter className="gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  className="border-green-300 text-green-700 hover:bg-green-50 bg-transparent dark:border-border dark:text-muted-foreground dark:hover:bg-secondary"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  onClick={handleSave}
                  className="bg-green-600 hover:bg-green-700 text-white dark:bg-primary dark:hover:bg-primary/90"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Cambios
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
        <Toaster />
      </main>
    </>
  );
}
