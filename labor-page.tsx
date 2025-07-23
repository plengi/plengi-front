"use client"

import type React from "react"

import {
  Building2,
  Calculator,
  FileText,
  Home,
  Settings,
  Users,
  Search,
  Bell,
  User,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Filter,
  ArrowUpDown,
  Package,
  Wrench,
  Truck,
  HardHat,
  BarChart3,
  PieChart,
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

// Datos de mano de obra
const laborData = [
  {
    id: 1,
    name: "Maestro de Obra",
    unit: "Hora",
    unitPrice: 8500,
    supplier: "Constructora Profesional",
    type: "Supervisión",
    category: "labor",
  },
  {
    id: 2,
    name: "Albañil Especializado",
    unit: "Hora",
    unitPrice: 6500,
    supplier: "Mano de Obra Calificada",
    type: "Albañilería",
    category: "labor",
  },
  {
    id: 3,
    name: "Soldador Certificado",
    unit: "Hora",
    unitPrice: 7200,
    supplier: "Soldaduras Industriales",
    type: "Soldadura",
    category: "labor",
  },
  {
    id: 4,
    name: "Operador Excavadora",
    unit: "Hora",
    unitPrice: 9500,
    supplier: "Operadores Especializados",
    type: "Operación Maquinaria",
    category: "labor",
  },
  {
    id: 5,
    name: "Electricista Industrial",
    unit: "Hora",
    unitPrice: 7800,
    supplier: "Instalaciones Eléctricas Pro",
    type: "Electricidad",
    category: "labor",
  },
  {
    id: 6,
    name: "Plomero Especializado",
    unit: "Hora",
    unitPrice: 6800,
    supplier: "Instalaciones Sanitarias",
    type: "Plomería",
    category: "labor",
  },
  {
    id: 7,
    name: "Carpintero",
    unit: "Hora",
    unitPrice: 5500,
    supplier: "Carpintería Fina",
    type: "Carpintería",
    category: "labor",
  },
  {
    id: 8,
    name: "Ayudante General",
    unit: "Hora",
    unitPrice: 3500,
    supplier: "Personal de Apoyo",
    type: "Ayudantía",
    category: "labor",
  },
]

const laborTypes = [
  "Supervisión",
  "Albañilería",
  "Soldadura",
  "Operación Maquinaria",
  "Electricidad",
  "Plomería",
  "Carpintería",
  "Ayudantía",
  "Pintura",
  "Otros",
]

const units = ["Hora", "Día", "Semana", "Mes", "Jornal"]

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
    isActive: false,
  },
  {
    title: "Proyectos",
    url: "/projects",
    icon: Building2,
    isActive: false,
  },
  {
    title: "Presupuestos",
    url: "/budgets",
    icon: Calculator,
    isActive: true,
  },
  {
    title: "Plantillas",
    url: "#",
    icon: FileText,
  },
  {
    title: "Clientes",
    url: "#",
    icon: Users,
  },
  {
    title: "Configuración",
    url: "#",
    icon: Settings,
  },
]

const analysisItems = [
  {
    title: "APU",
    url: "/budgets/apu",
    icon: BarChart3,
    description: "Análisis de Precios Unitarios",
  },
  {
    title: "APG",
    url: "/budgets/apg",
    icon: PieChart,
    description: "Análisis de Precios Globales",
  },
]

const suppliesItems = [
  {
    title: "Materiales",
    url: "/budgets/materials",
    icon: Package,
    description: "Gestión de materiales",
    isActive: false,
  },
  {
    title: "Equipos",
    url: "/budgets/equipment",
    icon: Wrench,
    description: "Equipos y herramientas",
    isActive: false,
  },
  {
    title: "Transporte",
    url: "/budgets/transport",
    icon: Truck,
    description: "Costos de transporte",
    isActive: false,
  },
  {
    title: "Mano de Obra",
    url: "/budgets/labor",
    icon: HardHat,
    description: "Recursos humanos",
    isActive: true,
  },
]

function NewLaborDialog() {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    unit: "",
    unitPrice: "",
    supplier: "",
    type: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.unit || !formData.unitPrice || !formData.supplier || !formData.type) {
      alert("Por favor, completa todos los campos")
      return
    }

    console.log("Nueva mano de obra:", formData)
    setFormData({ name: "", unit: "", unitPrice: "", supplier: "", type: "" })
    setOpen(false)
    alert("Mano de obra creada exitosamente")
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-200">
          <Plus className="h-4 w-4" />
          Nueva Mano de Obra
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] border-green-200">
        <DialogHeader>
          <DialogTitle className="text-green-900 flex items-center gap-2">
            <HardHat className="h-5 w-5 text-green-600" />
            Agregar Nueva Mano de Obra
          </DialogTitle>
          <DialogDescription className="text-green-600">
            Completa la información de la mano de obra para agregarla al catálogo.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="labor-name" className="text-green-800">
              Nombre del Cargo *
            </Label>
            <Input
              id="labor-name"
              placeholder="Ej: Maestro de Obra"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="border-green-200 focus:border-green-400 focus:ring-green-400"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="labor-unit" className="text-green-800">
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
              <Label htmlFor="labor-price" className="text-green-800">
                Valor Unitario *
              </Label>
              <Input
                id="labor-price"
                type="number"
                placeholder="0"
                value={formData.unitPrice}
                onChange={(e) => handleInputChange("unitPrice", e.target.value)}
                className="border-green-200 focus:border-green-400 focus:ring-green-400"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="labor-supplier" className="text-green-800">
              Proveedor *
            </Label>
            <Input
              id="labor-supplier"
              placeholder="Ej: Constructora Profesional"
              value={formData.supplier}
              onChange={(e) => handleInputChange("supplier", e.target.value)}
              className="border-green-200 focus:border-green-400 focus:ring-green-400"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="labor-type" className="text-green-800">
              Tipo de Mano de Obra *
            </Label>
            <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)} required>
              <SelectTrigger className="border-green-200 focus:border-green-400 focus:ring-green-400">
                <SelectValue placeholder="Seleccionar tipo" />
              </SelectTrigger>
              <SelectContent>
                {laborTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-green-300 text-green-700 hover:bg-green-50"
            >
              Cancelar
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">
              Crear Mano de Obra
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <Building2 className="h-8 w-8 text-green-600" />
          <div>
            <h2 className="text-lg font-semibold text-green-800">CivilBudget</h2>
            <p className="text-xs text-green-600">Presupuestos Pro</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-green-700">Navegación</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={item.isActive}
                    className="data-[active=true]:bg-green-100 data-[active=true]:text-green-800"
                  >
                    <Link href={item.url}>
                      <item.icon className={item.isActive ? "text-green-600" : ""} />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-green-700">Análisis de Precios</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {analysisItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className="hover:bg-green-50 hover:text-green-800 pl-6"
                    tooltip={item.description}
                  >
                    <Link href={item.url}>
                      <item.icon className="text-green-600" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-green-700">Insumos</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {suppliesItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={item.isActive}
                    className="hover:bg-green-50 hover:text-green-800 pl-6 data-[active=true]:bg-green-100 data-[active=true]:text-green-800"
                    tooltip={item.description}
                  >
                    <Link href={item.url}>
                      <item.icon className={item.isActive ? "text-green-600" : "text-green-600"} />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="hover:bg-green-50">
                  <User className="text-green-600" />
                  <span>Ing. Juan Pérez</span>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" className="w-[--radix-popper-anchor-width]">
                <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Perfil</DropdownMenuItem>
                <DropdownMenuItem>Configuración</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Cerrar Sesión</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

export default function LaborPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")

  const filteredLabor = laborData.filter((labor) => {
    const matchesSearch =
      labor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      labor.supplier.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === "all" || labor.type === typeFilter
    return matchesSearch && matchesType
  })

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Supervisión":
        return "bg-purple-100 text-purple-800 border-purple-300"
      case "Albañilería":
        return "bg-orange-100 text-orange-800 border-orange-300"
      case "Soldadura":
        return "bg-red-100 text-red-800 border-red-300"
      case "Operación Maquinaria":
        return "bg-blue-100 text-blue-800 border-blue-300"
      case "Electricidad":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "Plomería":
        return "bg-cyan-100 text-cyan-800 border-cyan-300"
      case "Carpintería":
        return "bg-amber-100 text-amber-800 border-amber-300"
      case "Ayudantía":
        return "bg-gray-100 text-gray-800 border-gray-300"
      default:
        return "bg-green-100 text-green-800 border-green-300"
    }
  }

  const uniqueTypes = [...new Set(laborData.map((labor) => labor.type))]

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-green-100 px-4 bg-gradient-to-r from-green-50 to-white">
          <SidebarTrigger className="-ml-1 text-green-600 hover:bg-green-100" />
          <div className="flex flex-1 items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-green-500" />
              <Input
                placeholder="Buscar mano de obra..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 border-green-200 focus:border-green-400 focus:ring-green-400"
              />
            </div>
            <Button variant="outline" size="icon" className="border-green-200 hover:bg-green-50 hover:border-green-300">
              <Bell className="h-4 w-4 text-green-600" />
            </Button>
          </div>
        </header>

        <main className="flex-1 space-y-6 p-6 bg-gradient-to-br from-green-50/30 to-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-green-900">Mano de Obra</h1>
              <p className="text-green-700">Gestiona el catálogo de recursos humanos para tus proyectos</p>
            </div>
            <NewLaborDialog />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-green-200 bg-gradient-to-br from-white to-green-50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-800">Total Mano de Obra</CardTitle>
                <HardHat className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-900">{filteredLabor.length}</div>
                <p className="text-xs text-green-600">Recursos disponibles</p>
              </CardContent>
            </Card>
            <Card className="border-green-200 bg-gradient-to-br from-white to-green-50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-800">Especialidades</CardTitle>
                <Filter className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-900">{uniqueTypes.length}</div>
                <p className="text-xs text-green-600">Tipos diferentes</p>
              </CardContent>
            </Card>
            <Card className="border-green-200 bg-gradient-to-br from-white to-green-50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-800">Proveedores</CardTitle>
                <Users className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-900">
                  {[...new Set(laborData.map((l) => l.supplier))].length}
                </div>
                <p className="text-xs text-green-600">Empresas activas</p>
              </CardContent>
            </Card>
            <Card className="border-green-200 bg-gradient-to-br from-white to-green-50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-800">Tarifa Promedio</CardTitle>
                <ArrowUpDown className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-900">
                  ${Math.round(laborData.reduce((sum, l) => sum + l.unitPrice, 0) / laborData.length).toLocaleString()}
                </div>
                <p className="text-xs text-green-600">Por hora</p>
              </CardContent>
            </Card>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2 border-green-300 text-green-700 hover:bg-green-50">
                    <Filter className="h-4 w-4" />
                    Especialidad: {typeFilter === "all" ? "Todas" : typeFilter}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setTypeFilter("all")}>Todas</DropdownMenuItem>
                  {uniqueTypes.map((type) => (
                    <DropdownMenuItem key={type} onClick={() => setTypeFilter(type)}>
                      {type}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="outline" className="gap-2 border-green-300 text-green-700 hover:bg-green-50">
                <ArrowUpDown className="h-4 w-4" />
                Ordenar
              </Button>
            </div>
            <div className="text-sm text-green-600">
              {filteredLabor.length} recurso{filteredLabor.length !== 1 ? "s" : ""} encontrado
              {filteredLabor.length !== 1 ? "s" : ""}
            </div>
          </div>

          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="text-green-900">Catálogo de Mano de Obra</CardTitle>
              <CardDescription className="text-green-600">
                Lista completa de recursos humanos disponibles para presupuestos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-lg border border-green-200">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-green-50">
                      <TableHead className="text-green-800">Cargo</TableHead>
                      <TableHead className="text-green-800">Unidad</TableHead>
                      <TableHead className="text-green-800">Valor Unitario</TableHead>
                      <TableHead className="text-green-800">Proveedor</TableHead>
                      <TableHead className="text-green-800">Especialidad</TableHead>
                      <TableHead className="text-green-800 w-[100px]">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLabor.map((labor) => (
                      <TableRow key={labor.id} className="hover:bg-green-50/50">
                        <TableCell className="font-medium text-green-900">{labor.name}</TableCell>
                        <TableCell className="text-green-800">{labor.unit}</TableCell>
                        <TableCell className="text-green-800 font-medium">
                          ${labor.unitPrice.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-green-800">{labor.supplier}</TableCell>
                        <TableCell>
                          <Badge className={getTypeColor(labor.type)} variant="outline">
                            {labor.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                Ver detalles
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

// Exportar los datos de mano de obra al final del archivo
export { laborData }
