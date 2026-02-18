"use client";

import type React from "react";
import { useState, useEffect } from "react";
import FormEmpresas from "./form";
import TablaEmpresas from "./table";
import { Search, Building2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { Card, CardContent } from "@/components/ui/card";
import apiClient from "@/app/api/apiClient";

interface Empresa {
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

export default function CompanyPage() {
  const { loading } = useAuthRedirect();

  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingEmpresas, setLoadingEmpresas] = useState(true);

  useEffect(() => {
    if (!loading) {
      fetchEmpresas();
    }
  }, [loading]);

  const fetchEmpresas = async () => {
    setLoadingEmpresas(true);
    try {
      const response = await apiClient.get("/empresas?start=0&length=15");
      setEmpresas(response.data.data);
    } catch (error) {
      console.error("Error cargando empresas:", error);
    } finally {
      setLoadingEmpresas(false);
    }
  };

  const filteredEmpresa = empresas.filter((empresa) => {
    return (
      empresa.razon_social.toLowerCase().includes(searchTerm.toLowerCase()) ||
      empresa.nit?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      empresa.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (loading || loadingEmpresas) {
    return (
      <div className="p-6 text-center text-green-700">
        Cargando empresas...
      </div>
    );
  }

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-green-100 px-4 bg-gradient-to-r from-green-50 to-white">
        <SidebarTrigger className="-ml-1 text-green-600 hover:bg-green-100" />

        <div className="flex flex-1 items-center gap-4">
          <h1 className="text-3xl font-bold tracking-tight text-green-900">
            Empresas
          </h1>

          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-green-500" />
            <Input
              placeholder="Buscar empresas"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 border-green-200 focus:border-green-400 focus:ring-green-400"
            />
          </div>

          <FormEmpresas setEmpresas={setEmpresas} mostrarBotonCrear />
        </div>
      </header>

      <main className="flex-1 space-y-6 p-6 bg-gradient-to-br from-green-50/30 to-white">
        <p className="text-green-700">
          Gestiona y visualiza todas tus empresas
        </p>

        {filteredEmpresa.length === 0 ? (
          <Card className="border-green-200">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building2 className="h-12 w-12 text-green-400 mb-4" />
              <h3 className="text-lg font-medium text-green-900 mb-2">
                No se encontraron empresas
              </h3>
              <p className="text-green-600 text-center mb-4">
                No hay empresas que coincidan con los criterios de búsqueda.
              </p>
              <FormEmpresas setEmpresas={setEmpresas} mostrarBotonCrear />
            </CardContent>
          </Card>
        ) : (
          <TablaEmpresas
            empresas={filteredEmpresa}
            setEmpresas={setEmpresas}
          />
        )}
      </main>
    </>
  );
}
