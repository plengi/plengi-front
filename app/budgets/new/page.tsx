"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
    ArrowLeft,
    Plus,
    Loader,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import BudgetForm from "../components/BudgetForm"
import { useToast } from "@/hooks/use-toast"
import apiClient from "@/app/api/apiClient"
import { BudgetData } from "../components/types"

export default function NewBudgetPage() {
    const router = useRouter()
    const { toast } = useToast()
    const [loading, setLoading] = useState({ save: false })

    // Función para guardar el nuevo presupuesto
    const handleSaveBudget = async (budgetData: BudgetData) => {
        setLoading({ save: true })
        console.log('Guardando presupuesto:', budgetData);
        try {
            const seccionesConOrden = budgetData.sections.map((section, index) => ({
                nombre: section.name,
                descripcion: section.description || "",
                orden: index + 1,
                tempId: section.id,
            }))

            const budgetToSave = {
                nombre: budgetData.name,
                descripcion: budgetData.description,
                proyecto: budgetData.project,
                cliente: budgetData.client,
                secciones: seccionesConOrden,
                apus: budgetData.apus.map(apu => ({
                    apuId: apu.apuId,
                    sectionId: apu.sectionId,
                    cantidad: apu.quantity,
                    orden: apu.order,
                })),
                costo_directo_total: budgetData.directTotal,
                costo_indirecto_administracion: budgetData.indirectCosts.find(c => c.name === "Administración")?.amount || 0,
                costo_indirecto_imprevistos: budgetData.indirectCosts.find(c => c.name === "Imprevistos")?.amount || 0,
                costo_indirecto_utilidad: budgetData.indirectCosts.find(c => c.name === "Utilidad")?.amount || 0,
                presupuesto_total: budgetData.grandTotal,
            }

            const response = await apiClient.post('/budgets', budgetToSave)

            if (response.data.success) {
                toast({
                    variant: "success",
                    title: "Presupuesto guardado",
                    description: response.data.message || "El presupuesto se ha guardado correctamente",
                })
                router.push("/budgets")
            } else {
                throw new Error(response.data.message || "Error al guardar el presupuesto")
            }
        } catch (error: any) {
            console.error("Error al guardar el presupuesto:", error)
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "No se pudo guardar el presupuesto",
            })
        } finally {
            setLoading({ save: false })
        }
    }

    return (
        <div className="container mx-auto py-8 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Link href="/budgets">
                        <Button variant="outline" size="icon" className="h-8 w-8 border-green-200 bg-transparent">
                            <ArrowLeft className="h-4 w-4 text-green-600" />
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight text-green-900">Crear Nuevo Presupuesto</h1>
                </div>
            </div>

            <BudgetForm onSave={handleSaveBudget} />
        </div>
    )
}