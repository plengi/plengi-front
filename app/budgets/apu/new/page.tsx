"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, BarChart3, HardHat, Package, Plus, Search, Trash2, Truck, Wrench } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Datos de muestra para materiales
const materialsData = [
  {
    id: 1,
    name: "Cemento Portland",
    unit: "Saco 50kg",
    unitPrice: 12500,
    stock: 120,
    supplier: "Cementos del Norte",
    lastUpdate: "2023-10-15",
    type: "Cemento",
  },
  {
    id: 2,
    name: "Arena Gruesa",
    unit: "m³",
    unitPrice: 35000,
    stock: 45,
    supplier: "Áridos Santiago",
    lastUpdate: "2023-10-10",
    type: "Árido",
  },
  {
    id: 3,
    name: 'Grava 3/4"',
    unit: "m³",
    unitPrice: 42000,
    stock: 30,
    supplier: "Áridos Santiago",
    lastUpdate: "2023-10-12",
    type: "Árido",
  },
  {
    id: 4,
    name: "Ladrillo Fiscal",
    unit: "Unidad",
    unitPrice: 450,
    stock: 5000,
    supplier: "Cerámicas Chile",
    lastUpdate: "2023-09-28",
    type: "Ladrillo",
  },
  {
    id: 5,
    name: "Acero 10mm",
    unit: "Barra 6m",
    unitPrice: 5800,
    stock: 200,
    supplier: "Aceros del Sur",
    lastUpdate: "2023-10-05",
    type: "Acero",
  },
  {
    id: 6,
    name: 'Madera Pino 2x4"',
    unit: "Unidad",
    unitPrice: 3200,
    stock: 150,
    supplier: "Maderas Concepción",
    lastUpdate: "2023-10-08",
    type: "Madera",
  },
  {
    id: 7,
    name: "Pintura Látex Blanco",
    unit: "Galón",
    unitPrice: 18500,
    stock: 25,
    supplier: "Pinturas Express",
    lastUpdate: "2023-09-30",
    type: "Pintura",
  },
  {
    id: 8,
    name: "Tubo PVC 110mm",
    unit: "Unidad 6m",
    unitPrice: 9500,
    stock: 40,
    supplier: "Plásticos Industriales",
    lastUpdate: "2023-10-02",
    type: "PVC",
  },
]

// Datos de muestra para equipos
const equipmentData = [
  {
    id: 1,
    name: "Retroexcavadora CAT 420F",
    unit: "Hora",
    unitPrice: 45000,
    availability: "Disponible",
    condition: "Bueno",
    lastMaintenance: "2023-09-15",
    nextMaintenance: "2023-12-15",
    type: "Excavación",
  },
  {
    id: 2,
    name: "Mezcladora de Concreto 350L",
    unit: "Día",
    unitPrice: 25000,
    availability: "Disponible",
    condition: "Excelente",
    lastMaintenance: "2023-10-01",
    nextMaintenance: "2023-11-01",
    type: "Concreto",
  },
  {
    id: 3,
    name: "Compactadora Manual",
    unit: "Día",
    unitPrice: 15000,
    availability: "En Uso",
    condition: "Regular",
    lastMaintenance: "2023-08-20",
    nextMaintenance: "2023-10-20",
    type: "Compactación",
  },
  {
    id: 4,
    name: "Generador Eléctrico 5000W",
    unit: "Día",
    unitPrice: 35000,
    availability: "Disponible",
    condition: "Bueno",
    lastMaintenance: "2023-09-25",
    nextMaintenance: "2023-11-25",
    type: "Energía",
  },
  {
    id: 5,
    name: "Andamio Metálico (cuerpo)",
    unit: "Semana",
    unitPrice: 12000,
    availability: "Disponible",
    condition: "Bueno",
    lastMaintenance: "2023-07-10",
    nextMaintenance: "2023-10-10",
    type: "Altura",
  },
  {
    id: 6,
    name: "Martillo Demoledor Eléctrico",
    unit: "Día",
    unitPrice: 18000,
    availability: "En Mantenimiento",
    condition: "Regular",
    lastMaintenance: "2023-10-05",
    nextMaintenance: "2023-11-05",
    type: "Demolición",
  },
]

// Datos de muestra para mano de obra
const laborData = [
  {
    id: 1,
    name: "Maestro Albañil",
    unit: "Jornal",
    unitPrice: 45000,
    specialty: "Albañilería",
    experience: "10 años",
    availability: "Disponible",
    certification: "Certificado SENCE",
    type: "Especializado",
  },
  {
    id: 2,
    name: "Ayudante de Construcción",
    unit: "Jornal",
    unitPrice: 25000,
    specialty: "General",
    experience: "2 años",
    availability: "Disponible",
    certification: "Ninguna",
    type: "No Especializado",
  },
  {
    id: 3,
    name: "Maestro Carpintero",
    unit: "Jornal",
    unitPrice: 42000,
    specialty: "Carpintería",
    experience: "8 años",
    availability: "En Proyecto",
    certification: "Certificado SENCE",
    type: "Especializado",
  },
  {
    id: 4,
    name: "Maestro Eléctrico",
    unit: "Jornal",
    unitPrice: 50000,
    specialty: "Instalaciones Eléctricas",
    experience: "12 años",
    availability: "Disponible",
    certification: "SEC Clase B",
    type: "Especializado",
  },
  {
    id: 5,
    name: "Operador de Maquinaria Pesada",
    unit: "Jornal",
    unitPrice: 55000,
    specialty: "Operación de Equipos",
    experience: "15 años",
    availability: "En Proyecto",
    certification: "Licencia Clase D",
    type: "Especializado",
  },
  {
    id: 6,
    name: "Capataz de Obra",
    unit: "Jornal",
    unitPrice: 60000,
    specialty: "Supervisión",
    experience: "20 años",
    availability: "Disponible",
    certification: "Prevención de Riesgos",
    type: "Supervisión",
  },
]

// Datos de muestra para transporte
const transportData = [
  {
    id: 1,
    name: "Camión Tolva 12m³",
    unit: "Viaje",
    unitPrice: 85000,
    capacity: "12 m³",
    driver: "Juan Pérez",
    availability: "Disponible",
    license: "A5",
    type: "Carga",
  },
  {
    id: 2,
    name: "Camión Mixer 8m³",
    unit: "Hora",
    unitPrice: 65000,
    capacity: "8 m³",
    driver: "Pedro González",
    availability: "En Ruta",
    license: "A5",
    type: "Hormigón",
  },
  {
    id: 3,
    name: "Camioneta 4x4",
    unit: "Día",
    unitPrice: 45000,
    capacity: "1 ton",
    driver: "María Soto",
    availability: "Disponible",
    license: "B",
    type: "Liviano",
  },
  {
    id: 4,
    name: "Camión Pluma",
    unit: "Servicio",
    unitPrice: 120000,
    capacity: "5 ton",
    driver: "Roberto Jiménez",
    availability: "Disponible",
    license: "A5",
    type: "Izaje",
  },
  {
    id: 5,
    name: "Camión Aljibe 10000L",
    unit: "Servicio",
    unitPrice: 95000,
    capacity: "10000 L",
    driver: "Carlos Muñoz",
    availability: "En Ruta",
    license: "A5",
    type: "Agua",
  },
]

// Constantes
const activityTypes = [
  "Movimiento de Tierras",
  "Hormigón Armado",
  "Albañilería",
  "Instalaciones Eléctricas",
  "Instalaciones Sanitarias",
  "Techumbres",
  "Pavimentación",
  "Terminaciones",
  "Estructura Metálica",
  "Revestimientos",
  "Otros",
]

const units = ["m³", "m²", "m", "kg", "Unidad", "Global", "Jornal"]

// Tipo extendido para insumos seleccionados
interface SelectedInsumo {
  id: number
  name: string
  unit: string
  unitPrice: number
  type: string
  category: string
  quantity: number
  total: number
  // Campos adicionales según el tipo
  wastePercentage?: number // Para materiales
  performance?: number // Para mano de obra y equipos
}

// Función para formatear precios
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

// Función para guardar APU en localStorage
const saveAPUToStorage = (apu: any) => {
  try {
    const existingAPUs = JSON.parse(localStorage.getItem("customAPUs") || "[]")
    const newAPU = {
      ...apu,
      id: Date.now(), // Generar ID único basado en timestamp
      createdAt: new Date().toISOString(),
    }
    existingAPUs.push(newAPU)
    localStorage.setItem("customAPUs", JSON.stringify(existingAPUs))
    return newAPU
  } catch (error) {
    console.error("Error saving APU to storage:", error)
    return null
  }
}

export default function NewAPUPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    unit: "",
    unitPrice: 0,
    activityType: "",
    code: "",
    description: "",
  })
  const [selectedInsumos, setSelectedInsumos] = useState<SelectedInsumo[]>([])
  const [insumoType, setInsumoType] = useState("materials")
  const [searchTerm, setSearchTerm] = useState("")

  // Combinar todos los insumos disponibles
  const allInsumos = [
    ...materialsData.map((item) => ({ ...item, category: "materials" })),
    ...equipmentData.map((item) => ({ ...item, category: "equipment" })),
    ...laborData.map((item) => ({ ...item, category: "labor" })),
    ...transportData.map((item) => ({ ...item, category: "transport" })),
  ]

  // Filtrar insumos por tipo y término de búsqueda
  const filteredInsumos = allInsumos
    .filter(
      (insumo) =>
        insumo.category === insumoType &&
        (insumo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          insumo.supplier?.toLowerCase().includes(searchTerm.toLowerCase())),
    )
    .slice(0, 5) // Limitar a 5 resultados para no sobrecargar la UI

  // Agrupar insumos por categoría
  const groupedInsumos = selectedInsumos.reduce(
    (groups, insumo) => {
      const category = insumo.category
      if (!groups[category]) {
        groups[category] = []
      }
      groups[category].push(insumo)
      return groups
    },
    {} as Record<string, SelectedInsumo[]>,
  )

  // Calcular subtotales por categoría
  const categorySubtotals = Object.keys(groupedInsumos).reduce(
    (subtotals, category) => {
      subtotals[category] = groupedInsumos[category].reduce((sum, insumo) => sum + insumo.total, 0)
      return subtotals
    },
    {} as Record<string, number>,
  )

  // Calcular total general
  const totalGeneral = Object.values(categorySubtotals).reduce((sum, subtotal) => sum + subtotal, 0)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.unit || !formData.activityType || !formData.code) {
      alert("Por favor, completa todos los campos obligatorios")
      return
    }

    if (selectedInsumos.length === 0) {
      alert("Debes agregar al menos un insumo al APU")
      return
    }

    const newAPU = {
      ...formData,
      unitPrice: totalGeneral,
      insumos: selectedInsumos,
      categorySubtotals,
    }

    // Guardar en localStorage
    const savedAPU = saveAPUToStorage(newAPU)

    if (savedAPU) {
      console.log("Nuevo APU guardado:", savedAPU)
      alert("APU creado exitosamente")

      // Disparar evento personalizado para notificar a otras páginas
      window.dispatchEvent(new CustomEvent("apuCreated", { detail: savedAPU }))

      router.push("/budgets/apu")
    } else {
      alert("Error al guardar el APU")
    }
  }

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const addInsumo = (insumo: any) => {
    // Verificar si el insumo ya está en la lista
    const exists = selectedInsumos.some((item) => item.id === insumo.id && item.category === insumo.category)

    if (exists) {
      alert("Este insumo ya ha sido agregado")
      return
    }

    const newInsumo: SelectedInsumo = {
      ...insumo,
      quantity: 1,
      total: insumo.unitPrice,
      // Inicializar campos adicionales según el tipo
      ...(insumo.category === "materials" && { wastePercentage: 0 }),
      ...(insumo.category === "labor" && { performance: 1 }),
      ...(insumo.category === "equipment" && { performance: 1 }),
    }

    setSelectedInsumos([...selectedInsumos, newInsumo])
  }

  const updateInsumoField = (index: number, field: keyof SelectedInsumo, value: number) => {
    const updatedInsumos = [...selectedInsumos]
    const insumo = updatedInsumos[index]

    // Actualizar el campo
    ;(insumo as any)[field] = value

    // Recalcular el total según el tipo de insumo
    if (insumo.category === "materials") {
      const wasteMultiplier = 1 + (insumo.wastePercentage || 0) / 100
      insumo.total = insumo.quantity * insumo.unitPrice * wasteMultiplier
    } else if (insumo.category === "labor" || insumo.category === "equipment") {
      // Fórmula inversamente proporcional: Total = (Cantidad × Precio Unitario) / Rendimiento
      const performanceDivisor = insumo.performance || 1
      insumo.total = (insumo.quantity * insumo.unitPrice) / performanceDivisor
    } else {
      // Para transporte (sin modificadores)
      insumo.total = insumo.quantity * insumo.unitPrice
    }

    setSelectedInsumos(updatedInsumos)

    // Actualizar el precio unitario total en el formulario
    const newTotal = updatedInsumos.reduce((sum, item) => sum + item.total, 0)
    handleInputChange("unitPrice", newTotal)
  }

  const removeInsumo = (index: number) => {
    const updatedInsumos = selectedInsumos.filter((_, i) => i !== index)
    setSelectedInsumos(updatedInsumos)

    // Actualizar el precio unitario total
    const newTotal = updatedInsumos.reduce((sum, item) => sum + item.total, 0)
    handleInputChange("unitPrice", newTotal)
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "materials":
        return "Materiales"
      case "equipment":
        return "Equipos"
      case "labor":
        return "Mano de Obra"
      case "transport":
        return "Transporte"
      default:
        return "Insumo"
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "materials":
        return <Package className="h-4 w-4 text-green-600" />
      case "equipment":
        return <Wrench className="h-4 w-4 text-green-600" />
      case "labor":
        return <HardHat className="h-4 w-4 text-green-600" />
      case "transport":
        return <Truck className="h-4 w-4 text-green-600" />
      default:
        return <Package className="h-4 w-4 text-green-600" />
    }
  }

  // Nuevo orden de las categorías: 1. Equipos, 2. Materiales, 3. Transporte, 4. Mano de obra
  const categoryOrder = ["equipment", "materials", "transport", "labor"]

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/budgets/apu">
            <Button variant="outline" size="icon" className="h-8 w-8 border-green-200">
              <ArrowLeft className="h-4 w-4 text-green-600" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-green-900">Crear Nuevo APU</h1>
        </div>
        <Button
          type="submit"
          form="apu-form"
          className="gap-2 bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-200"
        >
          <Plus className="h-4 w-4" />
          Guardar APU
        </Button>
      </div>

      <Card className="border-green-200">
        <CardHeader>
          <CardTitle className="text-green-900 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-green-600" />
            Información del APU
          </CardTitle>
          <CardDescription className="text-green-600">
            Completa la información básica del Análisis de Precio Unitario.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form id="apu-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="apu-code" className="text-green-800">
                  Código APU *
                </Label>
                <Input
                  id="apu-code"
                  placeholder="Ej: APU-011"
                  value={formData.code}
                  onChange={(e) => handleInputChange("code", e.target.value)}
                  className="border-green-200 focus:border-green-400 focus:ring-green-400"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="apu-type" className="text-green-800">
                  Tipo de Actividad *
                </Label>
                <Select
                  value={formData.activityType}
                  onValueChange={(value) => handleInputChange("activityType", value)}
                  required
                >
                  <SelectTrigger className="border-green-200 focus:border-green-400 focus:ring-green-400">
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {activityTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="apu-name" className="text-green-800">
                Nombre de la Actividad *
              </Label>
              <Input
                id="apu-name"
                placeholder="Ej: Excavación Manual en Tierra"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="border-green-200 focus:border-green-400 focus:ring-green-400"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="apu-unit" className="text-green-800">
                  Unidad de Medida *
                </Label>
                <Select value={formData.unit} onValueChange={(value) => handleInputChange("unit", value)} required>
                  <SelectTrigger className="border-green-200 focus:border-green-400 focus:ring-green-400">
                    <SelectValue placeholder="Seleccionar unidad" />
                  </SelectTrigger>
                  <SelectContent>
                    {units.map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="apu-price" className="text-green-800">
                  Precio Unitario Total
                </Label>
                <Input
                  id="apu-price"
                  type="text"
                  value={formatPrice(totalGeneral)}
                  className="border-green-200 focus:border-green-400 focus:ring-green-400 bg-gray-50 font-semibold"
                  readOnly
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="apu-description" className="text-green-800">
                Descripción
              </Label>
              <Input
                id="apu-description"
                placeholder="Descripción detallada de la actividad"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                className="border-green-200 focus:border-green-400 focus:ring-green-400"
              />
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-green-200">
        <CardHeader>
          <CardTitle className="text-green-900 flex items-center gap-2">
            <Package className="h-5 w-5 text-green-600" />
            Insumos del APU
          </CardTitle>
          <CardDescription className="text-green-600">
            Agrega los insumos necesarios para realizar esta actividad.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="insumo-type" className="text-green-800">
                Tipo de Insumo
              </Label>
              <Select value={insumoType} onValueChange={setInsumoType}>
                <SelectTrigger className="border-green-200 focus:border-green-400 focus:ring-green-400">
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="materials">Materiales</SelectItem>
                  <SelectItem value="equipment">Equipos</SelectItem>
                  <SelectItem value="labor">Mano de Obra</SelectItem>
                  <SelectItem value="transport">Transporte</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="insumo-search" className="text-green-800">
                Buscar Insumo
              </Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-green-500" />
                <Input
                  id="insumo-search"
                  placeholder="Buscar por nombre o proveedor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 border-green-200 focus:border-green-400 focus:ring-green-400"
                />
              </div>
            </div>
          </div>

          {/* Resultados de búsqueda */}
          {searchTerm && filteredInsumos.length > 0 && (
            <div className="border border-green-100 rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-green-50">
                    <TableHead className="text-green-800">Insumo</TableHead>
                    <TableHead className="text-green-800">Unidad</TableHead>
                    <TableHead className="text-green-800">Precio</TableHead>
                    <TableHead className="text-green-800 w-[80px]">Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInsumos.map((insumo) => (
                    <TableRow key={`${insumo.category}-${insumo.id}`} className="hover:bg-green-50/50">
                      <TableCell className="font-medium text-green-900">{insumo.name}</TableCell>
                      <TableCell>{insumo.unit}</TableCell>
                      <TableCell>{formatPrice(insumo.unitPrice)}</TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => addInsumo(insumo)}
                          className="h-8 w-8 p-0"
                        >
                          <Plus className="h-4 w-4 text-green-600" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {searchTerm && filteredInsumos.length === 0 && (
            <div className="text-center py-3 text-green-600 bg-green-50/50 rounded-lg border border-green-100">
              No se encontraron insumos que coincidan con la búsqueda
            </div>
          )}

          {/* Insumos seleccionados agrupados por categoría */}
          <div className="space-y-4">
            <h4 className="text-green-800 font-medium">Insumos Seleccionados</h4>
            {selectedInsumos.length > 0 ? (
              <div className="space-y-6">
                {categoryOrder.map((category) => {
                  const categoryInsumos = groupedInsumos[category]
                  if (!categoryInsumos || categoryInsumos.length === 0) return null

                  return (
                    <div key={category} className="border border-green-100 rounded-lg overflow-hidden">
                      {/* Encabezado de categoría */}
                      <div className="bg-green-100 px-4 py-3 border-b border-green-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getCategoryIcon(category)}
                            <h5 className="font-semibold text-green-800">{getCategoryLabel(category)}</h5>
                          </div>
                          <div className="text-green-700 font-medium">
                            Subtotal: {formatPrice(categorySubtotals[category] || 0)}
                          </div>
                        </div>
                      </div>

                      {/* Tabla de insumos de la categoría */}
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-green-50">
                            <TableHead className="text-green-800">Insumo</TableHead>
                            <TableHead className="text-green-800">Unidad</TableHead>
                            <TableHead className="text-green-800">Precio Unit.</TableHead>
                            <TableHead className="text-green-800">Cantidad</TableHead>
                            {category === "materials" && (
                              <TableHead className="text-green-800">% Desperdicio</TableHead>
                            )}
                            {(category === "labor" || category === "equipment") && (
                              <TableHead className="text-green-800">Rendimiento</TableHead>
                            )}
                            <TableHead className="text-green-800">Total</TableHead>
                            <TableHead className="text-green-800 w-[50px]"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {categoryInsumos.map((insumo, categoryIndex) => {
                            const globalIndex = selectedInsumos.findIndex(
                              (item) => item.id === insumo.id && item.category === insumo.category,
                            )
                            return (
                              <TableRow key={`${category}-${categoryIndex}`} className="hover:bg-green-50/50">
                                <TableCell className="font-medium text-green-900">{insumo.name}</TableCell>
                                <TableCell>{insumo.unit}</TableCell>
                                <TableCell>{formatPrice(insumo.unitPrice)}</TableCell>
                                <TableCell>
                                  <Input
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    value={insumo.quantity}
                                    onChange={(e) =>
                                      updateInsumoField(globalIndex, "quantity", Number.parseFloat(e.target.value) || 0)
                                    }
                                    className="w-20 h-8 text-sm border-green-200"
                                  />
                                </TableCell>
                                {category === "materials" && (
                                  <TableCell>
                                    <Input
                                      type="number"
                                      min="0"
                                      max="100"
                                      step="0.1"
                                      value={insumo.wastePercentage || 0}
                                      onChange={(e) =>
                                        updateInsumoField(
                                          globalIndex,
                                          "wastePercentage",
                                          Number.parseFloat(e.target.value) || 0,
                                        )
                                      }
                                      className="w-20 h-8 text-sm border-green-200"
                                      placeholder="0"
                                    />
                                  </TableCell>
                                )}
                                {(category === "labor" || category === "equipment") && (
                                  <TableCell>
                                    <Input
                                      type="number"
                                      min="0.01"
                                      step="0.01"
                                      value={insumo.performance || 1}
                                      onChange={(e) =>
                                        updateInsumoField(
                                          globalIndex,
                                          "performance",
                                          Number.parseFloat(e.target.value) || 1,
                                        )
                                      }
                                      className="w-20 h-8 text-sm border-green-200"
                                      placeholder="1.0"
                                    />
                                  </TableCell>
                                )}
                                <TableCell className="font-medium">{formatPrice(insumo.total)}</TableCell>
                                <TableCell>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeInsumo(globalIndex)}
                                    className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )
                })}

                {/* Total general */}
                <div className="border border-green-200 rounded-lg bg-green-50/70 p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-green-800">Total General del APU:</span>
                    <span className="text-xl font-bold text-green-900">{formatPrice(totalGeneral)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-green-600 bg-green-50/50 rounded-lg border border-green-100">
                No hay insumos seleccionados. Busca y agrega insumos para completar el APU.
              </div>
            )}
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Link href="/budgets/apu">
              <Button variant="outline" className="border-green-300 text-green-700 hover:bg-green-50">
                Cancelar
              </Button>
            </Link>
            <Button type="submit" form="apu-form" className="bg-green-600 hover:bg-green-700 text-white">
              Crear APU
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
