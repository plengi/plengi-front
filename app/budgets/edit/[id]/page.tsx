"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import {
    ArrowLeft,
    Loader,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import BudgetForm from "../../components/BudgetForm"
import { useToast } from "@/hooks/use-toast"
import apiClient from "@/app/api/apiClient"
import { BudgetData } from "../../components/types"

export const dynamicParams = false

export default function EditBudgetPage() {
    const router = useRouter()
    const params = useParams()
    const { toast } = useToast()
    const [loading, setLoading] = useState({
        initial: true,
        save: false,
    })
    const [budgetData, setBudgetData] = useState<BudgetData | null>(null)

    // Cargar datos del presupuesto existente
    useEffect(() => {
        const fetchBudgetData = async () => {
            try {
                const response = await apiClient.get("/budgets-find", {
                    params: { id_budget: params.id }
                })

                if (response.data.success) {
                    const data = response.data.data

                    // Transformar datos del backend al formato del frontend
                    const sections = data.secciones.map((section: any, index: number) => ({
                        id: `section-${section.id}`,
                        name: section.nombre,
                        description: section.descripcion || "",
                        order: section.orden || index,
                    }))

                    const apus = data.apus_formateados.map((apu: any) => ({
                        id: `budget-apu-${apu.id}`,
                        apuId: apu.apuId,
                        name: apu.name,
                        code: apu.code,
                        unit: apu.unit,
                        unitPrice: apu.unitPrice,
                        quantity: apu.quantity,
                        total: apu.total,
                        sectionId: `section-${apu.sectionId}`,
                        activityType: apu.activityType,
                        order: apu.order,
                        description: apu.description,
                    }))

                    const indirectCosts = [
                        {
                            id: "administration",
                            name: "Administración",
                            percentage: data.costo_indirecto_administracion > 0 && data.costo_directo_total > 0
                                ? (data.costo_indirecto_administracion / data.costo_directo_total) * 100
                                : 10,
                            amount: data.costo_indirecto_administracion,
                        },
                        {
                            id: "contingency",
                            name: "Imprevistos",
                            percentage: data.costo_indirecto_imprevistos > 0 && data.costo_directo_total > 0
                                ? (data.costo_indirecto_imprevistos / data.costo_directo_total) * 100
                                : 5,
                            amount: data.costo_indirecto_imprevistos,
                        },
                        {
                            id: "profit",
                            name: "Utilidad",
                            percentage: data.costo_indirecto_utilidad > 0 && data.costo_directo_total > 0
                                ? (data.costo_indirecto_utilidad / data.costo_directo_total) * 100
                                : 15,
                            amount: data.costo_indirecto_utilidad,
                        },
                    ]

                    setBudgetData({
                        name: data.nombre || "",
                        description: data.descripcion || "",
                        sections: sections,
                        apus: apus,
                        indirectCosts: indirectCosts,
                        directTotal: data.costo_directo_total || 0,
                        indirectTotal: (data.costo_indirecto_administracion || 0) +
                            (data.costo_indirecto_imprevistos || 0) +
                            (data.costo_indirecto_utilidad || 0),
                        grandTotal: data.presupuesto_total || 0,
                    })
                } else {
                    throw new Error("No se pudo cargar el presupuesto")
                }
            } catch (error: any) {
                console.error("Error al cargar el presupuesto:", error)
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: error.message || "No se pudo cargar el presupuesto",
                })
                router.push("/budgets")
            } finally {
                setLoading({ ...loading, initial: false })
            }
        }

        if (params.id) {
            fetchBudgetData()
        }
    }, [params.id])

    // Función para guardar los cambios
    const handleSaveBudget = async (budgetData: BudgetData) => {
        setLoading({ ...loading, save: true })

        try {
            const seccionesConOrden = budgetData.sections.map((section, index) => ({
                nombre: section.name,
                descripcion: section.description || "",
                orden: index + 1,
                tempId: section.id,
            }))

            // Mapear sectionId temporal al ID real del backend
            const sectionIdMap: Record<string, number> = {}
            budgetData.sections.forEach((section, index) => {
                // Extraer el ID numérico del tempId (section-{id})
                const match = section.id.match(/section-(\d+)/)
                if (match) {
                    sectionIdMap[section.id] = parseInt(match[1])
                } else {
                    // Si es una nueva sección, asignar un ID temporal negativo
                    sectionIdMap[section.id] = -(index + 1)
                }
            })

            const budgetToUpdate = {
                id: params.id,
                nombre: budgetData.name,
                descripcion: budgetData.description,
                secciones: seccionesConOrden,
                apus: budgetData.apus.map(apu => ({
                    apuId: apu.apuId,
                    sectionId: sectionIdMap[apu.sectionId] || 1, // Fallback a 1 si no se encuentra
                    cantidad: apu.quantity,
                    orden: apu.order,
                })),
                costo_directo_total: budgetData.directTotal,
                costo_indirecto_administracion: budgetData.indirectCosts.find(c => c.name === "Administración")?.amount || 0,
                costo_indirecto_imprevistos: budgetData.indirectCosts.find(c => c.name === "Imprevistos")?.amount || 0,
                costo_indirecto_utilidad: budgetData.indirectCosts.find(c => c.name === "Utilidad")?.amount || 0,
                presupuesto_total: budgetData.grandTotal,
            }

            const response = await apiClient.put('/budgets', budgetToUpdate)

            if (response.data.success) {
                toast({
                    variant: "success",
                    title: "Presupuesto actualizado",
                    description: response.data.message || "El presupuesto se ha actualizado correctamente",
                })
                router.push("/budgets")
            } else {
                throw new Error(response.data.message || "Error al actualizar el presupuesto")
            }
        } catch (error: any) {
            console.error("Error al actualizar el presupuesto:", error)
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "No se pudo actualizar el presupuesto",
            })
        } finally {
            setLoading({ ...loading, save: false })
        }
    }

    if (loading.initial) {
        return (
            <div className="container mx-auto py-8 flex items-center justify-center">
                <Loader className="h-8 w-8 animate-spin text-green-600" />
            </div>
        )
    }

    if (!budgetData) {
        return (
            <div className="container mx-auto py-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-600">Presupuesto no encontrado</h1>
                    <Link href="/budgets">
                        <Button className="mt-4">Volver a presupuestos</Button>
                    </Link>
                </div>
            </div>
        )
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
                    <h1 className="text-3xl font-bold tracking-tight text-green-900">Editar Presupuesto</h1>
                </div>
            </div>

            <BudgetForm
                initialData={budgetData}
                isEditing={true}
                budgetId={params.id as string}
                onSave={handleSaveBudget}
            />
        </div>
    )
}