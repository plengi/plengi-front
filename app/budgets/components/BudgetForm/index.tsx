"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import apiClient from "@/app/api/apiClient"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
    BudgetData,
    BudgetFormProps,
    ApiApu,
    BudgetAPU,
    BudgetSection,
    IndirectCost
} from "../types"
import BudgetInfoCard from "./BudgetInfoCard"
import AddApuCard from "@/app/budgets/components/BudgetForm/AddApuCard"
import BudgetSectionsCard from "@/app/budgets/components/BudgetForm/BudgetSectionsCard"
import IndirectCostsCard from "@/app/budgets/components/BudgetForm/IndirectCostsCard"
import BudgetSummaryCard from "@/app/budgets/components/BudgetForm/BudgetSummaryCard"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Check, Loader } from "lucide-react"

// Función para formatear precios - ¡EXPORTADA!
export const formatPrice = (price: string | number): string => {
    return new Intl.NumberFormat("es-CL", {
        style: "currency",
        currency: "CLP",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(typeof price === "string" ? parseFloat(price) : price)
}

// Configuración inicial del presupuesto
const initialBudgetData: BudgetData = {
    name: "",
    description: "",
    sections: [
        {
            id: "preliminares",
            name: "Preliminares",
            description: "Trabajos preliminares y preparación del terreno",
            order: 0,
        },
    ],
    apus: [],
    indirectCosts: [
        {
            id: "administration",
            name: "Administración",
            percentage: 10,
            amount: 0,
        },
        {
            id: "contingency",
            name: "Imprevistos",
            percentage: 5,
            amount: 0,
        },
        {
            id: "profit",
            name: "Utilidad",
            percentage: 15,
            amount: 0,
        },
    ],
    directTotal: 0,
    indirectTotal: 0,
    grandTotal: 0,
}

export default function BudgetForm({
    initialData,
    isEditing = false,
    budgetId,
    onSave
}: BudgetFormProps) {
    const router = useRouter()
    const { toast } = useToast()
    onSave = onSave || (async (data: BudgetData) => { })
    const [budgetData, setBudgetData] = useState<BudgetData>(initialData || initialBudgetData)
    const [availableAPUs, setAvailableAPUs] = useState<ApiApu[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedSection, setSelectedSection] = useState<string>("preliminares")
    const [draggedAPU, setDraggedAPU] = useState<string | null>(null)
    const [dragOverSection, setDragOverSection] = useState<string | null>(null)
    const [showSectionAlert, setShowSectionAlert] = useState(false)
    const [showAPUAlert, setShowAPUAlert] = useState(false)
    const [alertMessage, setAlertMessage] = useState("")
    const [loading, setLoading] = useState({
        apus: false,
        save: false,
    })
    const [pagination, setPagination] = useState({
        start: 0,
        length: 10,
        draw: 1,
    })

    // Recalcular totales cuando cambian los APUs o costos indirectos
    useEffect(() => {
        const directTotal = budgetData.apus.reduce((sum, apu) => sum + apu.total, 0)

        const updatedIndirectCosts = budgetData.indirectCosts.map((cost) => ({
            ...cost,
            amount: (directTotal * cost.percentage) / 100,
        }))

        const indirectTotal = updatedIndirectCosts.reduce((sum, cost) => sum + cost.amount, 0)
        const grandTotal = directTotal + indirectTotal

        setBudgetData((prev) => ({
            ...prev,
            directTotal,
            indirectTotal,
            grandTotal,
            indirectCosts: updatedIndirectCosts,
        }))
    }, [budgetData.apus, budgetData.indirectCosts.map((c) => c.percentage).join(",")])

    // Cargar APUs disponibles desde la API
    const fetchAPUs = async () => {
        setLoading({ ...loading, apus: true })
        try {
            const response = await apiClient.get("/apus", {
                params: {
                    search: searchTerm,
                    start: pagination.start,
                    length: pagination.length,
                    draw: pagination.draw,
                },
            })

            if (response.data.success) {
                const mappedAPUs = response.data.data.map((apu: any) => ({
                    id: apu.id,
                    codigo: apu.codigo,
                    nombre: apu.nombre,
                    descripcion: apu.descripcion,
                    tipo_actividad: apu.tipo_actividad,
                    unidad_medida: apu.unidad_medida,
                    valor_total: parseFloat(apu.valor_total),
                }))

                if (pagination.start > 0) {
                    setAvailableAPUs((prev) => [...prev, ...mappedAPUs])
                } else {
                    setAvailableAPUs(mappedAPUs)
                }
            }
        } catch (error) {
            console.error("Error al cargar APUs:", error)
            toast({
                variant: "destructive",
                title: "Error",
                description: "No se pudieron cargar los APUs",
            })
        } finally {
            setLoading({ ...loading, apus: false })
        }
    }

    // Efecto para buscar APUs
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm !== "" || pagination.start > 0) {
                fetchAPUs()
            }
        }, 500)

        return () => clearTimeout(timer)
    }, [searchTerm, pagination.start, pagination.draw])

    // Efecto para cargar APUs iniciales
    useEffect(() => {
        if (availableAPUs.length === 0) {
            fetchAPUs()
        }
    }, [])

    // Mostrar alerta temporal
    const showAlert = (message: string, type: "section" | "apu") => {
        setAlertMessage(message)
        if (type === "section") {
            setShowSectionAlert(true)
            setTimeout(() => setShowSectionAlert(false), 3000)
        } else {
            setShowAPUAlert(true)
            setTimeout(() => setShowAPUAlert(false), 3000)
        }
    }

    // Agregar APU al presupuesto
    const addAPUToBudget = (apu: ApiApu) => {
        if (!selectedSection) {
            alert("Selecciona una sección antes de agregar el APU")
            return
        }

        const maxOrder = Math.max(...budgetData.apus.filter((a) => a.sectionId === selectedSection).map((a) => a.order), 0)

        const budgetAPU: BudgetAPU = {
            id: `budget-apu-${Date.now()}-${apu.id}`,
            apuId: apu.id,
            name: apu.nombre,
            code: apu.codigo,
            unit: apu.unidad_medida,
            unitPrice: apu.valor_total,
            quantity: 1,
            total: apu.valor_total,
            sectionId: selectedSection,
            activityType: apu.tipo_actividad,
            order: maxOrder + 1,
            description: apu.descripcion,
        }

        setBudgetData((prev) => ({
            ...prev,
            apus: [...prev.apus, budgetAPU],
        }))

        const sectionName = budgetData.sections.find((s) => s.id === selectedSection)?.name || "la sección"
        showAlert(`APU "${apu.nombre}" agregado a ${sectionName}`, "apu")
    }

    // Actualizar cantidad de APU
    const updateAPUQuantity = (apuId: string, quantity: number) => {
        setBudgetData((prev) => ({
            ...prev,
            apus: prev.apus.map((apu) =>
                apu.id === apuId ? { ...apu, quantity, total: quantity * apu.unitPrice } : apu,
            ),
        }))
    }

    // Eliminar APU del presupuesto
    const removeAPUFromBudget = (apuId: string) => {
        setBudgetData((prev) => ({
            ...prev,
            apus: prev.apus.filter((apu) => apu.id !== apuId),
        }))
    }

    // Agregar nueva sección
    const addSection = (section: BudgetSection) => {
        const nextOrder = budgetData.sections.length;

        const newSection: BudgetSection = {
            ...section,
            order: nextOrder,
        }

        setBudgetData((prev) => ({
            ...prev,
            sections: [...prev.sections, newSection],
        }))

        setSelectedSection(newSection.id)
        showAlert(`Sección "${section.name}" creada exitosamente`, "section")
    }

    // Actualizar sección
    const updateSection = (sectionId: string, updates: Partial<BudgetSection>) => {
        setBudgetData((prev) => ({
            ...prev,
            sections: prev.sections.map((section) =>
                section.id === sectionId ? { ...section, ...updates } : section
            ),
        }))
        showAlert(`Sección actualizada exitosamente`, "section")
    }

    // Eliminar sección
    const deleteSection = (sectionId: string) => {
        if (sectionId === "preliminares") {
            alert("No se puede eliminar la sección 'Preliminares'")
            return
        }

        setBudgetData((prev) => ({
            ...prev,
            sections: prev.sections.filter((section) => section.id !== sectionId),
            apus: prev.apus.map((apu) =>
                apu.sectionId === sectionId ? { ...apu, sectionId: "preliminares" } : apu
            ),
        }))
        showAlert(`Sección eliminada. Los APUs se movieron a 'Preliminares'`, "section")
    }

    // Actualizar porcentaje de costo indirecto
    const updateIndirectCostPercentage = (costId: string, percentage: number) => {
        setBudgetData((prev) => ({
            ...prev,
            indirectCosts: prev.indirectCosts.map((cost) =>
                cost.id === costId ? { ...cost, percentage } : cost
            ),
        }))
    }

    // Mover APU hacia arriba
    const moveAPUUp = (apuId: string, sectionId: string) => {
        const sectionAPUs = budgetData.apus
            .filter((apu) => apu.sectionId === sectionId)
            .sort((a, b) => a.order - b.order)

        const currentIndex = sectionAPUs.findIndex((apu) => apu.id === apuId)

        if (currentIndex > 0) {
            const currentAPU = sectionAPUs[currentIndex]
            const previousAPU = sectionAPUs[currentIndex - 1]

            setBudgetData((prev) => ({
                ...prev,
                apus: prev.apus.map((apu) => {
                    if (apu.id === currentAPU.id) return { ...apu, order: previousAPU.order }
                    if (apu.id === previousAPU.id) return { ...apu, order: currentAPU.order }
                    return apu
                }),
            }))
        }
    }

    // Mover APU hacia abajo
    const moveAPUDown = (apuId: string, sectionId: string) => {
        const sectionAPUs = budgetData.apus
            .filter((apu) => apu.sectionId === sectionId)
            .sort((a, b) => a.order - b.order)

        const currentIndex = sectionAPUs.findIndex((apu) => apu.id === apuId)

        if (currentIndex < sectionAPUs.length - 1) {
            const currentAPU = sectionAPUs[currentIndex]
            const nextAPU = sectionAPUs[currentIndex + 1]

            setBudgetData((prev) => ({
                ...prev,
                apus: prev.apus.map((apu) => {
                    if (apu.id === currentAPU.id) return { ...apu, order: nextAPU.order }
                    if (apu.id === nextAPU.id) return { ...apu, order: currentAPU.order }
                    return apu
                }),
            }))
        }
    }

    // Manejar inicio de arrastre de APU
    const handleDragStart = (e: React.DragEvent, apuId: string) => {
        setDraggedAPU(apuId)
        e.dataTransfer.effectAllowed = "move"
        e.dataTransfer.setData("text/plain", apuId)
    }

    // Manejar arrastre sobre sección
    const handleDragOver = (e: React.DragEvent, sectionId: string) => {
        e.preventDefault()
        setDragOverSection(sectionId)
    }

    // Manejar soltar APU en sección
    const handleDrop = (e: React.DragEvent, targetSectionId: string) => {
        e.preventDefault()

        if (draggedAPU && targetSectionId) {
            const apu = budgetData.apus.find((a) => a.id === draggedAPU)

            if (apu && apu.sectionId !== targetSectionId) {
                const maxOrder = Math.max(
                    ...budgetData.apus.filter((a) => a.sectionId === targetSectionId).map((a) => a.order),
                    0,
                )

                setBudgetData((prev) => ({
                    ...prev,
                    apus: prev.apus.map((a) =>
                        a.id === draggedAPU ? { ...a, sectionId: targetSectionId, order: maxOrder + 1 } : a,
                    ),
                }))

                const sourceSectionName = budgetData.sections.find((s) => s.id === apu.sectionId)?.name || "sección anterior"
                const targetSectionName = budgetData.sections.find((s) => s.id === targetSectionId)?.name || "nueva sección"
                showAlert(`APU "${apu.name}" movido de ${sourceSectionName} a ${targetSectionName}`, "apu")
            }
        }

        setDraggedAPU(null)
        setDragOverSection(null)
    }

    // Manejar fin de arrastre
    const handleDragEnd = () => {
        setDraggedAPU(null)
        setDragOverSection(null)
    }

    // Mover APU a otra sección
    const moveAPUToSection = (apuId: string, targetSectionId: string) => {
        const apu = budgetData.apus.find((a) => a.id === apuId)

        if (apu && apu.sectionId !== targetSectionId) {
            const maxOrder = Math.max(
                ...budgetData.apus.filter((a) => a.sectionId === targetSectionId).map((a) => a.order),
                0,
            )

            setBudgetData((prev) => ({
                ...prev,
                apus: prev.apus.map((a) =>
                    a.id === apuId ? { ...a, sectionId: targetSectionId, order: maxOrder + 1 } : a
                ),
            }))

            const sourceSectionName = budgetData.sections.find((s) => s.id === apu.sectionId)?.name || "sección anterior"
            const targetSectionName = budgetData.sections.find((s) => s.id === targetSectionId)?.name || "nueva sección"
            showAlert(`APU "${apu.name}" movido de ${sourceSectionName} a ${targetSectionName}`, "apu")
        }
    }

    // Cargar más resultados
    const loadMoreResults = () => {
        setPagination((prev) => ({
            start: prev.start + prev.length,
            length: prev.length,
            draw: prev.draw + 1,
        }))
    }

    // Filtrar APUs disponibles
    const filteredAPUs = availableAPUs.filter(
        (apu) =>
            apu.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            apu.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            apu.tipo_actividad.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    return (
        <>
            {/* Alertas */}
            {showSectionAlert && (
                <Alert className="border-green-200 bg-green-50 mb-6">
                    <Check className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">{alertMessage}</AlertDescription>
                </Alert>
            )}

            {showAPUAlert && (
                <Alert className="border-blue-200 bg-blue-50 mb-6">
                    <Check className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">{alertMessage}</AlertDescription>
                </Alert>
            )}

            <BudgetInfoCard
                budgetData={budgetData}
                setBudgetData={setBudgetData}
            />

            <AddApuCard
                budgetData={budgetData}
                selectedSection={selectedSection}
                setSelectedSection={setSelectedSection}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                filteredAPUs={filteredAPUs}
                loading={loading.apus}
                onAddSection={addSection}
                onAddAPU={addAPUToBudget}
                onLoadMore={loadMoreResults}
            />

            <BudgetSectionsCard
                budgetData={budgetData}
                draggedAPU={draggedAPU}
                dragOverSection={dragOverSection}
                onUpdateSection={updateSection}
                onDeleteSection={deleteSection}
                onUpdateAPUQuantity={updateAPUQuantity}
                onRemoveAPU={removeAPUFromBudget}
                onMoveAPUUp={moveAPUUp}
                onMoveAPUDown={moveAPUDown}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onDragEnd={handleDragEnd}
                onMoveAPUToSection={moveAPUToSection}
                formatPrice={formatPrice}
            />

            <IndirectCostsCard
                budgetData={budgetData}
                onUpdateIndirectCostPercentage={updateIndirectCostPercentage}
                formatPrice={formatPrice}
            />

            <BudgetSummaryCard
                budgetData={budgetData}
                formatPrice={formatPrice}
            />

            <div className="flex justify-end gap-4">
                <Link href="/budgets">
                    <Button variant="outline" className="border-green-300 text-green-700 hover:bg-green-50 bg-transparent">
                        Cancelar
                    </Button>
                </Link>
                <Button
                    onClick={async () => {
                        setLoading({ ...loading, save: true })
                        await onSave(budgetData)
                        setLoading({ ...loading, save: false })
                    }}
                    disabled={loading.save}
                    className="bg-green-600 hover:bg-green-700 text-white"
                >
                    {loading.save ? (
                        <>
                            <Loader className="h-4 w-4 animate-spin mr-2" />
                            Guardando...
                        </>
                    ) : (
                        "Guardar Presupuesto"
                    )}
                </Button>
            </div>
        </>
    )
}