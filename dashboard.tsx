"use client"

import type React from "react"

import {
  Building2,
  Calculator,
  FileText,
  Home,
  MoreHorizontal,
  Plus,
  Settings,
  TrendingUp,
  Users,
  DollarSign,
  Clock,
  CheckCircle,
  Search,
  Bell,
  User,
  CalendarIcon,
  MapPin,
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

// Datos de ejemplo
const projects = [
  {
    id: 1,
    name: "Edificio Residencial Los Pinos",
    client: "Constructora ABC",
    budget: 2500000,
    status: "En progreso",
    progress: 65,
    lastUpdate: "Hace 2 días",
  },
  {
    id: 2,
    name: "Puente Vehicular Norte",
    client: "Municipalidad",
    budget: 8750000,
    status: "Revisión",
    progress: 90,
    lastUpdate: "Hace 1 día",
  },
  {
    id: 3,
    name: "Centro Comercial Plaza",
    client: "Inversiones XYZ",
    budget: 15000000,
    status: "Aprobado",
    progress: 100,
    lastUpdate: "Hace 3 días",
  },
]

const templates = [
  {
    id: 1,
    name: "Edificio Residencial",
    description: "Plantilla para edificios de vivienda multifamiliar",
    items: 45,
    category: "Residencial",
  },
  {
    id: 2,
    name: "Infraestructura Vial",
    description: "Presupuesto para carreteras y puentes",
    items: 32,
    category: "Infraestructura",
  },
  {
    id: 3,
    name: "Obra Industrial",
    description: "Plantilla para naves industriales y bodegas",
    items: 38,
    category: "Industrial",
  },
  {
    id: 4,
    name: "Urbanización",
    description: "Desarrollo de loteos y urbanizaciones",
    items: 52,
    category: "Urbanismo",
  },
]

const projectTypes = [
  "Edificio Residencial",
  "Edificio Comercial",
  "Infraestructura Vial",
  "Puentes",
  "Obra Industrial",
  "Urbanización",
  "Obra Hidráulica",
  "Instalaciones Deportivas",
  "Edificios Públicos",
  "Otros",
]

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
    isActive: true,
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

function NewProjectDialog() {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    location: "",
    date: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validación básica
    if (!formData.name || !formData.type || !formData.location || !formData.date) {
      alert("Por favor, completa todos los campos")
      return
    }

    // Aquí iría la lógica para crear el proyecto
    console.log("Nuevo proyecto:", formData)

    // Resetear formulario y cerrar modal
    setFormData({ name: "", type: "", location: "", date: "" })
    setOpen(false)

    // Mostrar mensaje de éxito
    alert("Proyecto creado exitosamente")
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="gap-2 bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-200">
          <Plus className="h-4 w-4" />
          Nuevo Proyecto
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] border-green-200">
        <DialogHeader>
          <DialogTitle className="text-green-900 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-green-600" />
            Crear Nuevo Proyecto
          </DialogTitle>
          <DialogDescription className="text-green-600">
            Completa la información básica para crear un nuevo proyecto de ingeniería civil.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project-name" className="text-green-800">
              Nombre del Proyecto *
            </Label>
            <Input
              id="project-name"
              placeholder="Ej: Edificio Residencial Los Robles"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="border-green-200 focus:border-green-400 focus:ring-green-400"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="project-type" className="text-green-800">
              Tipo de Proyecto *
            </Label>
            <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)} required>
              <SelectTrigger className="border-green-200 focus:border-green-400 focus:ring-green-400">
                <SelectValue placeholder="Selecciona el tipo de proyecto" />
              </SelectTrigger>
              <SelectContent>
                {projectTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="project-location" className="text-green-800">
              Ubicación *
            </Label>
            <div className="relative">
              <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-green-500" />
              <Input
                id="project-location"
                placeholder="Ej: Av. Principal 123, Ciudad, País"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                className="pl-8 border-green-200 focus:border-green-400 focus:ring-green-400"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="project-date" className="text-green-800">
              Fecha de Inicio *
            </Label>
            <div className="relative">
              <CalendarIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-green-500" />
              <Input
                id="project-date"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange("date", e.target.value)}
                className="pl-8 border-green-200 focus:border-green-400 focus:ring-green-400"
                required
              />
            </div>
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
              Crear Proyecto
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

export default function Dashboard() {
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
                placeholder="Buscar proyectos, clientes..."
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
          {/* Welcome Section */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-green-900">Dashboard</h1>
              <p className="text-green-700">Gestiona tus proyectos y presupuestos de ingeniería civil</p>
            </div>
            <NewProjectDialog />
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-green-200 bg-gradient-to-br from-white to-green-50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-800">Proyectos Activos</CardTitle>
                <Building2 className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-900">12</div>
                <p className="text-xs text-green-600">+2 desde el mes pasado</p>
              </CardContent>
            </Card>
            <Card className="border-green-200 bg-gradient-to-br from-white to-green-50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-800">Presupuesto Total</CardTitle>
                <DollarSign className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-900">$45.2M</div>
                <p className="text-xs text-green-600">+15% desde el mes pasado</p>
              </CardContent>
            </Card>
            <Card className="border-green-200 bg-gradient-to-br from-white to-green-50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-800">En Revisión</CardTitle>
                <Clock className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-900">8</div>
                <p className="text-xs text-green-600">Pendientes de aprobación</p>
              </CardContent>
            </Card>
            <Card className="border-green-200 bg-gradient-to-br from-white to-green-50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-800">Completados</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-900">24</div>
                <p className="text-xs text-green-600">Este trimestre</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Recent Projects */}
            <Card className="border-green-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-green-900">Proyectos Recientes</CardTitle>
                  <Button variant="outline" size="sm" className="border-green-300 text-green-700 hover:bg-green-50">
                    Ver todos
                  </Button>
                </div>
                <CardDescription className="text-green-600">
                  Tus proyectos más recientes y su estado actual
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between space-x-4 p-3 rounded-lg border border-green-100 bg-green-50/30"
                  >
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none text-green-900">{project.name}</p>
                      <p className="text-sm text-green-700">{project.client}</p>
                      <div className="flex items-center gap-2">
                        <Badge
                          className={
                            project.status === "Aprobado"
                              ? "bg-green-100 text-green-800 border-green-300"
                              : project.status === "En progreso"
                                ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                                : "bg-blue-100 text-blue-800 border-blue-300"
                          }
                        >
                          {project.status}
                        </Badge>
                        <span className="text-xs text-green-600">{project.lastUpdate}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-green-900">${project.budget.toLocaleString()}</p>
                      <p className="text-xs text-green-600">{project.progress}% completado</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="hover:bg-green-100">
                          <MoreHorizontal className="h-4 w-4 text-green-600" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Ver detalles</DropdownMenuItem>
                        <DropdownMenuItem>Editar</DropdownMenuItem>
                        <DropdownMenuItem>Duplicar</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Templates Section */}
            <Card className="border-green-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-green-900">Plantillas de Presupuesto</CardTitle>
                  <Button variant="outline" size="sm" className="border-green-300 text-green-700 hover:bg-green-50">
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Plantilla
                  </Button>
                </div>
                <CardDescription className="text-green-600">
                  Plantillas predefinidas para acelerar tu trabajo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="flex items-center justify-between space-x-4 p-3 border border-green-200 rounded-lg hover:bg-green-50/50 transition-colors"
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium leading-none text-green-900">{template.name}</p>
                        <Badge variant="outline" className="text-xs border-green-300 text-green-700">
                          {template.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-green-700">{template.description}</p>
                      <p className="text-xs text-green-600">{template.items} elementos</p>
                    </div>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                      Usar Plantilla
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="text-green-900">Acciones Rápidas</CardTitle>
              <CardDescription className="text-green-600">
                Accede rápidamente a las funciones más utilizadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <NewProjectDialog />
                <Button
                  variant="outline"
                  className="h-20 flex-col gap-2 border-green-300 hover:bg-green-50 hover:border-green-400"
                >
                  <Calculator className="h-6 w-6 text-green-600" />
                  <span className="text-green-800">Crear Presupuesto</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex-col gap-2 border-green-300 hover:bg-green-50 hover:border-green-400"
                >
                  <FileText className="h-6 w-6 text-green-600" />
                  <span className="text-green-800">Importar Plantilla</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex-col gap-2 border-green-300 hover:bg-green-50 hover:border-green-400"
                >
                  <TrendingUp className="h-6 w-6 text-green-600" />
                  <span className="text-green-800">Ver Reportes</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
