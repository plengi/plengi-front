"use client";

import type React from "react";
import { use, useEffect, useState } from "react";
import FormCliente from "./form";
import TablaClientes from "./table";
import { Building2, Search, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import apiClient from "../api/apiClient";
import { Card, CardContent } from "@/components/ui/card";
import { Form } from "react-router-dom";

interface Cliente {
  id: number;
  nombres: string;
  apellidos: string;
  tipo_documento: string;
  numero_documento: string;
  direccion: string;
  email: string;
  telefono: string;
}

export default function ClientesPage() {
  const { loading } = useAuthRedirect();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingClientes, setLoadingClientes] = useState(true);

  useEffect(() => {
    if (!loading) {
      fetchClientes();
    }
  }, [loading]);

  const fetchClientes = async () => {
    setLoadingClientes(true);
    try {
      const response = await apiClient.get("/clientes?start=0&length=15");
      setClientes(response.data.data);
    } catch (error) {
      console.error("Error cargando clientes:", error);
    } finally {
      setLoadingClientes(false);
    }
  };

  const filteredClientes = clientes.filter((cliente) => {
    return (
      cliente.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.numero_documento
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      cliente.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (loading || loadingClientes) {
    return <div className="p-4 text-center">Cargando clientes...</div>;
  }

  return (
    <>
      <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-2 border-b border-green-100 px-4 bg-gradient-to-r from-green-50 to-white">
        <SidebarTrigger className="-ml-1 text-green-600 hover:bg-green-100" />
        <div className="flex flex-1 items-center gap-4">
          <h1 className="text-3xl font-bold tracking-tight text-green-900">
            Clientes
          </h1>
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-green-500" />
            <Input
              placeholder="Buscar clientes"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 border-green-200 focus:border-green-400 focus:ring-green-400"
            />
          </div>

          <FormCliente setClientes={setClientes} mostrarBotonCrear={true} />
        </div>
      </header>

      <main className="flex-1 space-y-6 p-6 bg-gradient-to-br from-green-50/30 to-white">
        <p className="text-green-700">
          Gestiona y visualiza todos tus clientes
        </p>
        {filteredClientes.length === 0 ? (
          <Card className="border-green-200">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-green-400 mb-4" />
              <h3 className="text-lg font-medium text-green-900 mb-2">
                No se encontraron clientes
              </h3>
              <p className="text-green-600 text-center mb-4">
                No hay clientes que coincidan con los criterios de búsqueda.
              </p>
              <FormCliente setClientes={setClientes} mostrarBotonCrear={true} />
            </CardContent>
          </Card>
        ) : (
          <TablaClientes
            clientes={filteredClientes}
            setClientes={setClientes}
          />
        )}
      </main>
    </>
  );
}
