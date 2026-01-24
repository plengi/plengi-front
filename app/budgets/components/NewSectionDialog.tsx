"use client"

import type React from "react"
import { useState } from "react"
import { FolderPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { BudgetSection } from "./types"

interface NewSectionDialogProps {
    onAddSection: (section: BudgetSection) => void
}

export default function NewSectionDialog({ onAddSection }: NewSectionDialogProps) {
    const [open, setOpen] = useState(false)
    const [sectionData, setSectionData] = useState({
        name: "",
        description: "",
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!sectionData.name.trim()) {
            alert("El nombre de la sección es obligatorio")
            return
        }

        const newSection: BudgetSection = {
            id: `section-${Date.now()}`, // ID temporal con timestamp
            name: sectionData.name,
            description: sectionData.description,
            order: Date.now(), // Esto será reemplazado por orden consecutivo
        }

        onAddSection(newSection)
        setSectionData({ name: "", description: "" })
        setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 border-green-300 text-green-700 hover:bg-green-50 bg-transparent">
                    <FolderPlus className="h-4 w-4" />
                    Nueva Sección
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-green-900">Crear Nueva Sección</DialogTitle>
                    <DialogDescription className="text-green-600">
                        Las secciones te permiten organizar los APUs por etapas o categorías.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="section-name" className="text-green-800">
                            Nombre de la Sección *
                        </Label>
                        <Input
                            id="section-name"
                            placeholder="Ej: Obras Preliminares, Estructura, Acabados"
                            value={sectionData.name}
                            onChange={(e) => setSectionData({ ...sectionData, name: e.target.value })}
                            className="border-green-200 focus:border-green-400 focus:ring-green-400"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="section-description" className="text-green-800">
                            Descripción
                        </Label>
                        <Input
                            id="section-description"
                            placeholder="Descripción opcional de la sección"
                            value={sectionData.description}
                            onChange={(e) => setSectionData({ ...sectionData, description: e.target.value })}
                            className="border-green-200 focus:border-green-400 focus:ring-green-400"
                        />
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
                        <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">
                            Crear Sección
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}