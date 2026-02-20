"use client";

import type React from "react";
import { useEffect, useState } from "react";
import InsumoForm from "../insumos/form";
import InsumoTable from "../insumos/table";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { Wrench } from "lucide-react";
import apiClient from "@/app/api/apiClient";
import { Card, CardContent } from "@/components/ui/card";

interface Insumo {
  id: number;
  nombre: string;
  unidad_medida: string;
  valor: number;
  tipo_proveedor: string;
  tipo_producto: number;
}

export default function EquiposPage() {
  const { loading } = useAuthRedirect();
  const [equipos, setEquipos] = useState<Insumo[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingEquipos, setLoadingEquipos] = useState(false);

  // Cargar equipos al montar el componente
  useEffect(() => {
    if (!loading) {
      fetchEquipos();
    }
  }, [loading]);

  // Función para cargar equipos desde la API
  const fetchEquipos = async () => {
    setLoadingEquipos(true);
    try {
      const response = await apiClient.get(
        "/productos?start=0&length=15&tipo_producto=1");
      setEquipos(response.data.data);
    } catch (error) {
      console.error("Error cargando equipos:", error);
    } finally {
      setLoadingEquipos(false);
    }
  };

  // Filtrar equipos según el término de búsqueda
  const filteredEquipos = equipos.filter((equipo) => {
    return (
      equipo.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      equipo.unidad_medida.toLowerCase().includes(searchTerm.toLowerCase()) ||
      equipo.valor.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (loading || loadingEquipos) {
    return <div className="p-4 text-center">Cargando Equipos...</div>;
  }

  return (
    <>
      <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-2 border-b border-green-100 px-4 bg-gradient-to-r from-green-50 to-white">
        <SidebarTrigger className="-ml-1 text-green-600 hover:bg-green-100" />
        <div className="flex flex-1 items-center gap-4">
          <h1 className="text-3xl font-bold tracking-tight text-green-900">
            Equipos
          </h1>
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-green-500" />
            <Input
              placeholder="Buscar equipos"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 border-green-200 focus:border-green-400 focus:ring-green-400"
            />
          </div>

          <InsumoForm
            setInsumos={setEquipos}
            tipoProducto={1}
            titulo="Equipo"
            descripcion="Completa la información del equipo"
            icon={<Wrench className="h-5 w-5 text-green-600" />}
            mostrarBotonCrear={true}
          />
        </div>
      </header>
      <main className="flex-1 space-y-6 p-6 bg-gradient-to-br from-green-50/30 to-white">
        <p className="text-green-700">
          Gestiona y visualiza todos tus equipos de construcción
        </p>
        {filteredEquipos.length === 0 ? (
          <Card className="border-green-200">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Wrench className="h-12 w-12 text-green-400 mb-4" />
              <h3 className="text-lg font-medium text-green-900 mb-2">
                No se encontraron equipos
              </h3>
              <p className="text-green-600 text-center mb-4">
                No hay equipos que coincidan con los criterios de búsqueda.
              </p>
              <InsumoForm
                setInsumos={setEquipos}
                tipoProducto={1}
                titulo="Equipo"
                descripcion="Completa la información del equipo"
                icon={<Wrench className="h-5 w-5 text-green-600" />}
                mostrarBotonCrear={true}
                onSuccess={fetchEquipos}
              />
            </CardContent>
          </Card>
        ) : (
          <InsumoTable
            insumos={filteredEquipos}
            setInsumos={setEquipos}
            tipoProducto={1}
            titulo="Equipos"
            descripcion="Lista completa de equipos disponibles para presupuestos"
            icon={<Wrench className="h-4 w-4" />}
          />
        )}
      </main>
    </>
  );
}
