"use client"

import type React from "react"
import { useState } from "react"
import { Edit, Trash2 } from "lucide-react"
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

interface EditSectionDialogProps {
    section: BudgetSection
    onUpdateSection: (sectionId: string, updates: Partial<BudgetSection>) => void
    onDeleteSection: (sectionId: string) => void
}

export default function EditSectionDialog({
    section,
    onUpdateSection,
    onDeleteSection,
}: EditSectionDialogProps) {
    const [open, setOpen] = useState(false)
    const [sectionData, setSectionData] = useState({
        name: section.name,
        description: section.description || "",
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!sectionData.name.trim()) {
            alert("El nombre de la sección es obligatorio")
            return
        }

        onUpdateSection(section.id, {
            name: sectionData.name,
            description: sectionData.description,
        })
        setOpen(false)
    }

    const handleDelete = () => {
        if (
            confirm("¿Estás seguro de que quieres eliminar esta sección? Los APUs se moverán a la sección 'Preliminares'.")
        ) {
            onDeleteSection(section.id)
            setOpen(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Edit className="h-4 w-4 text-green-600" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-green-900">Editar Sección</DialogTitle>
                    <DialogDescription className="text-green-600">
                        Modifica los datos de la sección o elimínala si ya no la necesitas.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="edit-section-name" className="text-green-800">
                            Nombre de la Sección *
                        </Label>
                        <Input
                            id="edit-section-name"
                            value={sectionData.name}
                            onChange={(e) => setSectionData({ ...sectionData, name: e.target.value })}
                            className="border-green-200 focus:border-green-400 focus:ring-green-400"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edit-section-description" className="text-green-800">
                            Descripción
                        </Label>
                        <Input
                            id="edit-section-description"
                            value={sectionData.description}
                            onChange={(e) => setSectionData({ ...sectionData, description: e.target.value })}
                            className="border-green-200 focus:border-green-400 focus:ring-green-400"
                        />
                    </div>
                    <DialogFooter className="flex justify-between">
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={section.id === "preliminares"}
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar
                        </Button>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setOpen(false)}
                                className="border-green-300 text-green-700 hover:bg-green-50"
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">
                                Guardar
                            </Button>
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}