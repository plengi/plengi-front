"use client"

import { useState, useEffect } from "react"
import {
    ArrowLeft,
    Calculator,
    Building2,
    MapPin,
    ChevronRight,
    ChevronLeft,
    Package,
    Wrench,
    HardHat,
    Truck,
    Edit2,
    Printer,
    Download,
    Search,
    X,
    Loader2,
} from "lucide-react"
import Link from "next/link"
import { useParams, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import apiClient from "@/app/api/apiClient"

// ==================== HELPERS ====================
const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("es-CL", {
        style: "currency",
        currency: "CLP",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(price)
}

// ==================== TIPOS ====================
interface ApuResumen {
    id: number
    apuId: number
    sectionId: number
    name: string
    code: string
    unit: string
    unitPrice: number
    quantity: number
    total: number
    activityType: string
    description: string
    order: number
}

interface Seccion {
    id: number
    nombre: string
    descripcion: string
    orden: number
}

interface ProyectoInfo {
    id: number
    nombre: string
    ubicacion: string | null
    estado: string
    cliente_nombre: string | null
}

interface Budget {
    id: number
    nombre: string
    descripcion: string
    costo_directo_total: string
    costo_indirecto_administracion: string
    costo_indirecto_imprevistos: string
    costo_indirecto_utilidad: string
    presupuesto_total: string
    created_at: string
    secciones: Seccion[]
    apus_formateados: ApuResumen[]
    proyecto_info: ProyectoInfo | null
}

interface InsumoDetalle {
    id_producto: number
    cantidad: number
    cantidad_total: number
    costo: number
    desperdicio: number
    rendimiento: number
    total: number
    prestaciones: number | null
    distancia: number | null
    producto: {
        id: number
        nombre: string
        unidad_medida: string
        valor: number
        tipo_producto: number
        tipo_proveedor: number | null
    }
}

interface ApuDetalle {
    id: number
    nombre: string
    descripcion: string
    unidad_medida: string
    tipo_actividad: string
    valor_total: number
    detalles: InsumoDetalle[]
}

// ==================== COMPONENTE PRINCIPAL ====================
export default function APUsPage() {
    const params = useParams()
    const searchParams = useSearchParams()
    const budgetId = params.id as string
    const isAPG = searchParams.get("mode") === "apg"

    // Estados
    const [budget, setBudget] = useState<Budget | null>(null)
    const [apus, setApus] = useState<ApuResumen[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [currentAPUDetail, setCurrentAPUDetail] = useState<ApuDetalle | null>(null)
    const [loadingBudget, setLoadingBudget] = useState(true)
    const [loadingDetail, setLoadingDetail] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [showIndirectCosts, setShowIndirectCosts] = useState(false)

    // Cargar presupuesto y lista de APUs
    useEffect(() => {
        const fetchBudget = async () => {
            try {
                setLoadingBudget(true)
                setError(null)
                const response = await apiClient.get("/budgets-find", {
                    params: { id_budget: budgetId },
                })
                if (response.data.success) {
                    const data = response.data.data as Budget
                    setBudget(data)
                    const sortedApus = (data.apus_formateados || []).sort((a, b) => a.order - b.order)
                    setApus(sortedApus)
                    if (sortedApus.length > 0) {
                        setCurrentIndex(0)
                        await loadAPUDetail(sortedApus[0].apuId)
                    } else {
                        setCurrentAPUDetail(null)
                    }
                } else {
                    setError(response.data.message || "Error al cargar el presupuesto")
                }
            } catch (err: any) {
                setError(err?.response?.data?.message || "No se pudo cargar el presupuesto")
            } finally {
                setLoadingBudget(false)
            }
        }
        fetchBudget()
    }, [budgetId])

    const loadAPUDetail = async (apuId: number) => {
        try {
            setLoadingDetail(true)
            const response = await apiClient.get("/apu-find", {
                params: { id_apu: apuId },
            })
            if (response.data.success) {
                setCurrentAPUDetail(response.data.data)
            } else {
                setCurrentAPUDetail(null)
            }
        } catch (err) {
            console.error("Error cargando detalle del APU", err)
            setCurrentAPUDetail(null)
        } finally {
            setLoadingDetail(false)
        }
    }

    // Navegación
    const handlePrevious = () => {
        if (apus.length === 0) return
        const newIndex = currentIndex === 0 ? apus.length - 1 : currentIndex - 1
        setCurrentIndex(newIndex)
        loadAPUDetail(apus[newIndex].apuId)
    }

    const handleNext = () => {
        if (apus.length === 0) return
        const newIndex = currentIndex === apus.length - 1 ? 0 : currentIndex + 1
        setCurrentIndex(newIndex)
        loadAPUDetail(apus[newIndex].apuId)
    }

    // Filtro de búsqueda
    const filteredApus = apus.filter((apu) => {
        const query = searchQuery.toLowerCase()
        return (
            apu.name.toLowerCase().includes(query) ||
            apu.code.toLowerCase().includes(query) ||
            apu.activityType.toLowerCase().includes(query)
        )
    })

    const currentAPU = apus.length > 0 ? apus[currentIndex] : null

    // Porcentajes de costos indirectos (globales del presupuesto)
    const directTotal = budget ? parseFloat(budget.costo_directo_total) : 0
    const adminAmount = budget ? parseFloat(budget.costo_indirecto_administracion) : 0
    const contingencyAmount = budget ? parseFloat(budget.costo_indirecto_imprevistos) : 0
    const profitAmount = budget ? parseFloat(budget.costo_indirecto_utilidad) : 0
    const adminPct = directTotal > 0 ? Math.round((adminAmount / directTotal) * 100) : 0
    const contingencyPct = directTotal > 0 ? Math.round((contingencyAmount / directTotal) * 100) : 0
    const profitPct = directTotal > 0 ? Math.round((profitAmount / directTotal) * 100) : 0

    // Factor de multiplicación para APG (cantidad del APU)
    const multiplier = isAPG && currentAPU ? currentAPU.quantity : 1

    // ============ FUNCIONES DE CÁLCULO SEGÚN MODO ============
    const getInsumoTotal = (insumo: InsumoDetalle, type: string): number => {
        if (isAPG) {
            if (type === "equipment" || type === "labor") {
                const cantidadTotal = multiplier / insumo.rendimiento
                if (type === "equipment") {
                    return cantidadTotal * insumo.costo
                } else {
                    const prestaciones = insumo.prestaciones || 0
                    const rateWithBenefits = insumo.costo * (1 + prestaciones / 100)
                    return cantidadTotal * rateWithBenefits
                }
            } else {
                // Materiales y Transporte
                return insumo.total * multiplier
            }
        } else {
            // APU: total unitario
            return insumo.total
        }
    }

    const getInsumoCantidad = (insumo: InsumoDetalle, type: string): number => {
        if (isAPG) {
            if (type === "equipment" || type === "labor") {
                return multiplier / insumo.rendimiento
            } else {
                return insumo.cantidad * multiplier
            }
        } else {
            return insumo.cantidad
        }
    }

    // ============ RENDERIZACIÓN DE INSUMOS POR CATEGORÍA ============
    const renderMaterialRow = (insumo: InsumoDetalle) => {
        const quantity = getInsumoCantidad(insumo, "material")
        const total = getInsumoTotal(insumo, "material")
        return (
            <div key={insumo.id_producto} className="grid grid-cols-6 gap-3 py-2 border-b border-green-100 last:border-b-0">
                <div className="text-left">  {/* ← alinear a la izquierda */}
                    <p className="text-sm text-green-900 font-medium">{insumo.producto.nombre}</p>
                </div>
                <div className="text-center">  {/* ← centrado */}
                    <p className="text-sm text-green-700">{insumo.producto.unidad_medida}</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-green-700">{Number(quantity).toFixed(2)}</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-green-700">{insumo.desperdicio}%</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-green-700">{formatPrice(insumo.costo)}</p>
                </div>
                <div className="text-right">
                    <p className="text-sm font-semibold text-green-900">{formatPrice(total)}</p>
                </div>
            </div>
        )
    }

    const renderEquipmentRow = (insumo: InsumoDetalle) => {
        const cantidadTotal = getInsumoCantidad(insumo, "equipment")
        const total = getInsumoTotal(insumo, "equipment")
        return (
            <div key={insumo.id_producto} className="grid grid-cols-5 gap-3 py-2 border-b border-green-100 last:border-b-0">
                <div className="text-left">
                    <p className="text-sm text-green-900 font-medium">{insumo.producto.nombre}</p>
                </div>
                <div className="text-center">
                    <p className="text-sm text-green-700">{insumo.producto.unidad_medida}</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-green-700">{formatPrice(insumo.costo)}</p>
                </div>
                <div className="text-right">
                    {isAPG ? (
                        <p className="text-sm text-green-700">{Number(cantidadTotal).toFixed(2)}</p>
                    ) : (
                        <p className="text-sm text-green-700">{insumo.rendimiento}%</p>
                    )}
                </div>
                <div className="text-right">
                    <p className="text-sm font-semibold text-green-900">{formatPrice(total)}</p>
                </div>
            </div>
        )
    }

    const renderLaborRow = (insumo: InsumoDetalle) => {
        const prestaciones = insumo.prestaciones || 0
        const rateWithBenefits = insumo.costo * (1 + prestaciones / 100)
        const cantidadTotal = getInsumoCantidad(insumo, "labor")
        const total = getInsumoTotal(insumo, "labor")
        return (
            <div key={insumo.id_producto} className="grid grid-cols-6 gap-2 py-2 border-b border-green-100 last:border-b-0">
                <div className="text-left">
                    <p className="text-sm text-green-900 font-medium">{insumo.producto.nombre}</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-green-700">{formatPrice(insumo.costo)}</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-green-700">{prestaciones}%</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-green-700">{formatPrice(rateWithBenefits)}</p>
                </div>
                <div className="text-right">
                    {isAPG ? (
                        <p className="text-sm text-green-700">{Number(cantidadTotal).toFixed(2)}</p>
                    ) : (
                        <p className="text-sm text-green-700">{insumo.rendimiento}%</p>
                    )}
                </div>
                <div className="text-right">
                    <p className="text-sm font-semibold text-green-900">{formatPrice(total)}</p>
                </div>
            </div>
        )
    }

    const renderTransportRow = (insumo: InsumoDetalle) => {
        const quantity = getInsumoCantidad(insumo, "transport")
        const total = getInsumoTotal(insumo, "transport")
        return (
            <div key={insumo.id_producto} className="grid grid-cols-7 gap-3 py-2 border-b border-green-100 last:border-b-0">
                <div className="text-left">
                    <p className="text-sm text-green-900 font-medium">{insumo.producto.nombre}</p>
                </div>
                <div className="text-center">
                    <p className="text-sm text-green-700">{insumo.producto.unidad_medida}</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-green-700">{formatPrice(insumo.costo)}</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-green-700">{Number(quantity).toFixed(2)}</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-green-700">{insumo.distancia ? insumo.distancia + " km" : "N/A"}</p>
                </div>
                <div className="text-right">
                    <p className="text-sm font-semibold text-green-900">{formatPrice(total)}</p>
                </div>
            </div>
        )
    }

    const renderCategory = (
        title: string,
        icon: React.ReactNode,
        insumos: InsumoDetalle[],
        type: "material" | "equipment" | "labor" | "transport"
    ) => {
        if (!insumos || insumos.length === 0) return null

        const subtotal = insumos.reduce((sum, item) => sum + getInsumoTotal(item, type), 0)

        let renderFunction
        let headerCols
        let headers

        switch (type) {
            case "material":
                renderFunction = renderMaterialRow
                headerCols = "grid-cols-6"
                headers = ["Descripción", "Unidad", "Cantidad Total", "% Desperdicio", "P. Unitario", "Total"]
                break
            case "equipment":
                renderFunction = renderEquipmentRow
                headerCols = "grid-cols-5"
                headers = isAPG
                    ? ["Descripción", "Unidad", "Tarifa", "Cantidad Total", "Total"]
                    : ["Descripción", "Unidad", "Tarifa", "Rendimiento", "Total"]
                break
            case "labor":
                renderFunction = renderLaborRow
                headerCols = "grid-cols-6"
                headers = isAPG
                    ? ["Descripción", "Jornal", "%Prest.", "Jornal+Prest.", "Cantidad Total", "Total"]
                    : ["Descripción", "Jornal", "%Prest.", "Jornal+Prest.", "Rend/Día", "Total"]
                break
            case "transport":
                renderFunction = renderTransportRow
                headerCols = "grid-cols-7"
                headers = ["Descripción", "Unidad", "Tarifa", "Cantidad Total", "Distancia", "Total"]
                break
            default:
                return null
        }

        return (
            <div key={title} className="space-y-2">
                <div className="flex items-center gap-2 bg-green-50 p-3 rounded-md border border-green-200">
                    {icon}
                    <h4 className="font-semibold text-green-900">{title}</h4>
                    <div className="ml-auto text-sm font-semibold text-green-900">
                        Subtotal: {formatPrice(subtotal)}
                    </div>
                </div>
                <div className="px-3 space-y-0">
                    <div
                        className={`grid ${headerCols} gap-3 py-2 bg-green-50/50 font-semibold text-xs text-green-700 uppercase tracking-wide`}
                    >
                        {headers.map((header, idx) => (
                            <div
                                key={idx}
                                className={
                                    idx === 0
                                        ? "text-left"
                                        : idx === 1
                                        ? "text-center"
                                        : "text-right"
                                }
                            >
                                {header}
                            </div>
                        ))}
                    </div>
                    {insumos.map((item) => renderFunction(item))}
                </div>
            </div>
        )
    }

    // ============ RENDER PRINCIPAL ============
    if (loadingBudget) {
        return (
            <div className="flex flex-1 items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-10 w-10 animate-spin text-green-600" />
                    <p className="text-green-700 text-sm">Cargando {isAPG ? "APGs" : "APUs"}...</p>
                </div>
            </div>
        )
    }

    if (error || !budget || apus.length === 0) {
        return (
            <div className="p-6">
                <Card className="border-red-200">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Calculator className="h-12 w-12 text-red-400 mb-4" />
                        <h3 className="text-lg font-medium text-red-900 mb-2">No se encontraron {isAPG ? "APGs" : "APUs"}</h3>
                        <p className="text-red-600 text-center mb-4">
                            {error || `Este presupuesto no tiene ${isAPG ? "APGs" : "APUs"} asociados.`}
                        </p>
                        <Link href={`/budgets/${budgetId}`}>
                            <Button className="bg-green-600 hover:bg-green-700 text-white">Volver al Presupuesto</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (!currentAPU) {
        return <div>No hay {isAPG ? "APG" : "APU"} seleccionado</div>
    }

    // Clasificar insumos del detalle actual
    const detalles = currentAPUDetail?.detalles || []
    const materiales = detalles.filter((d) => d.producto.tipo_producto === 0)
    const equipos = detalles.filter((d) => d.producto.tipo_producto === 1)
    const manoObra = detalles.filter((d) => d.producto.tipo_producto === 2)
    const transportes = detalles.filter((d) => d.producto.tipo_producto === 3)

    // Total del APU (unitario o global según lo que el usuario quiera mostrar)
    // Actualmente se muestra el unitario, pero si se quiere global, usar currentAPU.total * currentAPU.quantity
    const apuTotal = currentAPU.total // unitario
    const indirectAdmin = apuTotal * (adminPct / 100)
    const indirectContingency = apuTotal * (contingencyPct / 100)
    const indirectProfit = apuTotal * (profitPct / 100)
    const totalWithIndirects = apuTotal + indirectAdmin + indirectContingency + indirectProfit

    const pageTitle = isAPG ? "Análisis de Precios Globales (APG)" : "Análisis de Precios Unitarios (APU)"

    return (
        <>
            {/* Header */}
            <header className="flex h-16 shrink-0 items-center gap-2 border-b border-green-100 px-4 bg-gradient-to-r from-green-50 to-white">
                <SidebarTrigger className="-ml-1 text-green-600 hover:bg-green-100" />
                <div className="flex flex-1 items-center gap-4">
                    <Link href={`/budgets/${budgetId}`}>
                        <Button variant="outline" size="icon" className="h-8 w-8 border-green-200 bg-transparent">
                            <ArrowLeft className="h-4 w-4 text-green-600" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-lg font-semibold text-green-900">{pageTitle}</h1>
                        <p className="text-sm text-green-600">{budget.nombre}</p>
                    </div>
                </div>
            </header>

            {/* Main Content - Two Column Layout */}
            <main className="flex-1 flex h-[calc(100vh-64px)] bg-gradient-to-br from-green-50/30 to-white">
                {/* Left Section - APU/APG Detail (70%) */}
                <div className="flex-1 overflow-y-auto border-r border-green-200">
                    {loadingDetail ? (
                        <div className="flex items-center justify-center h-full">
                            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
                        </div>
                    ) : (
                        <div className="p-6 space-y-6">
                            <Card className="border-green-200 bg-white">
                                <CardContent className="p-6 space-y-4">
                                    <div className="pb-4 border-b border-green-200">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <Badge className="bg-green-100 text-green-800 mb-2">{currentAPU.code}</Badge>
                                                <h2 className="text-2xl font-bold text-green-900">{currentAPU.name}</h2>
                                                <p className="text-sm text-green-600 mt-1">{currentAPU.activityType}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="border-green-200 text-green-700 hover:bg-green-50"
                                                >
                                                    <Edit2 className="h-4 w-4 mr-1" />
                                                    Editar
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-3">
                                            <div>
                                                <p className="text-xs text-green-600 font-semibold uppercase">Presupuesto</p>
                                                <p className="text-sm font-semibold text-green-900">{budget.nombre}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-green-600 font-semibold uppercase">Empresa</p>
                                                <p className="text-sm font-semibold text-green-900">
                                                    {budget.proyecto_info?.cliente_nombre || "Sin cliente"}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <div>
                                                <p className="text-xs text-green-600 font-semibold uppercase">Ubicación</p>
                                                <p className="text-sm font-semibold text-green-900 flex items-center gap-1">
                                                    <MapPin className="h-3 w-3" />
                                                    {budget.proyecto_info?.ubicacion || "No especificada"}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-green-600 font-semibold uppercase">Fecha</p>
                                                <p className="text-sm font-semibold text-green-900">
                                                    {new Date(budget.created_at).toLocaleDateString("es-CL", {
                                                        year: "numeric",
                                                        month: "long",
                                                        day: "numeric",
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <Separator className="bg-green-200" />

                                    <div className="grid grid-cols-4 gap-3">
                                        <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                                            <p className="text-xs text-green-600 font-semibold uppercase tracking-wide">Unidad</p>
                                            <p className="text-lg font-bold text-green-900 mt-1">{currentAPU.unit}</p>
                                        </div>
                                        <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                                            <p className="text-xs text-green-600 font-semibold uppercase tracking-wide">Cantidad</p>
                                            <p className="text-lg font-bold text-green-900 mt-1">{currentAPU.quantity.toLocaleString()}</p>
                                        </div>
                                        <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                                            <p className="text-xs text-green-600 font-semibold uppercase tracking-wide">V. Unitario</p>
                                            <p className="text-sm font-bold text-green-900 mt-1">{formatPrice(currentAPU.unitPrice)}</p>
                                        </div>
                                        <div className="bg-green-100 p-3 rounded-lg border border-green-300">
                                            <p className="text-xs text-green-700 font-semibold uppercase tracking-wide">V. Total</p>
                                            <p className="text-lg font-bold text-green-900 mt-1">{formatPrice(apuTotal)}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-green-200 bg-white">
                                <CardHeader>
                                    <CardTitle className="text-green-900 flex items-center gap-2">
                                        <Calculator className="h-5 w-5 text-green-600" />
                                        Detalle de Insumos
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {renderCategory("Materiales", <Package className="h-4 w-4 text-blue-600" />, materiales, "material")}
                                    {renderCategory("Equipos", <Wrench className="h-4 w-4 text-orange-600" />, equipos, "equipment")}
                                    {renderCategory("Mano de Obra", <HardHat className="h-4 w-4 text-red-600" />, manoObra, "labor")}
                                    {renderCategory("Transporte", <Truck className="h-4 w-4 text-purple-600" />, transportes, "transport")}
                                </CardContent>
                            </Card>

                            <Card className="border-green-200 bg-white">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-green-900">Costos Indirectos</CardTitle>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setShowIndirectCosts(!showIndirectCosts)}
                                            className="border-green-200 text-green-700 hover:bg-green-50"
                                        >
                                            {showIndirectCosts ? "Ocultar" : "Mostrar"}
                                        </Button>
                                    </div>
                                </CardHeader>
                                {showIndirectCosts && (
                                    <CardContent className="space-y-4">
                                        <div className="space-y-3">
                                            <div className="grid grid-cols-3 gap-4">
                                                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <p className="text-xs text-amber-700 font-semibold uppercase">Administración</p>
                                                        <Badge className="bg-amber-100 text-amber-800">{adminPct}%</Badge>
                                                    </div>
                                                    <p className="text-lg font-bold text-amber-900">{formatPrice(indirectAdmin)}</p>
                                                </div>
                                                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <p className="text-xs text-orange-700 font-semibold uppercase">Imprevistos</p>
                                                        <Badge className="bg-orange-100 text-orange-800">{contingencyPct}%</Badge>
                                                    </div>
                                                    <p className="text-lg font-bold text-orange-900">{formatPrice(indirectContingency)}</p>
                                                </div>
                                                <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <p className="text-xs text-emerald-700 font-semibold uppercase">Utilidad</p>
                                                        <Badge className="bg-emerald-100 text-emerald-800">{profitPct}%</Badge>
                                                    </div>
                                                    <p className="text-lg font-bold text-emerald-900">{formatPrice(indirectProfit)}</p>
                                                </div>
                                            </div>
                                            <Separator className="bg-green-200" />
                                            <div className="bg-green-50 p-4 rounded-lg border border-green-300">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm font-semibold text-green-700 uppercase">Total con Costos Indirectos</p>
                                                    <p className="text-xl font-bold text-green-900">{formatPrice(totalWithIndirects)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                )}
                            </Card>
                        </div>
                    )}
                </div>

                {/* Right Section - Activities Navigation (30%) */}
                <div className="w-80 border-l border-green-200 bg-white flex flex-col overflow-hidden">
                    <div className="border-b border-green-200 p-4 bg-green-50 space-y-3">
                        <div>
                            <h3 className="font-semibold text-green-900 mb-2">Actividades del Presupuesto</h3>
                            <p className="text-xs text-green-600">
                                {currentIndex + 1} de {apus.length}
                            </p>
                        </div>

                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
                            <input
                                type="text"
                                placeholder="Buscar actividad..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-8 py-2 text-sm border border-green-200 rounded-lg bg-white text-green-900 placeholder-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-green-500 hover:text-green-700"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        <div className="p-3 space-y-2">
                            {filteredApus.map((apu) => {
                                const originalIndex = apus.findIndex((a) => a.id === apu.id)
                                return (
                                    <button
                                        key={apu.id}
                                        onClick={() => {
                                            setCurrentIndex(originalIndex)
                                            loadAPUDetail(apu.apuId)
                                        }}
                                        className={`w-full text-left p-3 rounded-lg border-2 transition-all ${originalIndex === currentIndex
                                                ? "border-green-500 bg-green-50"
                                                : "border-green-100 bg-white hover:border-green-300"
                                            }`}
                                    >
                                        <p className="text-xs text-green-600 font-semibold uppercase">{apu.code}</p>
                                        <p className="text-sm font-semibold text-green-900 truncate mt-1">{apu.name}</p>
                                        <p className="text-xs text-green-700 mt-1">
                                            {apu.quantity} {apu.unit}
                                        </p>
                                        <p className="text-sm font-bold text-green-900 mt-1">
                                            {formatPrice(apu.total)}
                                        </p>
                                    </button>
                                )
                            })}
                            {filteredApus.length === 0 && (
                                <div className="text-center text-green-600 py-8">No hay actividades que coincidan</div>
                            )}
                        </div>
                    </div>

                    <div className="border-t border-green-200 p-4 space-y-2 bg-green-50">
                        <div className="flex gap-2">
                            <Button
                                onClick={handlePrevious}
                                variant="outline"
                                className="flex-1 border-green-200 text-green-700 hover:bg-green-100"
                                disabled={apus.length === 0}
                            >
                                <ChevronLeft className="h-4 w-4 mr-1" />
                                Anterior
                            </Button>
                            <Button
                                onClick={handleNext}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                disabled={apus.length === 0}
                            >
                                Siguiente
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </div>
                        <Button
                            onClick={() => window.print()}
                            variant="outline"
                            className="w-full border-green-200 text-green-700 hover:bg-green-100"
                        >
                            <Printer className="h-4 w-4 mr-2" />
                            Imprimir Todo
                        </Button>
                        <Button
                            onClick={() => {
                                // Exportar a CSV (con valores según modo)
                                let csvContent = "data:text/csv;charset=utf-8,Código,Nombre,Unidad,Cantidad,V. Unitario,V. Total\n"
                                apus.forEach((apu) => {
                                    const total = isAPG ? apu.total * apu.quantity : apu.total
                                    csvContent += `${apu.code},${apu.name},${apu.unit},${apu.quantity},${apu.unitPrice},${total}\n`
                                })
                                const encodedUri = encodeURI(csvContent)
                                const link = document.createElement("a")
                                link.setAttribute("href", encodedUri)
                                link.setAttribute("download", `${isAPG ? "APGs" : "APUs"}_${budget.nombre}_${new Date().toISOString().split("T")[0]}.csv`)
                                document.body.appendChild(link)
                                link.click()
                                document.body.removeChild(link)
                            }}
                            variant="outline"
                            className="w-full border-green-200 text-green-700 hover:bg-green-100"
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Exportar a Excel
                        </Button>
                        <Button
                            asChild
                            variant="outline"
                            className="w-full border-green-200 text-green-700 hover:bg-green-50"
                        >
                            <Link href={`/budgets/${budgetId}`}>Volver a Presupuesto</Link>
                        </Button>
                    </div>
                </div>
            </main>
        </>
    )
}