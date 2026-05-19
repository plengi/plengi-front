"use client"

import { ArrowLeft, Package, MapPin } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SidebarTrigger } from "@/components/ui/sidebar"

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

const budgetDetailsData: Record<string, any> = {
  "1": {
    id: 1,
    name: "Estructura y Cimentación",
    client: "Constructora Los Pinos S.A.",
    project: {
      name: "Edificio Residencial Los Pinos",
      location: "Av. Principal 123, Santiago",
    },
    supplies: {
      materials: [
        {
          id: "mat-1",
          name: "Cemento Portland tipo I",
          unit: "kg",
          quantity: 45000,
          unitPrice: 85,
          total: 3825000,
        },
        {
          id: "mat-2",
          name: "Arena Silícea",
          unit: "m³",
          quantity: 120,
          unitPrice: 35000,
          total: 4200000,
        },
        {
          id: "mat-3",
          name: "Grava 3/4",
          unit: "m³",
          quantity: 150,
          unitPrice: 32000,
          total: 4800000,
        },
        {
          id: "mat-4",
          name: "Acero de Refuerzo A630-420H",
          unit: "kg",
          quantity: 2500,
          unitPrice: 1200,
          total: 3000000,
        },
      ],
      equipment: [
        {
          id: "eq-1",
          name: "Excavadora CAT 320",
          unit: "día",
          quantity: 30,
          unitPrice: 250000,
          total: 7500000,
        },
        {
          id: "eq-2",
          name: "Hormigonera 9 bolsas",
          unit: "día",
          quantity: 45,
          unitPrice: 80000,
          total: 3600000,
        },
        {
          id: "eq-3",
          name: "Vibrador de Hormigón",
          unit: "día",
          quantity: 50,
          unitPrice: 35000,
          total: 1750000,
        },
      ],
      labor: [
        {
          id: "lab-1",
          name: "Capataz Obra",
          unit: "día",
          quantity: 150,
          unitPrice: 95000,
          total: 14250000,
        },
        {
          id: "lab-2",
          name: "Operario Especializado",
          unit: "día",
          quantity: 300,
          unitPrice: 65000,
          total: 19500000,
        },
        {
          id: "lab-3",
          name: "Peón",
          unit: "día",
          quantity: 400,
          unitPrice: 45000,
          total: 18000000,
        },
      ],
      transport: [
        {
          id: "tr-1",
          name: "Transporte de Materiales",
          unit: "viaje",
          quantity: 80,
          unitPrice: 125000,
          total: 10000000,
        },
        {
          id: "tr-2",
          name: "Flete de Hormigón",
          unit: "m³",
          quantity: 80,
          unitPrice: 15000,
          total: 1200000,
        },
      ],
    },
  },
}

export default function SuppliesPage({ params }: { params: { id: string } }) {
  const budget = budgetDetailsData[params.id]

  if (!budget) {
    return <div className="p-6">Presupuesto no encontrado</div>
  }

  const supplies = budget.supplies || {
    materials: [],
    equipment: [],
    labor: [],
    transport: [],
  }

  const calculateTotal = (items: any[]) => items.reduce((sum, item) => sum + item.total, 0)
  const calculateGrandTotal = () =>
    calculateTotal(supplies.materials) +
    calculateTotal(supplies.equipment) +
    calculateTotal(supplies.labor) +
    calculateTotal(supplies.transport)

  return (
    <>
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-blue-100 px-4 bg-gradient-to-r from-blue-50 to-white">
        <SidebarTrigger className="-ml-1 text-blue-600 hover:bg-blue-100" />
        <div className="flex flex-1 items-center gap-4">
          <Link href={`/budgets/${params.id}`}>
            <Button variant="outline" size="icon" className="h-8 w-8 border-blue-200 bg-transparent">
              <ArrowLeft className="h-4 w-4 text-blue-600" />
            </Button>
          </Link>
          <div>
            <h1 className="text-lg font-semibold text-blue-900">Insumos del Presupuesto</h1>
            <p className="text-sm text-blue-600">{budget.name}</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 space-y-6 p-6 bg-gradient-to-br from-blue-50/30 to-white">
        {/* Info Card */}
        <Card className="border-blue-200 bg-white">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">Empresa</h3>
                <p className="text-lg font-semibold text-blue-900">{budget.client}</p>
              </div>
              <div>
                <h3 className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">Proyecto</h3>
                <p className="text-sm font-semibold text-blue-900">{budget.project.name}</p>
                <p className="text-sm text-blue-700 flex items-center gap-1 mt-1">
                  <MapPin className="h-3 w-3" />
                  {budget.project.location}
                </p>
              </div>
              <div>
                <h3 className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">Total Insumos</h3>
                <p className="text-lg font-bold text-blue-900">{formatPrice(calculateGrandTotal())}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="materials" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-blue-50 p-1">
            <TabsTrigger value="materials" className="text-xs sm:text-sm">
              Materiales
            </TabsTrigger>
            <TabsTrigger value="equipment" className="text-xs sm:text-sm">
              Equipo
            </TabsTrigger>
            <TabsTrigger value="labor" className="text-xs sm:text-sm">
              Mano de Obra
            </TabsTrigger>
            <TabsTrigger value="transport" className="text-xs sm:text-sm">
              Transporte
            </TabsTrigger>
          </TabsList>

          <TabsContent value="materials" className="mt-6">
            <SupplyTabContent
              supplies={supplies.materials}
              title="Materiales"
              color="blue"
            />
          </TabsContent>

          <TabsContent value="equipment" className="mt-6">
            <SupplyTabContent
              supplies={supplies.equipment}
              title="Equipo"
              color="blue"
            />
          </TabsContent>

          <TabsContent value="labor" className="mt-6">
            <SupplyTabContent
              supplies={supplies.labor}
              title="Mano de Obra"
              color="blue"
            />
          </TabsContent>

          <TabsContent value="transport" className="mt-6">
            <SupplyTabContent
              supplies={supplies.transport}
              title="Transporte"
              color="blue"
            />
          </TabsContent>
        </Tabs>

        {/* Grand Total Summary */}
        <Card className="border-blue-300 bg-blue-50">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-blue-600 font-semibold uppercase">Materiales</p>
                <p className="text-lg font-bold text-blue-900 mt-1">
                  {formatPrice(calculateTotal(supplies.materials))}
                </p>
              </div>
              <div>
                <p className="text-xs text-blue-600 font-semibold uppercase">Equipo</p>
                <p className="text-lg font-bold text-blue-900 mt-1">
                  {formatPrice(calculateTotal(supplies.equipment))}
                </p>
              </div>
              <div>
                <p className="text-xs text-blue-600 font-semibold uppercase">Mano de Obra</p>
                <p className="text-lg font-bold text-blue-900 mt-1">
                  {formatPrice(calculateTotal(supplies.labor))}
                </p>
              </div>
              <div className="border-t md:border-t-0 md:border-l border-blue-300 pt-4 md:pt-0 md:pl-4">
                <p className="text-xs text-blue-700 font-bold uppercase">Total General</p>
                <p className="text-2xl font-bold text-blue-900 mt-1">
                  {formatPrice(calculateGrandTotal())}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  )
}

function SupplyTabContent({ supplies, title, color }: { supplies: any[]; title: string; color: string }) {
  const colorClass = `bg-${color}-50`
  const total = supplies.reduce((sum, item) => sum + item.total, 0)

  return (
    <div className="space-y-4">
      <Card className={`border-${color}-200`}>
        <CardHeader>
          <CardTitle className={`text-${color}-900 flex items-center gap-2`}>
            <Package className={`h-5 w-5 text-${color}-600`} />
            {title}
          </CardTitle>
          <CardDescription>Detalle de {title.toLowerCase()}</CardDescription>
        </CardHeader>
        <CardContent>
          {supplies && supplies.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className={colorClass}>
                      <TableHead className={`text-${color}-800`}>Descripción</TableHead>
                      <TableHead className={`text-${color}-800`}>Unidad</TableHead>
                      <TableHead className={`text-${color}-800 text-right`}>Cantidad</TableHead>
                      <TableHead className={`text-${color}-800 text-right`}>Precio Unit.</TableHead>
                      <TableHead className={`text-${color}-800 text-right`}>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {supplies.map((supply: any) => (
                      <TableRow key={supply.id} className={`hover:${colorClass}`}>
                        <TableCell className={`font-medium text-${color}-900`}>{supply.name}</TableCell>
                        <TableCell>{supply.unit}</TableCell>
                        <TableCell className="text-right">{supply.quantity.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{formatPrice(supply.unitPrice)}</TableCell>
                        <TableCell className={`text-right font-medium text-${color}-900`}>
                          {formatPrice(supply.total)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className={`mt-4 p-4 rounded-lg bg-${color}-100 border border-${color}-300 text-right`}>
                <p className={`text-sm text-${color}-700 font-semibold`}>Subtotal {title}</p>
                <p className={`text-2xl font-bold text-${color}-900 mt-1`}>{formatPrice(total)}</p>
              </div>
            </>
          ) : (
            <div className={`text-center py-8 text-${color}-600`}>
              <p>No hay {title.toLowerCase()} disponibles</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
