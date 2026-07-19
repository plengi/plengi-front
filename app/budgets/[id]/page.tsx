"use client"

import { useState, useEffect } from "react"
import {
    ArrowLeft,
    Calculator,
    Building2,
    MapPin,
    Calendar,
    DollarSign,
    Percent,
    FileText,
    Edit,
    Download,
    Printer,
    Share,
    Clock,
    Package,
    Layers,
    Loader2,
} from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import apiClient from "@/app/api/apiClient"

const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("es-CL", {
        style: "currency",
        currency: "CLP",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(price)
}

interface Seccion {
    id: number
    id_budget: number
    nombre: string
    descripcion: string
    orden: number
}

interface ApuFormateado {
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
    updated_at: string
    secciones: Seccion[]
    apus_formateados: ApuFormateado[]
    proyecto_info: ProyectoInfo | null
}

const getEstadoColor = (estado: string) => {
    switch (estado) {
        case "aprobado": return "bg-green-100 text-green-800 border-green-300"
        case "en_progreso": return "bg-blue-100 text-blue-800 border-blue-300"
        case "en_revision": return "bg-yellow-100 text-yellow-800 border-yellow-300"
        case "planificacion": return "bg-gray-100 text-gray-800 border-gray-300"
        case "completado": return "bg-purple-100 text-purple-800 border-purple-300"
        default: return "bg-gray-100 text-gray-800 border-gray-300"
    }
}

const formatEstado = (estado: string) => {
    const map: Record<string, string> = {
        planificacion: "Planificación",
        en_progreso: "En Progreso",
        en_revision: "En Revisión",
        aprobado: "Aprobado",
        completado: "Completado",
    }
    return map[estado] ?? estado
}

interface BudgetDetailPageProps {
    params: { id: string }
}

export default function BudgetDetailPage({ params }: BudgetDetailPageProps) {
    const { id } = params
    const [budget, setBudget] = useState<Budget | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchBudget = async () => {
            try {
                setLoading(true)
                setError(null)
                const response = await apiClient.get("/budgets-find", {
                    params: { id_budget: id },
                })
                if (response.data.success) {
                    setBudget(response.data.data)
                } else {
                    setError(response.data.message || "Error al cargar el presupuesto")
                }
            } catch (err: any) {
                setError(err?.response?.data?.message || "No se pudo cargar el presupuesto")
            } finally {
                setLoading(false)
            }
        }
        fetchBudget()
    }, [id])

    if (loading) {
        return (
            <div className="flex flex-1 items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-10 w-10 animate-spin text-green-600" />
                    <p className="text-green-700 text-sm">Cargando presupuesto...</p>
                </div>
            </div>
        )
    }

    if (error || !budget) {
        return (
            <div className="container mx-auto py-8">
                <Card className="border-red-200">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Calculator className="h-12 w-12 text-red-400 mb-4" />
                        <h3 className="text-lg font-medium text-red-900 mb-2">Presupuesto no encontrado</h3>
                        <p className="text-red-600 text-center mb-4">
                            {error || "El presupuesto solicitado no existe o ha sido eliminado."}
                        </p>
                        <Link href="/budgets">
                            <Button className="bg-green-600 hover:bg-green-700 text-white">Volver a Presupuestos</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const directTotal = parseFloat(budget.costo_directo_total)
    const adminAmount = parseFloat(budget.costo_indirecto_administracion)
    const contingencyAmount = parseFloat(budget.costo_indirecto_imprevistos)
    const profitAmount = parseFloat(budget.costo_indirecto_utilidad)
    const indirectTotal = adminAmount + contingencyAmount + profitAmount
    const grandTotal = parseFloat(budget.presupuesto_total)

    const adminPct = directTotal > 0 ? Math.round((adminAmount / directTotal) * 100) : 0
    const contingencyPct = directTotal > 0 ? Math.round((contingencyAmount / directTotal) * 100) : 0
    const profitPct = directTotal > 0 ? Math.round((profitAmount / directTotal) * 100) : 0

    const indirectCosts = [
        { id: "administration", name: "Administración", percentage: adminPct, amount: adminAmount },
        { id: "contingency", name: "Imprevistos", percentage: contingencyPct, amount: contingencyAmount },
        { id: "profit", name: "Utilidad", percentage: profitPct, amount: profitAmount },
    ]

    const apusBySection = (budget.secciones || [])
        .sort((a, b) => a.orden - b.orden)
        .map((section) => {
            const apus = (budget.apus_formateados || []).filter((apu) => apu.sectionId === section.id)
            const total = apus.reduce((sum, apu) => sum + apu.total, 0)
            return { section, apus, total }
        })

    const proyecto = budget.proyecto_info

    return (
        <>
            {/* Header */}
            <header className="flex h-auto shrink-0 flex-col border-b border-green-100 bg-gradient-to-r from-green-50 to-white">
                <div className="flex h-16 items-center gap-2 px-4">
                    <SidebarTrigger className="-ml-1 text-green-600 hover:bg-green-100" />
                    <div className="flex flex-1 items-center gap-4">
                        <Link href="/budgets">
                            <Button variant="outline" size="icon" className="h-8 w-8 border-green-200 bg-transparent">
                                <ArrowLeft className="h-4 w-4 text-green-600" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-lg font-semibold text-green-900">{budget.nombre}</h1>
                            <p className="text-sm text-green-600">
                                {proyecto?.nombre ?? "Sin proyecto asociado"}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href={`/budgets/edit/${budget.id}`}>
                            <Button variant="outline" size="sm" className="border-green-200 text-green-700 hover:bg-green-50 bg-transparent">
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                            </Button>
                        </Link>
                        <Link href={`/budgets/${budget.id}/schedule`}>
                            <Button variant="outline" size="sm" className="border-green-200 text-green-700 hover:bg-green-50 bg-transparent">
                                <Clock className="h-4 w-4 mr-2" />
                                Ver Cronograma
                            </Button>
                        </Link>
                        <Button variant="outline" size="sm" className="border-green-200 text-green-700 hover:bg-green-50 bg-transparent">
                            <Download className="h-4 w-4 mr-2" />
                            Exportar
                        </Button>
                        <Button variant="outline" size="sm" className="border-green-200 text-green-700 hover:bg-green-50 bg-transparent">
                            <Printer className="h-4 w-4 mr-2" />
                            Imprimir
                        </Button>
                        <Button variant="outline" size="sm" className="border-green-200 text-green-700 hover:bg-green-50 bg-transparent">
                            <Share className="h-4 w-4 mr-2" />
                            Compartir
                        </Button>
                    </div>
                </div>

                <div className="flex items-center gap-2 border-t border-green-100 px-4 py-3 bg-green-50/50">
                    <Link href={`/budgets/${budget.id}/apus`} className="flex-1 sm:flex-none">
                        <Button className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white gap-2">
                            <Layers className="h-4 w-4" />
                            Ver APUs
                        </Button>
                    </Link>
                    <Link href={`/budgets/${budget.id}/apus?mode=apg`} className="flex-1 sm:flex-none">
                        <Button className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white gap-2">
                            <Layers className="h-4 w-4" />
                            Ver APGs
                        </Button>
                    </Link>
                    <Link href={`/budgets/${budget.id}/supplies`} className="flex-1 sm:flex-none">
                        <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white gap-2">
                            <Package className="h-4 w-4" />
                            Ver Insumos
                        </Button>
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 space-y-6 p-6 bg-gradient-to-br from-green-50/30 to-white">

                {/* Título */}
                <div className="bg-white rounded-lg border border-green-200 p-6 text-center">
                    <h2 className="text-3xl font-bold text-green-900 tracking-wide">PRESUPUESTO DE OBRA</h2>
                    <p className="text-sm text-green-600 mt-1">Detalle de costos y actividades</p>
                </div>

                {/* Info unificada */}
                <Card className="border-green-200 bg-white">
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                            {/* Cliente */}
                            <div className="flex flex-col gap-2 border-r border-green-100 pr-6">
                                <h3 className="text-xs font-semibold text-green-600 uppercase tracking-wide">
                                    Empresa / Cliente
                                </h3>
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                                        <Building2 className="h-5 w-5 text-green-600" />
                                    </div>
                                    <p className="text-sm font-semibold text-green-900">
                                        {proyecto?.cliente_nombre ?? "Sin cliente"}
                                    </p>
                                </div>
                            </div>

                            {/* Proyecto */}
                            <div className="flex flex-col gap-2 border-r border-green-100 pr-6">
                                <h3 className="text-xs font-semibold text-green-600 uppercase tracking-wide">
                                    Proyecto
                                </h3>
                                {proyecto ? (
                                    <div className="space-y-1">
                                        <p className="text-sm font-semibold text-green-900">{proyecto.nombre}</p>
                                        {proyecto.ubicacion && (
                                            <p className="text-xs text-green-600 flex items-center gap-1">
                                                <MapPin className="h-3 w-3" />
                                                {proyecto.ubicacion}
                                            </p>
                                        )}
                                        <Badge className={getEstadoColor(proyecto.estado)} variant="outline">
                                            {formatEstado(proyecto.estado)}
                                        </Badge>
                                    </div>
                                ) : (
                                    <p className="text-sm text-green-600 italic">Sin proyecto asociado</p>
                                )}
                            </div>

                            {/* Presupuesto */}
                            <div className="flex flex-col gap-2">
                                <h3 className="text-xs font-semibold text-green-600 uppercase tracking-wide">
                                    Presupuesto
                                </h3>
                                <p className="text-sm font-semibold text-green-900">{budget.nombre}</p>
                                <p className="text-xs text-green-600 flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(budget.created_at).toLocaleDateString("es-ES")}
                                </p>
                                {budget.descripcion && (
                                    <p className="text-xs text-green-500">{budget.descripcion}</p>
                                )}
                            </div>

                        </div>
                    </CardContent>
                </Card>

                {/* APUs por sección */}
                <Card className="border-green-200">
                    <CardHeader>
                        <CardTitle className="text-green-900 flex items-center gap-2">
                            <Calculator className="h-5 w-5 text-green-600" />
                            Análisis de Precios Unitarios (APUs)
                        </CardTitle>
                        <CardDescription className="text-green-600">
                            APUs organizados por secciones con cantidades y totales
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {apusBySection.every(({ apus }) => apus.length === 0) ? (
                            <div className="text-center py-8 text-green-600">
                                <p>No hay APUs registrados en este presupuesto.</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {apusBySection.map(({ section, apus, total }) => {
                                    if (apus.length === 0) return null
                                    return (
                                        <div key={section.id} className="border border-green-100 rounded-lg overflow-hidden">
                                            <div className="bg-green-100 px-4 py-3 border-b border-green-200">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h5 className="font-semibold text-green-800">{section.nombre}</h5>
                                                        {section.descripcion && (
                                                            <p className="text-sm text-green-600">{section.descripcion}</p>
                                                        )}
                                                    </div>
                                                    <div className="text-green-700 font-medium">Subtotal: {formatPrice(total)}</div>
                                                </div>
                                            </div>
                                            <Table>
                                                <TableHeader>
                                                    <TableRow className="bg-green-50">
                                                        <TableHead className="text-green-800">Código</TableHead>
                                                        <TableHead className="text-green-800">APU</TableHead>
                                                        <TableHead className="text-green-800">Unidad</TableHead>
                                                        <TableHead className="text-green-800">Precio Unit.</TableHead>
                                                        <TableHead className="text-green-800">Cantidad</TableHead>
                                                        <TableHead className="text-green-800">Total</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {apus.map((apu) => (
                                                        <TableRow key={apu.id} className="hover:bg-green-50/50">
                                                            <TableCell className="font-medium text-green-900">{apu.code}</TableCell>
                                                            <TableCell>
                                                                <div className="font-medium text-green-900">{apu.name}</div>
                                                                <div className="text-xs text-green-600">{apu.activityType}</div>
                                                            </TableCell>
                                                            <TableCell>{apu.unit}</TableCell>
                                                            <TableCell>{formatPrice(apu.unitPrice)}</TableCell>
                                                            <TableCell className="font-medium">{Number(apu.quantity).toLocaleString()}</TableCell>
                                                            <TableCell className="font-medium text-green-900">{formatPrice(apu.total)}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Costos Indirectos */}
                <Card className="border-green-200">
                    <CardHeader className="py-3 px-4">
                        <CardTitle className="text-green-900 flex items-center gap-2 text-sm">
                            <Percent className="h-4 w-4 text-green-600" />
                            Costos Indirectos
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-3">
                        <div className="space-y-1">
                            {indirectCosts.map((cost) => (
                                <div key={cost.id} className="flex items-center justify-between py-2 px-3 border border-green-100 rounded bg-green-50/30">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-green-900">{cost.name}</span>
                                        <span className="text-xs text-green-500">({cost.percentage}%)</span>
                                    </div>
                                    <span className="text-sm font-medium text-green-900">{formatPrice(cost.amount)}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Resumen de totales */}
                <Card className="border-green-200 bg-gradient-to-br from-green-50/50 to-white">
                    <CardHeader className="py-3 px-4">
                        <CardTitle className="text-green-900 flex items-center gap-2 text-sm">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            Resumen del Presupuesto
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-3">
                        <div className="space-y-1">
                            <div className="flex justify-between items-center py-2 px-3 border-b border-green-100">
                                <span className="text-sm font-medium text-green-800">Costo Directo Total</span>
                                <span className="text-sm font-semibold text-green-900">{formatPrice(directTotal)}</span>
                            </div>
                            {indirectCosts.map((cost) => (
                                <div key={cost.id} className="flex justify-between items-center py-1 px-3">
                                    <span className="text-sm text-green-700">{cost.name} ({cost.percentage}%)</span>
                                    <span className="text-sm font-medium text-green-800">{formatPrice(cost.amount)}</span>
                                </div>
                            ))}
                            <Separator className="bg-green-200 my-1" />
                            <div className="flex justify-between items-center py-1 px-3">
                                <span className="text-sm font-medium text-green-800">Total Costos Indirectos</span>
                                <span className="text-sm font-semibold text-green-900">{formatPrice(indirectTotal)}</span>
                            </div>
                            <Separator className="bg-green-300 my-1" />
                            <div className="flex justify-between items-center py-2 px-3 bg-green-100 rounded-lg">
                                <span className="text-base font-bold text-green-900">TOTAL PRESUPUESTO</span>
                                <span className="text-lg font-bold text-green-900">{formatPrice(grandTotal)}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

            </main>
        </>
    )
}