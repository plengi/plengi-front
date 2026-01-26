"use client"

import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Calculator } from "lucide-react"
import { BudgetData } from "../types"

interface BudgetInfoCardProps {
    budgetData: BudgetData
    setBudgetData: React.Dispatch<React.SetStateAction<BudgetData>>
}

export default function BudgetInfoCard({ budgetData, setBudgetData }: BudgetInfoCardProps) {
    return (
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
    )
}