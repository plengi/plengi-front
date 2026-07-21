"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Package, Wrench, HardHat, Truck, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import apiClient from "@/app/api/apiClient";
import InsumoTable from "../../insumos/table";
import { Insumo } from "../../insumos/form";

export default function SuppliesPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const budgetId = params.id as string;
    const tipo = searchParams.get("tipo") || "0";

    const [loading, setLoading] = useState(true);
    const [budgetName, setBudgetName] = useState("");
    const [insumos, setInsumos] = useState<Insumo[]>([]); // 👈 Estado local

    useEffect(() => {
        const fetchBudget = async () => {
            try {
                const res = await apiClient.get("/budgets-find", {
                    params: { id_budget: budgetId }
                });
                if (res.data.success) {
                    setBudgetName(res.data.data.nombre);
                }
            } catch (error) {
                console.error("Error cargando presupuesto", error);
            } finally {
                setLoading(false);
            }
        };
        fetchBudget();
    }, [budgetId]);

    const tipoInt = parseInt(tipo);
    const titles = ["Materiales", "Equipos", "Mano de Obra", "Transporte"];
    const icons = [
        <Package key="icon" className="h-4 w-4" />,
        <Wrench key="icon" className="h-4 w-4" />,
        <HardHat key="icon" className="h-4 w-4" />,
        <Truck key="icon" className="h-4 w-4" />
    ];
    const descriptions = [
        "Materiales utilizados en los APUs de este presupuesto.",
        "Equipos utilizados en los APUs de este presupuesto.",
        "Mano de obra utilizada en los APUs de este presupuesto.",
        "Servicios de transporte utilizados en los APUs de este presupuesto."
    ];

    if (loading) {
        return (
            <div className="flex flex-1 items-center justify-center min-h-[400px]">
                <Loader2 className="h-10 w-10 animate-spin text-green-600" />
            </div>
        );
    }

    return (
        <>
            <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-2 border-b border-green-100 px-4 bg-gradient-to-r from-green-50 to-white">
                <SidebarTrigger className="-ml-1 text-green-600 hover:bg-green-100" />
                <div className="flex flex-1 items-center gap-4">
                    <Link href={`/budgets/${budgetId}`}>
                        <Button variant="outline" size="icon" className="h-8 w-8 border-green-200 bg-transparent">
                            <ArrowLeft className="h-4 w-4 text-green-600" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-lg font-semibold text-green-900">{titles[tipoInt]}</h1>
                        <p className="text-sm text-green-600">{budgetName}</p>
                    </div>
                </div>
            </header>

            <main className="flex-1 space-y-6 p-6 bg-gradient-to-br from-green-50/30 to-white">
                <InsumoTable
                    insumos={insumos}
                    setInsumos={setInsumos}
                    tipoProducto={tipoInt}
                    titulo={titles[tipoInt]}
                    descripcion={descriptions[tipoInt]}
                    icon={icons[tipoInt]}
                    budgetId={parseInt(budgetId)}
                />
            </main>
        </>
    );
}