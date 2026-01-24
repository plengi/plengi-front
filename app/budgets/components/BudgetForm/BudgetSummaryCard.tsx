"use client"

import { DollarSign } from "lucide-react"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { BudgetData } from "../types"
import { formatPrice } from "."

interface BudgetSummaryCardProps {
    budgetData: BudgetData,
    formatPrice: (price: string | number) => string;
}

export default function BudgetSummaryCard({
    budgetData,
    formatPrice,
}: BudgetSummaryCardProps) {
    return (
        <Card className="border-green-200 bg-gradient-to-br from-green-50/50 to-white">
            <CardHeader>
                <CardTitle className="text-green-900 flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    Resumen del Presupuesto
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-green-100">
                        <span className="text-green-800 font-medium">Costo Directo Total:</span>
                        <span className="text-lg font-semibold text-green-900">
                            {formatPrice(budgetData.directTotal)}
                        </span>
                    </div>

                    {budgetData.indirectCosts.map((cost) => (
                        <div key={cost.id} className="flex justify-between items-center py-1">
                            <span className="text-green-700">
                                {cost.name} ({cost.percentage}%):
                            </span>
                            <span className="font-medium text-green-800">{formatPrice(cost.amount)}</span>
                        </div>
                    ))}

                    <Separator className="bg-green-200" />

                    <div className="flex justify-between items-center py-2">
                        <span className="text-green-800 font-medium">Total Costos Indirectos:</span>
                        <span className="text-lg font-semibold text-green-900">
                            {formatPrice(budgetData.indirectTotal)}
                        </span>
                    </div>

                    <Separator className="bg-green-300" />

                    <div className="flex justify-between items-center py-3 bg-green-100 px-4 rounded-lg">
                        <span className="text-xl font-bold text-green-900">TOTAL PRESUPUESTO:</span>
                        <span className="text-2xl font-bold text-green-900">
                            {formatPrice(budgetData.grandTotal)}
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}