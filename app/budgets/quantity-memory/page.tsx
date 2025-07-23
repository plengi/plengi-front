"use client"

import { Building2, Calculator, ClipboardList, Home, Search, Bell, User, ArrowLeft, Plus } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// --- Example Data Structures (mimicking QuantityJustificationDialog output) ---

const exampleJustifications = [
  {
    apuName: "Excavación de Zanjas",
    newQuantity: 150.75,
    justification: {
      text: "Cálculo basado en la suma de longitudes de zanjas para cimentación y drenaje, con un factor de esponjamiento del 1.25.",
      imageUrl: "/placeholder.svg?height=300&width=400",
      calculation: {
        mode: "sum",
        details: {
          items: [
            { id: "1", name: "Zanja Cimentación L1", value: 50 },
            { id: "2", name: "Zanja Cimentación L2", value: 40 },
            { id: "3", name: "Zanja Drenaje Principal", value: 30 },
            { id: "4", name: "Zanja Drenaje Secundario", value: 20 },
          ],
        },
        result: 140, // Sum of values
      },
    },
  },
  {
    apuName: "Muro de Concreto Armado",
    newQuantity: 25.5,
    justification: {
      text: "Cálculo de volumen para muro perimetral de 0.20m de espesor.",
      imageUrl: null,
      calculation: {
        mode: "volume",
        details: {
          items: [
            { id: "v1", name: "Muro Sección A", length: 10, width: 0.2, height: 2.5 },
            { id: "v2", name: "Muro Sección B", length: 8, width: 0.2, height: 2.5 },
            { id: "v3", name: "Muro Sección C", length: 7.5, width: 0.2, height: 2.5 },
          ],
        },
        result: 12.75, // Sum of volumes
      },
    },
  },
  {
    apuName: "Losa de Entrepiso",
    newQuantity: 120.0,
    justification: {
      text: "Área total de losa de entrepiso para nivel 2 y 3.",
      imageUrl: "/placeholder.svg?height=200&width=300",
      calculation: {
        mode: "area",
        details: {
          items: [
            { id: "a1", name: "Losa Nivel 2", length: 10, width: 6 },
            { id: "a2", name: "Losa Nivel 3", length: 10, width: 6 },
          ],
        },
        result: 120, // Sum of areas
      },
    },
  },
  {
    apuName: "Acero de Refuerzo Ø12mm",
    newQuantity: 850.2, // kg
    justification: {
      text: "Cálculo de acero para vigas y columnas principales.",
      imageUrl: null,
      calculation: {
        mode: "rebar",
        details: {
          items: [
            { id: "r1", name: "Viga Principal V1", diameter: 12, length: 8, quantity: 4 },
            { id: "r2", name: "Columna C1", diameter: 12, length: 3, quantity: 6 },
            { id: "r3", name: "Viga Secundaria V2", diameter: 12, length: 6, quantity: 3 },
          ],
        },
        // Example calculation for rebar: (diameter_mm^2 / 162.2) * length_m * quantity_bars
        // For r1: (12*12/162.2) * 8 * 4 = 35.51 kg
        // For r2: (12*12/162.2) * 3 * 6 = 16.88 kg
        // For r3: (12*12/162.2) * 6 * 3 = 12.96 kg
        // Total: 35.51 + 16.88 + 12.96 = 65.35 kg (This is just an example, actual sum would be done by the dialog)
        result: 65.35, // Placeholder for calculated result
      },
    },
  },
  {
    apuName: "Relleno Compactado",
    newQuantity: 50.0,
    justification: {
      text: "Cantidad estimada para relleno de sub-base de pavimento.",
      imageUrl: null,
      calculation: {
        mode: "manual",
        details: {
          quantity: 50.0,
        },
        result: 50.0,
      },
    },
  },
]

// Sidebar menu items (copied from budgets-page.tsx for consistency)
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
    icon: ClipboardList, // Using ClipboardList for templates as well
  },
  {
    title: "Clientes",
    url: "#",
    icon: User,
  },
  {
    title: "Configuración",
    url: "#",
    icon: Calculator, // Using Calculator as a placeholder for settings icon
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

export default function QuantityMemoryPage() {
  const renderCalculationDetails = (calculation: any) => {
    if (!calculation || calculation.mode === "manual") {
      return (
        <p className="text-sm text-green-700">
          Cantidad ingresada manualmente: <span className="font-semibold">{calculation?.details?.quantity || 0}</span>
        </p>
      )
    }

    if (calculation.mode === "sum") {
      return (
        <div className="space-y-2">
          <h4 className="font-semibold text-green-800">Suma de Valores:</h4>
          {calculation.details.items.map((item: any) => (
            <div key={item.id} className="flex justify-between text-sm text-green-700">
              <span>{item.name}:</span>
              <span className="font-medium">{item.value}</span>
            </div>
          ))}
          <div className="flex justify-between font-bold text-green-900 pt-2 border-t border-green-100">
            <span>Subtotal:</span>
            <span>{calculation.result.toFixed(2)}</span>
          </div>
        </div>
      )
    }

    if (calculation.mode === "area") {
      return (
        <div className="space-y-2">
          <h4 className="font-semibold text-green-800">Cálculo de Área:</h4>
          {calculation.details.items.map((item: any) => (
            <div key={item.id} className="grid grid-cols-3 gap-2 text-sm text-green-700">
              <span className="font-medium">{item.name}:</span>
              <span>
                {item.length}m x {item.width}m
              </span>
              <span className="text-right font-medium">{(item.length * item.width).toFixed(2)} m²</span>
            </div>
          ))}
          <div className="flex justify-between font-bold text-green-900 pt-2 border-t border-green-100">
            <span>Subtotal:</span>
            <span>{calculation.result.toFixed(2)} m²</span>
          </div>
        </div>
      )
    }

    if (calculation.mode === "volume") {
      return (
        <div className="space-y-2">
          <h4 className="font-semibold text-green-800">Cálculo de Volumen:</h4>
          {calculation.details.items.map((item: any) => (
            <div key={item.id} className="grid grid-cols-4 gap-2 text-sm text-green-700">
              <span className="font-medium">{item.name}:</span>
              <span>
                {item.length}m x {item.width}m x {item.height}m
              </span>
              <span className="text-right font-medium">{(item.length * item.width * item.height).toFixed(2)} m³</span>
            </div>
          ))}
          <div className="flex justify-between font-bold text-green-900 pt-2 border-t border-green-100">
            <span>Subtotal:</span>
            <span>{calculation.result.toFixed(2)} m³</span>
          </div>
        </div>
      )
    }

    if (calculation.mode === "rebar") {
      return (
        <div className="space-y-2">
          <h4 className="font-semibold text-green-800">Cálculo de Acero (Varillas):</h4>
          {calculation.details.items.map((item: any) => {
            const weightPerMeter = (item.diameter * item.diameter) / 162.2
            const itemWeight = weightPerMeter * (item.length || 0) * (item.quantity || 0)
            return (
              <div key={item.id} className="grid grid-cols-4 gap-2 text-sm text-green-700">
                <span className="font-medium">{item.name}:</span>
                <span>
                  Ø{item.diameter}mm x {item.length}m x {item.quantity}u
                </span>
                <span className="text-right font-medium">{itemWeight.toFixed(2)} kg</span>
              </div>
            )
          })}
          <div className="flex justify-between font-bold text-green-900 pt-2 border-t border-green-100">
            <span>Subtotal:</span>
            <span>{calculation.result.toFixed(2)} kg</span>
          </div>
        </div>
      )
    }

    return null
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
                placeholder="Buscar..."
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
              <h1 className="text-3xl font-bold tracking-tight text-green-900">Memoria de Cantidades</h1>
              <p className="text-green-700">Visualiza los análisis de justificación de cantidades de tus APUs.</p>
            </div>
            <Link href="/budgets">
              <Button
                variant="outline"
                className="gap-2 border-green-300 text-green-700 hover:bg-green-50 bg-transparent"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver a Presupuestos
              </Button>
            </Link>
          </div>

          {/* Justification Examples */}
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
            {exampleJustifications.map((example, index) => (
              <Card key={index} className="border-green-200 bg-gradient-to-br from-white to-green-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-green-900 flex items-center gap-2 text-lg">
                    <ClipboardList className="h-5 w-5 text-green-600" />
                    {example.apuName}
                  </CardTitle>
                  <CardDescription className="text-green-600">
                    Cantidad Justificada:{" "}
                    <span className="font-bold text-green-800">{example.newQuantity.toFixed(2)}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {example.justification.text && (
                    <div className="space-y-1">
                      <Label className="text-green-800">Observaciones:</Label>
                      <p className="text-sm text-green-700">{example.justification.text}</p>
                    </div>
                  )}

                  {example.justification.imageUrl && (
                    <div className="space-y-1">
                      <Label className="text-green-800">Imagen de Referencia:</Label>
                      <div className="relative w-full h-48 border border-green-200 rounded-md overflow-hidden">
                        <Image
                          src={example.justification.imageUrl || "/placeholder.svg"}
                          alt={`Imagen para ${example.apuName}`}
                          layout="fill"
                          objectFit="contain"
                        />
                      </div>
                    </div>
                  )}

                  {example.justification.calculation && (
                    <div className="space-y-2">
                      <Label className="text-green-800">Detalles del Cálculo:</Label>
                      {renderCalculationDetails(example.justification.calculation)}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {exampleJustifications.length === 0 && (
            <Card className="border-green-200">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <ClipboardList className="h-12 w-12 text-green-400 mb-4" />
                <h3 className="text-lg font-medium text-green-900 mb-2">No hay memorias de cantidades para mostrar</h3>
                <p className="text-green-600 text-center mb-4">
                  Crea un nuevo presupuesto y justifica las cantidades de tus APUs para verlas aquí.
                </p>
                <Link href="/budgets/new">
                  <Button className="bg-green-600 hover:bg-green-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Nuevo Presupuesto
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
