'use client';

import type React from "react";
import { useEffect, useState } from 'react';
import InsumoForm from '../insumos/form';
import InsumoTable from '../insumos/table';
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import { Truck } from "lucide-react";
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

export default function TransportesPage() {
    const { loading } = useAuthRedirect();
    const [transportes, setTransportes] = useState<Insumo[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loadingTransportes, setLoadingTransportes] = useState(false);


    useEffect(() => {
        if (!loading) {
            fetchTransportes();
        }
    }, [loading]);

    const fetchTransportes = async () => {
        setLoadingTransportes(true);
        try {
            const response = await apiClient.get("/productos?start=0&length=15&tipo_producto=3");
            setTransportes(response.data.data);
        } catch (error) {
            console.error("Error cargando transportes:", error);
        } finally {
            setLoadingTransportes(false);
        }
    };

    const filteredTransportes = transportes.filter((transporte) => {
        return (
            transporte.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            transporte.unidad_medida.toLowerCase().includes(searchTerm.toLowerCase()) ||
            transporte.valor.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    if (loading || loadingTransportes) {
        return <div className="p-4 text-center">Cargando Transporte...</div>;
    }

    return (<>
        <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-2 border-b border-green-100 px-4 bg-gradient-to-r from-green-50 to-white">
            <SidebarTrigger className="-ml-1 text-green-600 hover:bg-green-100" />
            <div className="flex flex-1 items-center gap-4">
                <h1 className="text-3xl font-bold tracking-tight text-green-900">Transportes</h1>
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-green-500" />
                    <Input
                        placeholder="Buscar transportes"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 border-green-200 focus:border-green-400 focus:ring-green-400"
                    />
                </div>

                <InsumoForm
                    setInsumos={setTransportes}
                    tipoProducto={3}
                    titulo="Transporte"
                    descripcion="Completa la información del transporte"
                    icon={<Truck className="h-5 w-5 text-green-600" />}
                    mostrarBotonCrear={true}
                />
            </div>
        </header>
        <main className="flex-1 space-y-6 p-6 bg-gradient-to-br from-green-50/30 to-white">
            <p className="text-green-700">
                Gestiona y visualiza todos tus servicios de transporte
            </p>
            {filteredTransportes.length === 0 ? (
          <Card className="border-green-200">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Truck className="h-12 w-12 text-green-400 mb-4" />
              <h3 className="text-lg font-medium text-green-900 mb-2">
                No se encontro transporte
              </h3>
              <p className="text-green-600 text-center mb-4">
                No hay transporte que coincidan con los criterios de búsqueda.
              </p>
              <InsumoForm
                setInsumos={setTransportes}
                tipoProducto={3}
                titulo="Transporte"
                descripcion="Completa la información del transporte"
                icon={<Truck className="h-5 w-5 text-green-600" />}
                mostrarBotonCrear={true}
                onSuccess={fetchTransportes}
              />
            </CardContent>
          </Card>
        ) : (
          <InsumoTable
            insumos={filteredTransportes}
            setInsumos={setTransportes}
            tipoProducto={3}
            titulo="Transportes"
            descripcion="Lista completa de transportes disponibles para presupuestos"
            icon={<Truck className="h-4 w-4" />}
          />
        )}
        </main>
    </>);
}