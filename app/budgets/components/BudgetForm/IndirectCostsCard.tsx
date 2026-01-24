"use client"

import { Percent } from "lucide-react"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { BudgetData } from "../types"
import { formatPrice } from "."

interface IndirectCostsCardProps {
    budgetData: BudgetData
    formatPrice: (price: string | number) => string;
    onUpdateIndirectCostPercentage: (costId: string, percentage: number) => void
}

export default function IndirectCostsCard({
    budgetData,
    formatPrice,
    onUpdateIndirectCostPercentage,
}: IndirectCostsCardProps) {
    return (
        <Card className="border-green-200">
            <CardHeader>
                <CardTitle className="text-green-900 flex items-center gap-2">
                    <Percent className="h-5 w-5 text-green-600" />
                    Costos Indirectos
                </CardTitle>
                <CardDescription className="text-green-600">
                    Configura los porcentajes de administración, imprevistos y utilidad.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {budgetData.indirectCosts.map((cost) => (
                        <div
                            key={cost.id}
                            className="flex items-center justify-between p-4 border border-green-100 rounded-lg bg-green-50/30"
                        >
                            <div className="flex-1">
                                <h6 className="font-medium text-green-900">{cost.name}</h6>
                                <p className="text-sm text-green-600">{cost.percentage}% sobre costo directo</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="0.1"
                                        value={cost.percentage}
                                        onChange={(e) =>
                                            onUpdateIndirectCostPercentage(
                                                cost.id,
                                                Number.parseFloat(e.target.value) || 0
                                            )
                                        }
                                        className="w-20 h-8 text-sm border-green-200"
                                    />
                                    <span className="text-green-700">%</span>
                                </div>
                                <div className="text-right min-w-[120px]">
                                    <div className="font-medium text-green-900">{formatPrice(cost.amount)}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}