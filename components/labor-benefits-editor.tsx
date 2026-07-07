// app/components/labor-benefits-editor.tsx

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Edit } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { getBenefitPercentage } from "@/lib/laborUtils";

interface LaborBenefitsEditorProps {
    laborId: string | number;
    laborName: string;
    baseSalary: number;
    currentBenefits: number;
    onUpdate: (newBenefits: number) => void;
    auxilioTransporte: number;
}

export function LaborBenefitsEditor({
    laborId,
    laborName,
    baseSalary,
    currentBenefits,
    onUpdate,
    auxilioTransporte,
}: LaborBenefitsEditorProps) {
    const [open, setOpen] = useState(false);
    const [benefits, setBenefits] = useState(currentBenefits);

    const handleSave = () => {
        onUpdate(benefits);
        setOpen(false);
    };

    // Calcular multiplicador (aproximado)
    const multiplier = baseSalary / 498100; // SMMLV fijo, pero idealmente tomar de configuración

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 px-2 text-green-700 hover:bg-green-100">
                    <Edit className="h-3 w-3 mr-1" />
                    {currentBenefits}%
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px] border-green-200">
                <DialogHeader>
                    <DialogTitle className="text-green-900">Editar Prestaciones</DialogTitle>
                    <DialogDescription className="text-green-600">
                        Ajusta el porcentaje de prestaciones para <strong>{laborName}</strong>
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="benefits-input" className="text-green-800">
                            Porcentaje de Prestaciones (%)
                        </Label>
                        <Input
                            id="benefits-input"
                            type="number"
                            step="0.01"
                            value={benefits}
                            onChange={(e) => setBenefits(Number(e.target.value))}
                            className="border-green-200 focus:border-green-400"
                        />
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded p-3 text-sm">
                        <p className="text-green-900">
                            Salario base: <strong>{formatCurrency(baseSalary)}</strong>
                        </p>
                        <p className="text-green-900">
                            Multiplicador SMMLV: <strong>{multiplier.toFixed(2)}x</strong>
                        </p>
                        <p className="text-green-700">
                            Prestaciones actuales: <strong>{currentBenefits}%</strong>
                        </p>
                        <p className="text-green-700 mt-1">
                            Jornal con prestaciones:{' '}
                            <strong>
                                {formatCurrency(
                                    Math.round((baseSalary / 30) * (1 + benefits / 100))
                                )}
                            </strong>
                        </p>
                        {multiplier <= 2 && (
                            <p className="text-xs text-green-600 mt-1">
                                * Aplica auxilio de transporte: {formatCurrency(auxilioTransporte)}
                            </p>
                        )}
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setOpen(false)}
                        className="border-green-300 text-green-700 hover:bg-green-50"
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSave}
                        className="bg-green-600 hover:bg-green-700 text-white"
                    >
                        Guardar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}