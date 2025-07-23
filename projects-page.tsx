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
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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

// Datos de ejemplo expandidos
const projectsData = [
  {
    id: 1,
    name: "Edificio Residencial Los Pinos",
    location: "Av. Principal 123, Santiago",
    type: "Edificio Residencial",
    status: "En progreso",
    startDate: "2024-01-15",
    totalValue: 2500000,
    budgets: [
      { id: 1, name: "Estructura y Cimentación", value: 800000, status: "Aprobado" },
      { id: 2, name: "Instalaciones Eléctricas", value: 350000, status: "En revisión" },
      { id: 3, name: "Instalaciones Sanitarias", value: 280000, status: "Pendiente" },
      { id: 4, name: "Acabados y Terminaciones", value: 1070000, status: "Pendiente" },
    ],
  },
  {
    id: 2,
    name: "Puente Vehicular Norte",
    location: "Ruta 5 Norte, Km 45",
    type: "Infraestructura Vial",
    status: "Revisión",
    startDate: "2024-02-01",
    totalValue: 8750000,
    budgets: [
      { id: 5, name: "Estudios y Diseño", value: 450000, status: "Aprobado" },
      { id: 6, name: "Movimiento de Tierras", value: 1200000, status: "Aprobado" },
      { id: 7, name: "Estructura del Puente", value: 5800000, status: "En revisión" },
      { id: 8, name: "Pavimentación y Señalética", value: 1300000, status: "Pendiente" },
    ],
  },
  {
    id: 3,
    name: "Centro Comercial Plaza",
    location: "Av. Comercial 456, Valparaíso",
    type: "Edificio Comercial",
    status: "Aprobado",
    startDate: "2023-11-10",
    totalValue: 15000000,
    budgets: [
      { id: 9, name: "Estructura Principal", value: 6000000, status: "Aprobado" },
      { id: 10, name: "Instalaciones MEP", value: 3500000, status: "Aprobado" },
      { id: 11, name: "Fachada y Exteriores", value: 2800000, status: "Aprobado" },
      { id: 12, name: "Interiores y Locales", value: 2700000, status: "Aprobado" },
    ],
  },
  {
    id: 4,
    name: "Urbanización Valle Verde",
    location: "Sector Sur, Concepción",
    type: "Urbanización",
    status: "En progreso",
    startDate: "2024-03-01",
    totalValue: 12500000,
    budgets: [
      { id: 13, name: "Infraestructura Vial", value: 4200000, status: "En progreso" },
      { id: 14, name: "Redes de Servicios", value: 3800000, status: "Aprobado" },
      { id: 15, name: "Áreas Verdes", value: 1500000, status: "Pendiente" },
      { id: 16, name: "Equipamiento Urbano", value: 3000000, status: "Pendiente" },
    ],
  },
  {
    id: 5,
    name: "Complejo Industrial Norte",
    location: "Zona Industrial, Antofagasta",
    type: "Obra Industrial",
    status: "Planificación",
    startDate: "2024-04-15",
    totalValue: 22000000,
    budgets: [
      { id: 17, name: "Nave Principal", value: 12000000, status: "En revisión" },
      { id: 18, name: "Oficinas Administrativas", value: 3500000, status: "Pendiente" },
      { id: 19, name: "Instalaciones Especiales", value: 4500000, status: "Pendiente" },
      { id: 20, name: "Urbanización Industrial", value: 2000000, status: "Pendiente" },
    ],
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
    isActive: true,
  },
  {
    title: "Presupuestos",
    url: "/budgets",
    icon: Calculator,
    isActive: false,
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

export default function ProjectsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredProjects = projectsData.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || project.status === statusFilter
    return matchesSearch && matchesStatus
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
      case "Planificación":
        return "bg-purple-100 text-purple-800 border-purple-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

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
                placeholder="Buscar proyectos..."
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

        {/* Main Content */}
        <main className="flex-1 space-y-6 p-6 bg-gradient-to-br from-green-50/30 to-white">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-green-900">Proyectos</h1>
              <p className="text-green-700">Gestiona y visualiza todos tus proyectos de ingeniería civil</p>
            </div>
            <Button className="gap-2 bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-200">
              <Plus className="h-4 w-4" />
              Nuevo Proyecto
            </Button>
          </div>

          {/* Filters and Stats */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2 border-green-300 text-green-700 hover:bg-green-50">
                    <Filter className="h-4 w-4" />
                    Estado: {statusFilter === "all" ? "Todos" : statusFilter}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setStatusFilter("all")}>Todos</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("En progreso")}>En progreso</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("Revisión")}>En revisión</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("Aprobado")}>Aprobado</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("Planificación")}>Planificación</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="outline" className="gap-2 border-green-300 text-green-700 hover:bg-green-50">
                <ArrowUpDown className="h-4 w-4" />
                Ordenar
              </Button>
            </div>
            <div className="text-sm text-green-600">
              {filteredProjects.length} proyecto{filteredProjects.length !== 1 ? "s" : ""} encontrado
              {filteredProjects.length !== 1 ? "s" : ""}
            </div>
          </div>

          {/* Projects Grid */}
          <div className="grid gap-6">
            {filteredProjects.map((project) => (
              <Card key={project.id} className="border-green-200 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="text-green-900 flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-green-600" />
                        {project.name}
                      </CardTitle>
                      <div className="flex items-center gap-4 text-sm text-green-700">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {project.location}
                        </div>
                        <Badge variant="outline" className="border-green-300 text-green-700">
                          {project.type}
                        </Badge>
                        <Badge className={getStatusColor(project.status)}>{project.status}</Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-900">${project.totalValue.toLocaleString()}</div>
                      <div className="text-sm text-green-600">Valor Total</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-green-800 mb-3">
                        Presupuestos del Proyecto ({project.budgets.length})
                      </h4>
                      <div className="overflow-hidden rounded-lg border border-green-200">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-green-50">
                              <TableHead className="text-green-800">Presupuesto</TableHead>
                              <TableHead className="text-green-800">Valor</TableHead>
                              <TableHead className="text-green-800">Estado</TableHead>
                              <TableHead className="text-green-800 w-[100px]">Acciones</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {project.budgets.map((budget) => (
                              <TableRow key={budget.id} className="hover:bg-green-50/50">
                                <TableCell className="font-medium text-green-900">{budget.name}</TableCell>
                                <TableCell className="text-green-800">${budget.value.toLocaleString()}</TableCell>
                                <TableCell>
                                  <Badge className={getStatusColor(budget.status)} variant="outline">
                                    {budget.status}
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
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-green-100">
                      <div className="text-sm text-green-600">
                        Inicio: {new Date(project.startDate).toLocaleDateString("es-ES")}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-green-300 text-green-700 hover:bg-green-50"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Proyecto
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-green-300 text-green-700 hover:bg-green-50"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Nuevo Presupuesto
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-green-300 text-green-700 hover:bg-green-50"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar Proyecto
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Calculator className="h-4 w-4 mr-2" />
                              Generar Reporte
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Eliminar Proyecto
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredProjects.length === 0 && (
            <Card className="border-green-200">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Building2 className="h-12 w-12 text-green-400 mb-4" />
                <h3 className="text-lg font-medium text-green-900 mb-2">No se encontraron proyectos</h3>
                <p className="text-green-600 text-center mb-4">
                  No hay proyectos que coincidan con los criterios de búsqueda.
                </p>
                <Button className="bg-green-600 hover:bg-green-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Primer Proyecto
                </Button>
              </CardContent>
            </Card>
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
