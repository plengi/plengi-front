"use client";

import { useState } from "react";
import { BarChart3, Plus, Search, Loader } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import NewSectionDialog from "@/app/budgets/components/NewSectionDialog";
import { BudgetData, ApiApu, BudgetSection } from "../types";
import { formatPrice } from ".";

interface AddApuCardProps {
    budgetData: BudgetData;
    selectedSection: string;
    setSelectedSection: (sectionId: string) => void;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    filteredAPUs: ApiApu[];
    loading: boolean;
    onAddSection: (section: BudgetSection) => void;
    onAddAPU: (apu: ApiApu) => void;
    onLoadMore: () => void;
}

export default function AddApuCard({
    budgetData,
    selectedSection,
    setSelectedSection,
    searchTerm,
    setSearchTerm,
    filteredAPUs,
    loading,
    onAddSection,
    onAddAPU,
    onLoadMore,
}: AddApuCardProps) {
    const sortedSections = [...budgetData.sections].sort(
        (a, b) => a.order - b.order,
    );

    return (
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
                            <Select
                                value={selectedSection}
                                onValueChange={setSelectedSection}
                            >
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
                            <NewSectionDialog onAddSection={onAddSection} />
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
                {loading ? (
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
                                    <TableHead className="text-green-800 w-[80px]">
                                        Acción
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredAPUs.map((apu) => (
                                    <TableRow key={apu.id} className="hover:bg-green-50/50">
                                        <TableCell className="font-medium text-green-900">
                                            {apu.codigo}
                                        </TableCell>
                                        <TableCell className="font-medium text-green-900">
                                            {apu.nombre}
                                        </TableCell>
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
                                                onClick={() => onAddAPU(apu)}
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
                                onClick={onLoadMore}
                                disabled={loading}
                                className="text-green-600 hover:bg-green-100"
                            >
                                {loading ? "Cargando..." : "Cargar más resultados"}
                            </Button>
                        </div>
                    </div>
                ) : searchTerm && !loading && filteredAPUs.length === 0 ? (
                    <div className="text-center py-3 text-green-600 bg-green-50/50 rounded-lg border border-green-100">
                        No se encontraron APUs que coincidan con la búsqueda
                    </div>
                ) : null}
            </CardContent>
        </Card>
    );
}
