"use client"

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
  MapPin,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Filter,
  ArrowUpDown,
  DollarSign,
  Briefcase,
  BarChart3,
  PieChart,
  Package,
  Truck,
  Wrench,
  HardHat,
  ClipboardList,
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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

// Datos de presupuestos con relación a proyectos
const budgetsData = [
  {
    id: 1,
    name: "Estructura y Cimentación",
    value: 800000,
    status: "Aprobado",
    category: "Estructural",
    createdDate: "2024-01-20",
    project: {
      id: 1,
      name: "Edificio Residencial Los Pinos",
      location: "Av. Principal 123, Santiago",
      type: "Edificio Residencial",
    },
  },
  {
    id: 2,
    name: "Instalaciones Eléctricas",
    value: 350000,
    status: "En revisión",
    category: "Instalaciones",
    createdDate: "2024-01-25",
    project: {
      id: 1,
      name: "Edificio Residencial Los Pinos",
      location: "Av. Principal 123, Santiago",
      type: "Edificio Residencial",
    },
  },
  {
    id: 3,
    name: "Instalaciones Sanitarias",
    value: 280000,
    status: "Pendiente",
    category: "Instalaciones",
    createdDate: "2024-01-25",
    project: {
      id: 1,
      name: "Edificio Residencial Los Pinos",
      location: "Av. Principal 123, Santiago",
      type: "Edificio Residencial",
    },
  },
  {
    id: 4,
    name: "Acabados y Terminaciones",
    value: 1070000,
    status: "Pendiente",
    category: "Acabados",
    createdDate: "2024-01-30",
    project: {
      id: 1,
      name: "Edificio Residencial Los Pinos",
      location: "Av. Principal 123, Santiago",
      type: "Edificio Residencial",
    },
  },
  {
    id: 5,
    name: "Estudios y Diseño",
    value: 450000,
    status: "Aprobado",
    category: "Ingeniería",
    createdDate: "2024-02-05",
    project: {
      id: 2,
      name: "Puente Vehicular Norte",
      location: "Ruta 5 Norte, Km 45",
      type: "Infraestructura Vial",
    },
  },
  {
    id: 6,
    name: "Movimiento de Tierras",
    value: 1200000,
    status: "Aprobado",
    category: "Movimiento de Tierras",
    createdDate: "2024-02-10",
    project: {
      id: 2,
      name: "Puente Vehicular Norte",
      location: "Ruta 5 Norte, Km 45",
      type: "Infraestructura Vial",
    },
  },
  {
    id: 7,
    name: "Estructura del Puente",
    value: 5800000,
    status: "En revisión",
    category: "Estructural",
    createdDate: "2024-02-15",
    project: {
      id: 2,
      name: "Puente Vehicular Norte",
      location: "Ruta 5 Norte, Km 45",
      type: "Infraestructura Vial",
    },
  },
  {
    id: 8,
    name: "Pavimentación y Señalética",
    value: 1300000,
    status: "Pendiente",
    category: "Pavimentación",
    createdDate: "2024-02-20",
    project: {
      id: 2,
      name: "Puente Vehicular Norte",
      location: "Ruta 5 Norte, Km 45",
      type: "Infraestructura Vial",
    },
  },
  {
    id: 9,
    name: "Estructura Principal",
    value: 6000000,
    status: "Aprobado",
    category: "Estructural",
    createdDate: "2023-11-15",
    project: {
      id: 3,
      name: "Centro Comercial Plaza",
      location: "Av. Comercial 456, Valparaíso",
      type: "Edificio Comercial",
    },
  },
  {
    id: 10,
    name: "Instalaciones MEP",
    value: 3500000,
    status: "Aprobado",
    category: "Instalaciones",
    createdDate: "2023-11-20",
    project: {
      id: 3,
      name: "Centro Comercial Plaza",
      location: "Av. Comercial 456, Valparaíso",
      type: "Edificio Comercial",
    },
  },
  {
    id: 11,
    name: "Fachada y Exteriores",
    value: 2800000,
    status: "Aprobado",
    category: "Acabados",
    createdDate: "2023-12-01",
    project: {
      id: 3,
      name: "Centro Comercial Plaza",
      location: "Av. Comercial 456, Valparaíso",
      type: "Edificio Comercial",
    },
  },
  {
    id: 12,
    name: "Interiores y Locales",
    value: 2700000,
    status: "Aprobado",
    category: "Acabados",
    createdDate: "2023-12-05",
    project: {
      id: 3,
      name: "Centro Comercial Plaza",
      location: "Av. Comercial 456, Valparaíso",
      type: "Edificio Comercial",
    },
  },
  {
    id: 13,
    name: "Infraestructura Vial",
    value: 4200000,
    status: "En progreso",
    category: "Infraestructura",
    createdDate: "2024-03-05",
    project: {
      id: 4,
      name: "Urbanización Valle Verde",
      location: "Sector Sur, Concepción",
      type: "Urbanización",
    },
  },
  {
    id: 14,
    name: "Redes de Servicios",
    value: 3800000,
    status: "Aprobado",
    category: "Instalaciones",
    createdDate: "2024-03-10",
    project: {
      id: 4,
      name: "Urbanización Valle Verde",
      location: "Sector Sur, Concepción",
      type: "Urbanización",
    },
  },
  {
    id: 15,
    name: "Áreas Verdes",
    value: 1500000,
    status: "Pendiente",
    category: "Paisajismo",
    createdDate: "2024-03-15",
    project: {
      id: 4,
      name: "Urbanización Valle Verde",
      location: "Sector Sur, Concepción",
      type: "Urbanización",
    },
  },
]

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

// Elementos secundarios para presupuestos
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
  {
    title: "Presupuesto General",
    url: "/budgets",
    icon: Calculator,
    description: "Gestión de presupuestos de obra",
  },
]

const suppliesItems = [
  {
    title: "Materiales",
    url: "/budgets/materials",
    icon: Package,
    description: "Gestión de materiales",
  },
  {
    title: "Equipos",
    url: "/budgets/equipment",
    icon: Wrench,
    description: "Equipos y herramientas",
  },
  {
    title: "Transporte",
    url: "/budgets/transport",
    icon: Truck,
    description: "Costos de transporte",
  },
  {
    title: "Mano de Obra",
    url: "/budgets/labor",
    icon: HardHat,
    description: "Recursos humanos",
  },
]

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
        {/* Navegación Principal */}
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

        {/* Sección de Análisis de Precios - Solo visible en página de presupuestos */}
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

        {/* Sección de Insumos - Solo visible en página de presupuestos */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-green-700">Insumos</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {suppliesItems.map((item) => (
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

export default function BudgetsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")

  const filteredBudgets = budgetsData.filter((budget) => {
    const matchesSearch =
      budget.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      budget.project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      budget.project.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || budget.status === statusFilter
    const matchesCategory = categoryFilter === "all" || budget.category === categoryFilter
    return matchesSearch && matchesStatus && matchesCategory
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Aprobado":
        return "bg-green-100 text-green-800 border-green-300"
      case "En progreso":
        return "bg-blue-100 text-blue-800 border-blue-300"
      case "En revisión":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "Pendiente":
        return "bg-gray-100 text-gray-800 border-gray-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Estructural":
        return "bg-blue-100 text-blue-800 border-blue-300"
      case "Instalaciones":
        return "bg-purple-100 text-purple-800 border-purple-300"
      case "Acabados":
        return "bg-orange-100 text-orange-800 border-orange-300"
      case "Ingeniería":
        return "bg-indigo-100 text-indigo-800 border-indigo-300"
      case "Movimiento de Tierras":
        return "bg-amber-100 text-amber-800 border-amber-300"
      case "Pavimentación":
        return "bg-slate-100 text-slate-800 border-slate-300"
      case "Infraestructura":
        return "bg-cyan-100 text-cyan-800 border-cyan-300"
      case "Paisajismo":
        return "bg-emerald-100 text-emerald-800 border-emerald-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  const totalValue = filteredBudgets.reduce((sum, budget) => sum + budget.value, 0)
  const uniqueCategories = [...new Set(budgetsData.map((budget) => budget.category))]

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-green-100 px-4 bg-gradient-to-r from-green-50 to-white">
          <SidebarTrigger className="-ml-1 text-green-600 hover:bg-green-100" />
          <div className="flex flex-1 items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-green-500" />
              <Input
                placeholder="Buscar presupuestos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 border-green-200 focus:border-green-400 focus:ring-green-400"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              className="border-green-200 hover:bg-green-50 hover:border-green-300 bg-transparent"
            >
              <Bell className="h-4 w-4 text-green-600" />
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 space-y-6 p-6 bg-gradient-to-br from-green-50/30 to-white">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-green-900">Presupuestos</h1>
              <p className="text-green-700">Gestiona y visualiza todos los presupuestos de tus proyectos</p>
            </div>
            <div className="flex gap-2">
              {" "}
              {/* Added a flex container for buttons */}
              <Link href="/budgets/quantity-memory">
                <Button
                  variant="outline"
                  className="gap-2 border-green-300 text-green-700 hover:bg-green-50 bg-transparent"
                >
                  <ClipboardList className="h-4 w-4" />
                  Memoria de Cantidades
                </Button>
              </Link>
              <Link href="/budgets/new">
                <Button className="gap-2 bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-200">
                  <Plus className="h-4 w-4" />
                  Nuevo Presupuesto
                </Button>
              </Link>
            </div>
          </div>

          {/* Quick Access Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="border-green-200 bg-gradient-to-br from-white to-green-50 hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <CardTitle className="text-green-900 flex items-center gap-2 text-lg">
                  <BarChart3 className="h-5 w-5 text-green-600" />
                  Análisis de Precios Unitarios
                </CardTitle>
                <CardDescription className="text-green-600">
                  Gestiona y analiza los precios unitarios de tus actividades
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-green-700">APU disponibles</div>
                  <Badge className="bg-green-100 text-green-800">24</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-gradient-to-br from-white to-green-50 hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <CardTitle className="text-green-900 flex items-center gap-2 text-lg">
                  <PieChart className="h-5 w-5 text-green-600" />
                  Análisis de Precios Globales
                </CardTitle>
                <CardDescription className="text-green-600">
                  Análisis global de costos y distribución de presupuestos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-green-700">APG activos</div>
                  <Badge className="bg-green-100 text-green-800">8</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-gradient-to-br from-white to-green-50 hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <CardTitle className="text-green-900 flex items-center gap-2 text-lg">
                  <Package className="h-5 w-5 text-green-600" />
                  Gestión de Insumos
                </CardTitle>
                <CardDescription className="text-green-600">
                  Administra materiales, equipos, transporte y mano de obra
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-green-700">Total insumos</div>
                  <Badge className="bg-green-100 text-green-800">156</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-green-200 bg-gradient-to-br from-white to-green-50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-800">Total Presupuestos</CardTitle>
                <Calculator className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-900">{filteredBudgets.length}</div>
                <p className="text-xs text-green-600">Presupuestos activos</p>
              </CardContent>
            </Card>
            <Card className="border-green-200 bg-gradient-to-br from-white to-green-50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-800">Valor Total</CardTitle>
                <DollarSign className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-900">${totalValue.toLocaleString()}</div>
                <p className="text-xs text-green-600">Suma de presupuestos</p>
              </CardContent>
            </Card>
            <Card className="border-green-200 bg-gradient-to-br from-white to-green-50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-800">Aprobados</CardTitle>
                <Briefcase className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-900">
                  {filteredBudgets.filter((b) => b.status === "Aprobado").length}
                </div>
                <p className="text-xs text-green-600">Presupuestos aprobados</p>
              </CardContent>
            </Card>
            <Card className="border-green-200 bg-gradient-to-br from-white to-green-50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-800">En Revisión</CardTitle>
                <Eye className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-900">
                  {filteredBudgets.filter((b) => b.status === "En revisión").length}
                </div>
                <p className="text-xs text-green-600">Pendientes de revisión</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="gap-2 border-green-300 text-green-700 hover:bg-green-50 bg-transparent"
                  >
                    <Filter className="h-4 w-4" />
                    Estado: {statusFilter === "all" ? "Todos" : statusFilter}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setStatusFilter("all")}>Todos</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("Aprobado")}>Aprobado</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("En progreso")}>En progreso</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("En revisión")}>En revisión</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("Pendiente")}>Pendiente</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="gap-2 border-green-300 text-green-700 hover:bg-green-50 bg-transparent"
                  >
                    <Filter className="h-4 w-4" />
                    Categoría: {categoryFilter === "all" ? "Todas" : categoryFilter}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setCategoryFilter("all")}>Todas</DropdownMenuItem>
                  {uniqueCategories.map((category) => (
                    <DropdownMenuItem key={category} onClick={() => setCategoryFilter(category)}>
                      {category}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="outline"
                className="gap-2 border-green-300 text-green-700 hover:bg-green-50 bg-transparent"
              >
                <ArrowUpDown className="h-4 w-4" />
                Ordenar
              </Button>
            </div>
            <div className="text-sm text-green-600">
              {filteredBudgets.length} presupuesto{filteredBudgets.length !== 1 ? "s" : ""} encontrado
              {filteredBudgets.length !== 1 ? "s" : ""}
            </div>
          </div>

          {/* Budgets Table */}
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="text-green-900">Lista de Presupuestos</CardTitle>
              <CardDescription className="text-green-600">
                Todos los presupuestos organizados por proyecto y categoría
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-lg border border-green-200">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-green-50">
                      <TableHead className="text-green-800">Presupuesto</TableHead>
                      <TableHead className="text-green-800">Valor</TableHead>
                      <TableHead className="text-green-800">Categoría</TableHead>
                      <TableHead className="text-green-800">Estado</TableHead>
                      <TableHead className="text-green-800">Proyecto Relacionado</TableHead>
                      <TableHead className="text-green-800">Ubicación</TableHead>
                      <TableHead className="text-green-800 w-[100px]">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBudgets.map((budget) => (
                      <TableRow key={budget.id} className="hover:bg-green-50/50">
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium text-green-900">{budget.name}</div>
                            <div className="text-xs text-green-600">
                              Creado: {new Date(budget.createdDate).toLocaleDateString("es-ES")}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-green-900">${budget.value.toLocaleString()}</div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getCategoryColor(budget.category)} variant="outline">
                            {budget.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(budget.status)} variant="outline">
                            {budget.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium text-green-900">{budget.project.name}</div>
                            <Badge variant="outline" className="text-xs border-green-300 text-green-700">
                              {budget.project.type}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-green-700">
                            <MapPin className="h-3 w-3" />
                            {budget.project.location}
                          </div>
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
                              <DropdownMenuItem>
                                <Building2 className="h-4 w-4 mr-2" />
                                Ver proyecto
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

          {filteredBudgets.length === 0 && (
            <Card className="border-green-200">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calculator className="h-12 w-12 text-green-400 mb-4" />
                <h3 className="text-lg font-medium text-green-900 mb-2">No se encontraron presupuestos</h3>
                <p className="text-green-600 text-center mb-4">
                  No hay presupuestos que coincidan con los criterios de búsqueda.
                </p>
                <Button className="bg-green-600 hover:bg-green-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Primer Presupuesto
                </Button>
              </CardContent>
            </Card>
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
