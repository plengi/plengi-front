"use client"

import {
    GripVertical,
    MoveVertical,
    ChevronUp,
    ChevronDown,
    Trash2,
    Edit,
    Package,
} from "lucide-react"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import EditSectionDialog from "@/app/budgets/components/EditSectionDialog"
import { BudgetData } from "../types"
import { formatPrice } from "."

interface BudgetSectionsCardProps {
    budgetData: BudgetData
    draggedAPU: string | null
    dragOverSection: string | null
    formatPrice: (price: string | number) => string;
    onUpdateSection: (sectionId: string, updates: any) => void
    onDeleteSection: (sectionId: string) => void
    onUpdateAPUQuantity: (apuId: string, quantity: number) => void
    onRemoveAPU: (apuId: string) => void
    onMoveAPUUp: (apuId: string, sectionId: string) => void
    onMoveAPUDown: (apuId: string, sectionId: string) => void
    onDragStart: (e: React.DragEvent, apuId: string) => void
    onDragOver: (e: React.DragEvent, sectionId: string) => void
    onDrop: (e: React.DragEvent, targetSectionId: string) => void
    onDragEnd: () => void
    onMoveAPUToSection: (apuId: string, targetSectionId: string) => void
}

export default function BudgetSectionsCard({
    budgetData,
    draggedAPU,
    dragOverSection,
    onUpdateSection,
    onDeleteSection,
    onUpdateAPUQuantity,
    onRemoveAPU,
    onMoveAPUUp,
    onMoveAPUDown,
    onDragStart,
    onDragOver,
    onDrop,
    onDragEnd,
    formatPrice,
    onMoveAPUToSection,
}: BudgetSectionsCardProps) {
    // Ordenar secciones
    const sortedSections = [...budgetData.sections].sort((a, b) => a.order - b.order)

    // Agrupar APUs por sección
    const apusBySection = sortedSections.map((section, sectionIndex) => {
        const sectionAPUs = budgetData.apus
            .filter((apu) => apu.sectionId === section.id)
            .sort((a, b) => a.order - b.order)

        return {
            section,
            sectionIndex: sectionIndex + 1,
            apus: sectionAPUs,
            total: sectionAPUs.reduce((sum, apu) => sum + apu.total, 0),
        }
    })

    return (
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
                                    className={`border rounded-lg overflow-hidden ${dragOverSection === section.id
                                            ? "border-green-400 bg-green-50/50"
                                            : "border-green-100"
                                        }`}
                                    onDragOver={(e) => onDragOver(e, section.id)}
                                    onDrop={(e) => onDrop(e, section.id)}
                                    onDragLeave={() => { }}
                                >
                                    {/* Encabezado de sección */}
                                    <div className="bg-green-100 px-4 py-3 border-b border-green-200">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Badge className="bg-green-700 text-white">{sectionIndex}</Badge>
                                                <div>
                                                    <h5 className="font-semibold text-green-800">{section.name}</h5>
                                                    {section.description && (
                                                        <p className="text-sm text-green-600">{section.description}</p>
                                                    )}
                                                </div>
                                                <EditSectionDialog
                                                    section={section}
                                                    onUpdateSection={onUpdateSection}
                                                    onDeleteSection={onDeleteSection}
                                                />
                                            </div>
                                            <div className="text-green-700 font-medium">
                                                Subtotal: {formatPrice(total)}
                                            </div>
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
                                                        className={`hover:bg-green-50/50 ${draggedAPU === apu.id ? "opacity-50" : ""
                                                            }`}
                                                        draggable
                                                        onDragStart={(e) => onDragStart(e, apu.id)}
                                                        onDragEnd={onDragEnd}
                                                    >
                                                        <TableCell className="font-medium text-green-900">
                                                            {sectionIndex}.{index + 1}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="cursor-move flex items-center justify-center">
                                                                <GripVertical className="h-4 w-4 text-green-400" />
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="font-medium text-green-900">
                                                            {apu.code}
                                                        </TableCell>
                                                        <TableCell className="font-medium text-green-900">
                                                            {apu.name}
                                                        </TableCell>
                                                        <TableCell>{apu.unit}</TableCell>
                                                        <TableCell>{formatPrice(apu.unitPrice)}</TableCell>
                                                        <TableCell>
                                                            <Input
                                                                type="number"
                                                                min="0.01"
                                                                step="0.01"
                                                                value={apu.quantity}
                                                                onChange={(e) =>
                                                                    onUpdateAPUQuantity(
                                                                        apu.id,
                                                                        Number.parseFloat(e.target.value) || 0
                                                                    )
                                                                }
                                                                className="w-20 h-8 text-sm border-green-200"
                                                            />
                                                        </TableCell>
                                                        <TableCell className="font-medium">
                                                            {formatPrice(apu.total)}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-1">
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger asChild>
                                                                        <Button
                                                                            type="button"
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            className="h-8 w-8 p-0"
                                                                        >
                                                                            <MoveVertical className="h-4 w-4 text-green-600" />
                                                                        </Button>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent align="end">
                                                                        {sortedSections
                                                                            .filter((s) => s.id !== section.id)
                                                                            .map((s, i) => (
                                                                                <DropdownMenuItem
                                                                                    key={s.id}
                                                                                    onClick={() => onMoveAPUToSection(apu.id, s.id)}
                                                                                >
                                                                                    Mover a {i + 1}. {s.name}
                                                                                </DropdownMenuItem>
                                                                            ))}
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => onMoveAPUUp(apu.id, section.id)}
                                                                    className="h-8 w-8 p-0"
                                                                    disabled={index === 0}
                                                                >
                                                                    <ChevronUp className="h-4 w-4 text-green-600" />
                                                                </Button>
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => onMoveAPUDown(apu.id, section.id)}
                                                                    className="h-8 w-8 p-0"
                                                                    disabled={index === apus.length - 1}
                                                                >
                                                                    <ChevronDown className="h-4 w-4 text-green-600" />
                                                                </Button>
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => onRemoveAPU(apu.id)}
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
                                                    <TableCell
                                                        colSpan={9}
                                                        className="text-center py-4 text-green-600"
                                                    >
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
    )
}