"use client";

import { useEffect, useState } from "react";
import TablaAPU from "./table";
import Link from "next/link";
import { Search, Plus, BarChart3 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { useApus } from "./hooks/useApus";
import apiClient from "@/app/api/apiClient";
import { Card, CardContent } from "@/components/ui/card";

export default function ApusPage() {
  const { loading: authLoading } = useAuthRedirect();
  const { apus, setApus, loading: apusLoading, fetchApus } = useApus();
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingApus, setLoadingApus] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      fetchsApus();
    }
  }, [authLoading]);

  const fetchsApus = async () => {
    setLoadingApus(true);
    try {
      const response = await apiClient.get("/apus?start=0&length=15");
      setApus(response.data.data);
    } catch (error) {
      console.error("Error cargando apus:", error);
    } finally {
      setLoadingApus(false);
    }
  };

  const filteredApus = apus.filter((apu) => {
    return (
      apu.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apu.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (authLoading || loadingApus) {
    return <div className="p-4 text-center">Cargando APUs...</div>;
  }

  return (
    <>
      <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-2 border-b border-green-100 px-4 bg-gradient-to-r from-green-50 to-white">
        <SidebarTrigger className="-ml-1 text-green-600 hover:bg-green-100" />
        <div className="flex flex-1 items-center gap-4">
          <h1 className="text-3xl font-bold tracking-tight text-green-900">
            Análisis de Precios Unitarios (APU)
          </h1>
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-green-500" />
            <Input
              placeholder="Buscar apus"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 border-green-200 focus:border-green-400 focus:ring-green-400"
            />
          </div>

          <Link href="/budgets/apu/new">
            <Button className="gap-2 bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-200">
              <Plus className="h-4 w-4" />
              Nuevo APU
            </Button>
          </Link>
        </div>
      </header>
      <main className="flex-1 space-y-6 p-6 bg-gradient-to-br from-green-50/30 to-white">
        <p className="text-green-700">
          Gestiona el catálogo de análisis de precios unitarios para tus proyectos
        </p>
        {filteredApus.length === 0 && !loadingApus ? (
          <Card className="border-green-200">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BarChart3 className="h-12 w-12 text-green-400 mb-4" />
              <h3 className="text-lg font-medium text-green-900 mb-2">
                No se encontraron apus
              </h3>
              <p className="text-green-600 text-center mb-4">
                No hay apus que coincidan con los criterios de búsqueda.
              </p>
              <Link href="/budgets/apu/new">
                <Button className="gap-2 bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-200">
                  <Plus className="h-4 w-4" />
                  Nuevo APU
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <TablaAPU apus={filteredApus} setApus={setApus} />
        )}
      </main>
    </>
  );
}
