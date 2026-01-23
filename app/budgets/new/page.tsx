"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Calculator,
  Plus,
  Search,
  Trash2,
  BarChart3,
  Package,
  Percent,
  DollarSign,
  FolderPlus,
  Edit,
  Check,
  ChevronUp,
  ChevronDown,
  GripVertical,
  MoveVertical,
  Loader,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import apiClient from "@/app/api/apiClient"

// Función para formatear precios
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

// Tipos de datos basados en tu backend
interface BudgetAPU {
  id: string
  apuId: number
  name: string
  code: string
  unit: string
  unitPrice: number
  quantity: number
  total: number
  sectionId: string
  activityType: string
  order: number
  description?: string
}

interface BudgetSection {
  id: string
  name: string
  description?: string
  order: number
}

interface IndirectCost {
  id: string
  name: string
  percentage: number
  amount: number
}

interface BudgetData {
  name: string
  description: string
  project: string
  client: string
  sections: BudgetSection[]
  apus: BudgetAPU[]
  indirectCosts: IndirectCost[]
  directTotal: number
  indirectTotal: number
  grandTotal: number
}

// Tipo para la respuesta de la API de APUs
interface ApiApu {
  id: number
  codigo: string
  nombre: string
  descripcion?: string
  tipo_actividad: string
  unidad_medida: string
  valor_total: number
  detalles?: any[]
}

// Componente para agregar nueva sección
function NewSectionDialog({ onAddSection }: { onAddSection: (section: BudgetSection) => void }) {
  const [open, setOpen] = useState(false)
  const [sectionData, setSectionData] = useState({
    name: "",
    description: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!sectionData.name.trim()) {
      alert("El nombre de la sección es obligatorio")
      return
    }

    const newSection: BudgetSection = {
      id: `section-${Date.now()}`,
      name: sectionData.name,
      description: sectionData.description,
      order: Date.now(),
    }

    onAddSection(newSection)
    setSectionData({ name: "", description: "" })
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 border-green-300 text-green-700 hover:bg-green-50 bg-transparent">
          <FolderPlus className="h-4 w-4" />
          Nueva Sección
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-green-900">Crear Nueva Sección</DialogTitle>
          <DialogDescription className="text-green-600">
            Las secciones te permiten organizar los APUs por etapas o categorías.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="section-name" className="text-green-800">
              Nombre de la Sección *
            </Label>
            <Input
              id="section-name"
              placeholder="Ej: Obras Preliminares, Estructura, Acabados"
              value={sectionData.name}
              onChange={(e) => setSectionData({ ...sectionData, name: e.target.value })}
              className="border-green-200 focus:border-green-400 focus:ring-green-400"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="section-description" className="text-green-800">
              Descripción
            </Label>
            <Input
              id="section-description"
              placeholder="Descripción opcional de la sección"
              value={sectionData.description}
              onChange={(e) => setSectionData({ ...sectionData, description: e.target.value })}
              className="border-green-200 focus:border-green-400 focus:ring-green-400"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-green-300 text-green-700 hover:bg-green-50"
            >
              Cancelar
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">
              Crear Sección
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Componente para editar sección
function EditSectionDialog({
  section,
  onUpdateSection,
  onDeleteSection,
}: {
  section: BudgetSection
  onUpdateSection: (sectionId: string, updates: Partial<BudgetSection>) => void
  onDeleteSection: (sectionId: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [sectionData, setSectionData] = useState({
    name: section.name,
    description: section.description || "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!sectionData.name.trim()) {
      alert("El nombre de la sección es obligatorio")
      return
    }

    onUpdateSection(section.id, {
      name: sectionData.name,
      description: sectionData.description,
    })
    setOpen(false)
  }

  const handleDelete = () => {
    if (
      confirm("¿Estás seguro de que quieres eliminar esta sección? Los APUs se moverán a la sección 'Preliminares'.")
    ) {
      onDeleteSection(section.id)
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Edit className="h-4 w-4 text-green-600" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-green-900">Editar Sección</DialogTitle>
          <DialogDescription className="text-green-600">
            Modifica los datos de la sección o elimínala si ya no la necesitas.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-section-name" className="text-green-800">
              Nombre de la Sección *
            </Label>
            <Input
              id="edit-section-name"
              value={sectionData.name}
              onChange={(e) => setSectionData({ ...sectionData, name: e.target.value })}
              className="border-green-200 focus:border-green-400 focus:ring-green-400"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-section-description" className="text-green-800">
              Descripción
            </Label>
            <Input
              id="edit-section-description"
              value={sectionData.description}
              onChange={(e) => setSectionData({ ...sectionData, description: e.target.value })}
              className="border-green-200 focus:border-green-400 focus:ring-green-400"
            />
          </div>
          <DialogFooter className="flex justify-between">
            <Button type="button" variant="destructive" onClick={handleDelete} disabled={section.id === "preliminares"}>
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar
            </Button>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="border-green-300 text-green-700 hover:bg-green-50"
              >
                Cancelar
              </Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">
                Guardar
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function NewBudgetPage() {
  const router = useRouter()
  const { toast } = useToast()
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

  // Estado del presupuesto
  const [budgetData, setBudgetData] = useState<BudgetData>({
    name: "",
    description: "",
    project: "",
    client: "",
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
  })

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

  // Efecto para buscar APUs cuando cambia el término de búsqueda
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

  // Filtrar APUs disponibles
  const filteredAPUs = availableAPUs.filter(
    (apu) =>
      apu.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apu.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apu.tipo_actividad.toLowerCase().includes(searchTerm.toLowerCase()),
  )

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
    setBudgetData((prev) => ({
      ...prev,
      sections: [...prev.sections, section],
    }))
    // Seleccionar automáticamente la nueva sección
    setSelectedSection(section.id)
    showAlert(`Sección "${section.name}" creada exitosamente`, "section")
  }

  // Actualizar sección
  const updateSection = (sectionId: string, updates: Partial<BudgetSection>) => {
    setBudgetData((prev) => ({
      ...prev,
      sections: prev.sections.map((section) => (section.id === sectionId ? { ...section, ...updates } : section)),
    }))
    showAlert(`Sección actualizada exitosamente`, "section")
  }

  // Eliminar sección
  const deleteSection = (sectionId: string) => {
    if (sectionId === "preliminares") {
      alert("No se puede eliminar la sección 'Preliminares'")
      return
    }

    // Mover APUs de la sección eliminada a "Preliminares"
    setBudgetData((prev) => ({
      ...prev,
      sections: prev.sections.filter((section) => section.id !== sectionId),
      apus: prev.apus.map((apu) => (apu.sectionId === sectionId ? { ...apu, sectionId: "preliminares" } : apu)),
    }))
    showAlert(`Sección eliminada. Los APUs se movieron a 'Preliminares'`, "section")
  }

  // Actualizar porcentaje de costo indirecto
  const updateIndirectCostPercentage = (costId: string, percentage: number) => {
    setBudgetData((prev) => ({
      ...prev,
      indirectCosts: prev.indirectCosts.map((cost) => (cost.id === costId ? { ...cost, percentage } : cost)),
    }))
  }

  // Mover APU hacia arriba
  const moveAPUUp = (apuId: string, sectionId: string) => {
    const sectionAPUs = budgetData.apus.filter((apu) => apu.sectionId === sectionId).sort((a, b) => a.order - b.order)
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
    const sectionAPUs = budgetData.apus.filter((apu) => apu.sectionId === sectionId).sort((a, b) => a.order - b.order)
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

  // Mover APU a otra sección (desde menú contextual)
  const moveAPUToSection = (apuId: string, targetSectionId: string) => {
    const apu = budgetData.apus.find((a) => a.id === apuId)

    if (apu && apu.sectionId !== targetSectionId) {
      const maxOrder = Math.max(
        ...budgetData.apus.filter((a) => a.sectionId === targetSectionId).map((a) => a.order),
        0,
      )

      setBudgetData((prev) => ({
        ...prev,
        apus: prev.apus.map((a) => (a.id === apuId ? { ...a, sectionId: targetSectionId, order: maxOrder + 1 } : a)),
      }))

      const sourceSectionName = budgetData.sections.find((s) => s.id === apu.sectionId)?.name || "sección anterior"
      const targetSectionName = budgetData.sections.find((s) => s.id === targetSectionId)?.name || "nueva sección"
      showAlert(`APU "${apu.name}" movido de ${sourceSectionName} a ${targetSectionName}`, "apu")
    }
  }

  // Ordenar secciones
  const sortedSections = [...budgetData.sections].sort((a, b) => a.order - b.order)

  // Agrupar APUs por sección
  const apusBySection = sortedSections.map((section, sectionIndex) => {
    const sectionAPUs = budgetData.apus.filter((apu) => apu.sectionId === section.id).sort((a, b) => a.order - b.order)

    return {
      section,
      sectionIndex: sectionIndex + 1,
      apus: sectionAPUs,
      total: sectionAPUs.reduce((sum, apu) => sum + apu.total, 0),
    }
  })

  // Guardar presupuesto
  const handleSaveBudget = async () => {
      if (!budgetData.name.trim()) {
          toast({
              variant: "destructive",
              title: "Error",
              description: "El nombre del presupuesto es obligatorio",
          })
          return
      }

      if (budgetData.apus.length === 0) {
          toast({
              variant: "destructive",
              title: "Error",
              description: "Debes agregar al menos un APU al presupuesto",
          })
          return
      }

      setLoading({ ...loading, save: true })

      try {
          // Preparar datos para enviar al backend
          const budgetToSave = {
              nombre: budgetData.name,
              descripcion: budgetData.description,
              proyecto: budgetData.project,
              cliente: budgetData.client,
              secciones: budgetData.sections.map(section => ({
                  nombre: section.name,
                  descripcion: section.description || "",
                  orden: section.order,
              })),
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

          // Llamar a la API para guardar el presupuesto
          const response = await apiClient.post('/budgets', budgetToSave)
          
          if (response.data.success) {
              toast({
                  variant: "success",
                  title: "Presupuesto guardado",
                  description: response.data.message || "El presupuesto se ha guardado correctamente",
              })

              // Redirigir a la lista de presupuestos
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
          setLoading({ ...loading, save: false })
      }
  }

  const loadMoreResults = () => {
    setPagination((prev) => ({
      start: prev.start + prev.length,
      length: prev.length,
      draw: prev.draw + 1,
    }))
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
        <Button
          onClick={handleSaveBudget}
          disabled={loading.save}
          className="gap-2 bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-200"
        >
          {loading.save ? (
            <Loader className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          Guardar Presupuesto
        </Button>
      </div>

      {/* Alertas */}
      {showSectionAlert && (
        <Alert className="border-green-200 bg-green-50">
          <Check className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{alertMessage}</AlertDescription>
        </Alert>
      )}

      {showAPUAlert && (
        <Alert className="border-blue-200 bg-blue-50">
          <Check className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">{alertMessage}</AlertDescription>
        </Alert>
      )}

      {/* Información básica del presupuesto */}
      <Card className="border-green-200">
        <CardHeader>
          <CardTitle className="text-green-900 flex items-center gap-2">
            <Calculator className="h-5 w-5 text-green-600" />
            Información del Presupuesto
          </CardTitle>
          <CardDescription className="text-green-600">
            Completa la información básica del presupuesto de obra.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="budget-name" className="text-green-800">
                Nombre del Presupuesto *
              </Label>
              <Input
                id="budget-name"
                placeholder="Ej: Presupuesto Edificio Los Pinos - Estructura"
                value={budgetData.name}
                onChange={(e) => setBudgetData((prev) => ({ ...prev, name: e.target.value }))}
                className="border-green-200 focus:border-green-400 focus:ring-green-400"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget-project" className="text-green-800">
                Proyecto
              </Label>
              <Input
                id="budget-project"
                placeholder="Nombre del proyecto"
                value={budgetData.project}
                onChange={(e) => setBudgetData((prev) => ({ ...prev, project: e.target.value }))}
                className="border-green-200 focus:border-green-400 focus:ring-green-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget-client" className="text-green-800">
                Cliente
              </Label>
              <Input
                id="budget-client"
                placeholder="Nombre del cliente"
                value={budgetData.client}
                onChange={(e) => setBudgetData((prev) => ({ ...prev, client: e.target.value }))}
                className="border-green-200 focus:border-green-400 focus:ring-green-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget-description" className="text-green-800">
                Descripción
              </Label>
              <Input
                id="budget-description"
                placeholder="Descripción del presupuesto"
                value={budgetData.description}
                onChange={(e) => setBudgetData((prev) => ({ ...prev, description: e.target.value }))}
                className="border-green-200 focus:border-green-400 focus:ring-green-400"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Búsqueda y agregado de APUs */}
      <Card className="border-green-200">
        <CardHeader>
          <CardTitle className="text-green-900 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-green-600" />
            Agregar APUs al Presupuesto
          </CardTitle>
          <CardDescription className="text-green-600">
            Busca y agrega los APUs necesarios para tu presupuesto.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="section-select" className="text-green-800">
                Sección de Destino *
              </Label>
              <div className="flex gap-2">
                <Select value={selectedSection} onValueChange={setSelectedSection}>
                  <SelectTrigger className="border-green-200 focus:border-green-400 focus:ring-green-400">
                    <SelectValue placeholder="Seleccionar sección" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortedSections.map((section, index) => (
                      <SelectItem key={section.id} value={section.id}>
                        {index + 1}. {section.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <NewSectionDialog onAddSection={addSection} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="apu-search" className="text-green-800">
                Buscar APU
              </Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-green-500" />
                <Input
                  id="apu-search"
                  placeholder="Buscar por nombre, código o tipo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 border-green-200 focus:border-green-400 focus:ring-green-400"
                />
              </div>
            </div>
          </div>

          {/* Resultados de búsqueda */}
          {loading.apus ? (
            <div className="text-center py-6 text-green-600 bg-green-50/50 rounded-lg border border-green-100">
              <Loader className="h-8 w-8 animate-spin mx-auto mb-2" />
              Buscando APUs...
            </div>
          ) : searchTerm && filteredAPUs.length > 0 ? (
            <div className="border border-green-100 rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-green-50">
                    <TableHead className="text-green-800">Código</TableHead>
                    <TableHead className="text-green-800">APU</TableHead>
                    <TableHead className="text-green-800">Unidad</TableHead>
                    <TableHead className="text-green-800">Precio</TableHead>
                    <TableHead className="text-green-800">Tipo</TableHead>
                    <TableHead className="text-green-800 w-[80px]">Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAPUs.map((apu) => (
                    <TableRow key={apu.id} className="hover:bg-green-50/50">
                      <TableCell className="font-medium text-green-900">{apu.codigo}</TableCell>
                      <TableCell className="font-medium text-green-900">{apu.nombre}</TableCell>
                      <TableCell>{apu.unidad_medida}</TableCell>
                      <TableCell>{formatPrice(apu.valor_total)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {apu.tipo_actividad}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => addAPUToBudget(apu)}
                          className="h-8 w-8 p-0"
                          disabled={!selectedSection}
                        >
                          <Plus className="h-4 w-4 text-green-600" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="p-2 border-t border-green-200 bg-green-50 text-center">
                <Button
                  variant="ghost"
                  onClick={loadMoreResults}
                  disabled={loading.apus}
                  className="text-green-600 hover:bg-green-100"
                >
                  {loading.apus ? "Cargando..." : "Cargar más resultados"}
                </Button>
              </div>
            </div>
          ) : searchTerm && !loading.apus && filteredAPUs.length === 0 ? (
            <div className="text-center py-3 text-green-600 bg-green-50/50 rounded-lg border border-green-100">
              No se encontraron APUs que coincidan con la búsqueda
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* APUs del presupuesto organizados por secciones */}
      <Card className="border-green-200">
        <CardHeader>
          <CardTitle className="text-green-900 flex items-center gap-2">
            <Package className="h-5 w-5 text-green-600" />
            APUs del Presupuesto
          </CardTitle>
          <CardDescription className="text-green-600">
            APUs organizados por secciones con sus cantidades y totales. Arrastra los APUs para moverlos entre
            secciones.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {budgetData.apus.length > 0 ? (
            <div className="space-y-6">
              {apusBySection.map(({ section, sectionIndex, apus, total }) => {
                if (apus.length === 0 && section.id !== "preliminares") return null

                return (
                  <div
                    key={section.id}
                    className={`border rounded-lg overflow-hidden ${
                      dragOverSection === section.id ? "border-green-400 bg-green-50/50" : "border-green-100"
                    }`}
                    onDragOver={(e) => handleDragOver(e, section.id)}
                    onDrop={(e) => handleDrop(e, section.id)}
                    onDragLeave={() => setDragOverSection(null)}
                  >
                    {/* Encabezado de sección */}
                    <div className="bg-green-100 px-4 py-3 border-b border-green-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-green-700 text-white">{sectionIndex}</Badge>
                          <div>
                            <h5 className="font-semibold text-green-800">{section.name}</h5>
                            {section.description && <p className="text-sm text-green-600">{section.description}</p>}
                          </div>
                          <EditSectionDialog
                            section={section}
                            onUpdateSection={updateSection}
                            onDeleteSection={deleteSection}
                          />
                        </div>
                        <div className="text-green-700 font-medium">Subtotal: {formatPrice(total)}</div>
                      </div>
                    </div>

                    {/* Tabla de APUs de la sección */}
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-green-50">
                          <TableHead className="text-green-800 w-[50px]">#</TableHead>
                          <TableHead className="text-green-800 w-[50px]"></TableHead>
                          <TableHead className="text-green-800">Código</TableHead>
                          <TableHead className="text-green-800">APU</TableHead>
                          <TableHead className="text-green-800">Unidad</TableHead>
                          <TableHead className="text-green-800">Precio Unit.</TableHead>
                          <TableHead className="text-green-800">Cantidad</TableHead>
                          <TableHead className="text-green-800">Total</TableHead>
                          <TableHead className="text-green-800 w-[120px]">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {apus.length > 0 ? (
                          apus.map((apu, index) => (
                            <TableRow
                              key={apu.id}
                              className={`hover:bg-green-50/50 ${draggedAPU === apu.id ? "opacity-50" : ""}`}
                              draggable
                              onDragStart={(e) => handleDragStart(e, apu.id)}
                              onDragEnd={handleDragEnd}
                            >
                              <TableCell className="font-medium text-green-900">
                                {sectionIndex}.{index + 1}
                              </TableCell>
                              <TableCell>
                                <div className="cursor-move flex items-center justify-center">
                                  <GripVertical className="h-4 w-4 text-green-400" />
                                </div>
                              </TableCell>
                              <TableCell className="font-medium text-green-900">{apu.code}</TableCell>
                              <TableCell className="font-medium text-green-900">{apu.name}</TableCell>
                              <TableCell>{apu.unit}</TableCell>
                              <TableCell>{formatPrice(apu.unitPrice)}</TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  min="0.01"
                                  step="0.01"
                                  value={apu.quantity}
                                  onChange={(e) => updateAPUQuantity(apu.id, Number.parseFloat(e.target.value) || 0)}
                                  className="w-20 h-8 text-sm border-green-200"
                                />
                              </TableCell>
                              <TableCell className="font-medium">{formatPrice(apu.total)}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0">
                                        <MoveVertical className="h-4 w-4 text-green-600" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      {sortedSections
                                        .filter((s) => s.id !== section.id)
                                        .map((s, i) => (
                                          <DropdownMenuItem key={s.id} onClick={() => moveAPUToSection(apu.id, s.id)}>
                                            Mover a {i + 1}. {s.name}
                                          </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => moveAPUUp(apu.id, section.id)}
                                    className="h-8 w-8 p-0"
                                    disabled={index === 0}
                                  >
                                    <ChevronUp className="h-4 w-4 text-green-600" />
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => moveAPUDown(apu.id, section.id)}
                                    className="h-8 w-8 p-0"
                                    disabled={index === apus.length - 1}
                                  >
                                    <ChevronDown className="h-4 w-4 text-green-600" />
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeAPUFromBudget(apu.id)}
                                    className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={9} className="text-center py-4 text-green-600">
                              No hay APUs en esta sección. Arrastra APUs aquí o agrega nuevos.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-green-600 bg-green-50/50 rounded-lg border border-green-100">
              <Package className="h-12 w-12 text-green-400 mx-auto mb-4" />
              <p>No hay APUs agregados al presupuesto.</p>
              <p className="text-sm">Busca y agrega APUs para comenzar.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Costos Indirectos */}
      <Card className="border-green-200">
        <CardHeader>
          <CardTitle className="text-green-900 flex items-center gap-2">
            <Percent className="h-5 w-5 text-green-600" />
            Costos Indirectos
          </CardTitle>
          <CardDescription className="text-green-600">
            Configura los porcentajes de administración, imprevistos y utilidad.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {budgetData.indirectCosts.map((cost) => (
              <div
                key={cost.id}
                className="flex items-center justify-between p-4 border border-green-100 rounded-lg bg-green-50/30"
              >
                <div className="flex-1">
                  <h6 className="font-medium text-green-900">{cost.name}</h6>
                  <p className="text-sm text-green-600">{cost.percentage}% sobre costo directo</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={cost.percentage}
                      onChange={(e) => updateIndirectCostPercentage(cost.id, Number.parseFloat(e.target.value) || 0)}
                      className="w-20 h-8 text-sm border-green-200"
                    />
                    <span className="text-green-700">%</span>
                  </div>
                  <div className="text-right min-w-[120px]">
                    <div className="font-medium text-green-900">{formatPrice(cost.amount)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Resumen de totales */}
      <Card className="border-green-200 bg-gradient-to-br from-green-50/50 to-white">
        <CardHeader>
          <CardTitle className="text-green-900 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            Resumen del Presupuesto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-green-100">
              <span className="text-green-800 font-medium">Costo Directo Total:</span>
              <span className="text-lg font-semibold text-green-900">{formatPrice(budgetData.directTotal)}</span>
            </div>

            {budgetData.indirectCosts.map((cost) => (
              <div key={cost.id} className="flex justify-between items-center py-1">
                <span className="text-green-700">
                  {cost.name} ({cost.percentage}%):
                </span>
                <span className="font-medium text-green-800">{formatPrice(cost.amount)}</span>
              </div>
            ))}

            <Separator className="bg-green-200" />

            <div className="flex justify-between items-center py-2">
              <span className="text-green-800 font-medium">Total Costos Indirectos:</span>
              <span className="text-lg font-semibold text-green-900">{formatPrice(budgetData.indirectTotal)}</span>
            </div>

            <Separator className="bg-green-300" />

            <div className="flex justify-between items-center py-3 bg-green-100 px-4 rounded-lg">
              <span className="text-xl font-bold text-green-900">TOTAL PRESUPUESTO:</span>
              <span className="text-2xl font-bold text-green-900">{formatPrice(budgetData.grandTotal)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botones de acción */}
      <div className="flex justify-end gap-4">
        <Link href="/budgets">
          <Button variant="outline" className="border-green-300 text-green-700 hover:bg-green-50 bg-transparent">
            Cancelar
          </Button>
        </Link>
        <Button
          onClick={handleSaveBudget}
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
    </div>
  )
}