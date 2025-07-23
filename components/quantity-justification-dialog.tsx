"use client"

import { useState, useEffect, type ChangeEvent, useCallback } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"
import { Plus, X, Calculator } from "lucide-react"

type CalcMode = "manual" | "sum" | "area" | "volume" | "rebar"

interface SumItem {
  id: string
  name: string
  value: number
}

interface AreaItem {
  id: string
  name: string
  length: number
  width: number
}

interface VolumeItem {
  id: string
  name: string
  length: number
  width: number
  height: number
}

interface RebarItem {
  id: string
  name: string
  diameter: number // in mm
  length: number // in meters
  quantity: number // number of bars
}

interface Props {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  apuName: string
  initialQuantity: number
  onSave: (newQuantity: number, justification: { text: string; imageUrl: string | null; calculation: any }) => void
}

/**
 * QuantityJustificationDialog
 *
 * Allows the user to justify the quantity of an APU by
 * 1. Writing a note
 * 2. Uploading an image (preview only, not persisted)
 * 3. Calculating the quantity (sum, area, volume, rebar)
 */
export function QuantityJustificationDialog({ isOpen, onOpenChange, apuName, initialQuantity, onSave }: Props) {
  const [calcMode, setCalcMode] = useState<CalcMode>("manual")
  const [manualQuantity, setManualQuantity] = useState<number>(initialQuantity)
  const [sumItems, setSumItems] = useState<SumItem[]>([])
  const [areaItems, setAreaItems] = useState<AreaItem[]>([])
  const [volumeItems, setVolumeItems] = useState<VolumeItem[]>([])
  const [rebarItems, setRebarItems] = useState<RebarItem[]>([])

  const [result, setResult] = useState<number>(initialQuantity)
  const [note, setNote] = useState("")
  const [image, setImage] = useState<string | null>(null)

  // Reset state when dialog opens or initialQuantity changes
  useEffect(() => {
    setManualQuantity(initialQuantity)
    setSumItems([{ id: crypto.randomUUID(), name: "Elemento 1", value: 0 }])
    setAreaItems([{ id: crypto.randomUUID(), name: "Área 1", length: 0, width: 0 }])
    setVolumeItems([{ id: crypto.randomUUID(), name: "Volumen 1", length: 0, width: 0, height: 0 }])
    setRebarItems([{ id: crypto.randomUUID(), name: "Varilla 1", diameter: 0, length: 0, quantity: 0 }])
    setCalcMode("manual")
    setResult(initialQuantity)
    setNote("")
    setImage(null)
  }, [isOpen, initialQuantity])

  const calculateCurrentResult = useCallback(() => {
    let qty = 0
    switch (calcMode) {
      case "manual":
        qty = manualQuantity
        break
      case "sum":
        qty = sumItems.reduce((s, item) => s + (item.value || 0), 0)
        break
      case "area":
        qty = areaItems.reduce((s, item) => s + (item.length || 0) * (item.width || 0), 0)
        break
      case "volume":
        qty = volumeItems.reduce((s, item) => s + (item.length || 0) * (item.width || 0) * (item.height || 0), 0)
        break
      case "rebar":
        // Formula: weight_per_meter = (diameter_mm^2 / 162.2)
        // total_weight = weight_per_meter * length_m * quantity_bars
        qty = rebarItems.reduce((s, item) => {
          const weightPerMeter = (item.diameter * item.diameter) / 162.2
          return s + weightPerMeter * (item.length || 0) * (item.quantity || 0)
        }, 0)
        break
      default:
        qty = initialQuantity
        break
    }
    setResult(Number.isFinite(qty) ? qty : 0)
  }, [calcMode, manualQuantity, sumItems, areaItems, volumeItems, rebarItems, initialQuantity])

  useEffect(() => {
    calculateCurrentResult()
  }, [calculateCurrentResult])

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setImage(url)
  }

  const handleRemoveImage = () => {
    if (image) {
      URL.revokeObjectURL(image)
    }
    setImage(null)
  }

  // --- Sum Calculation Handlers ---
  const handleAddSumItem = () => {
    setSumItems((prev) => [...prev, { id: crypto.randomUUID(), name: `Elemento ${prev.length + 1}`, value: 0 }])
  }

  const handleUpdateSumItem = (id: string, field: keyof SumItem, value: string | number) => {
    setSumItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: typeof value === "string" ? value : value } : item)),
    )
  }

  const handleRemoveSumItem = (id: string) => {
    setSumItems((prev) => prev.filter((item) => item.id !== id))
  }

  // --- Area Calculation Handlers ---
  const handleAddAreaItem = () => {
    setAreaItems((prev) => [...prev, { id: crypto.randomUUID(), name: `Área ${prev.length + 1}`, length: 0, width: 0 }])
  }

  const handleUpdateAreaItem = (id: string, field: keyof AreaItem, value: string | number) => {
    setAreaItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: typeof value === "string" ? value : value } : item)),
    )
  }

  const handleRemoveAreaItem = (id: string) => {
    setAreaItems((prev) => prev.filter((item) => item.id !== id))
  }

  // --- Volume Calculation Handlers ---
  const handleAddVolumeItem = () => {
    setVolumeItems((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: `Volumen ${prev.length + 1}`, length: 0, width: 0, height: 0 },
    ])
  }

  const handleUpdateVolumeItem = (id: string, field: keyof VolumeItem, value: string | number) => {
    setVolumeItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: typeof value === "string" ? value : value } : item)),
    )
  }

  const handleRemoveVolumeItem = (id: string) => {
    setVolumeItems((prev) => prev.filter((item) => item.id !== id))
  }

  // --- Rebar Calculation Handlers ---
  const handleAddRebarItem = () => {
    setRebarItems((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: `Varilla ${prev.length + 1}`, diameter: 0, length: 0, quantity: 0 },
    ])
  }

  const handleUpdateRebarItem = (id: string, field: keyof RebarItem, value: string | number) => {
    setRebarItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: typeof value === "string" ? value : value } : item)),
    )
  }

  const handleRemoveRebarItem = (id: string) => {
    setRebarItems((prev) => prev.filter((item) => item.id !== id))
  }

  const handleSave = () => {
    onSave(result, {
      text: note,
      imageUrl: image,
      calculation: {
        mode: calcMode,
        details:
          calcMode === "manual"
            ? { quantity: manualQuantity }
            : calcMode === "sum"
              ? { items: sumItems }
              : calcMode === "area"
                ? { items: areaItems }
                : calcMode === "volume"
                  ? { items: volumeItems }
                  : calcMode === "rebar"
                    ? { items: rebarItems }
                    : {},
        result: result,
      },
    })
    onOpenChange(false)
  }

  const renderCalculationInputs = () => {
    switch (calcMode) {
      case "manual":
        return (
          <div className="space-y-2">
            <Label htmlFor="manual-quantity">Cantidad Manual</Label>
            <Input
              id="manual-quantity"
              type="number"
              min="0"
              step="0.01"
              value={manualQuantity}
              onChange={(e) => setManualQuantity(Number.parseFloat(e.target.value) || 0)}
            />
          </div>
        )
      case "sum":
        return (
          <div className="space-y-4">
            {sumItems.map((item, index) => (
              <div key={item.id} className="flex items-end gap-2 border p-3 rounded-md bg-green-50/30">
                <div className="flex-1 space-y-1">
                  <Label htmlFor={`sum-name-${item.id}`} className="text-sm">
                    Nombre del Elemento
                  </Label>
                  <Input
                    id={`sum-name-${item.id}`}
                    value={item.name}
                    onChange={(e) => handleUpdateSumItem(item.id, "name", e.target.value)}
                    placeholder={`Elemento ${index + 1}`}
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <Label htmlFor={`sum-value-${item.id}`} className="text-sm">
                    Valor
                  </Label>
                  <Input
                    id={`sum-value-${item.id}`}
                    type="number"
                    step="0.01"
                    value={item.value}
                    onChange={(e) => handleUpdateSumItem(item.id, "value", Number.parseFloat(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => handleRemoveSumItem(item.id)}
                  disabled={sumItems.length === 1}
                >
                  <X className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddSumItem}
              className="gap-1 bg-transparent"
            >
              <Plus className="h-4 w-4" /> Añadir Elemento
            </Button>
          </div>
        )
      case "area":
        return (
          <div className="space-y-4">
            {areaItems.map((item, index) => (
              <div
                key={item.id}
                className="grid grid-cols-[1fr_1fr_1fr_auto] items-end gap-2 border p-3 rounded-md bg-green-50/30"
              >
                <div className="space-y-1">
                  <Label htmlFor={`area-name-${item.id}`} className="text-sm">
                    Nombre del Elemento
                  </Label>
                  <Input
                    id={`area-name-${item.id}`}
                    value={item.name}
                    onChange={(e) => handleUpdateAreaItem(item.id, "name", e.target.value)}
                    placeholder={`Área ${index + 1}`}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`area-length-${item.id}`} className="text-sm">
                    Largo
                  </Label>
                  <Input
                    id={`area-length-${item.id}`}
                    type="number"
                    step="0.01"
                    value={item.length}
                    onChange={(e) => handleUpdateAreaItem(item.id, "length", Number.parseFloat(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`area-width-${item.id}`} className="text-sm">
                    Ancho
                  </Label>
                  <Input
                    id={`area-width-${item.id}`}
                    type="number"
                    step="0.01"
                    value={item.width}
                    onChange={(e) => handleUpdateAreaItem(item.id, "width", Number.parseFloat(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => handleRemoveAreaItem(item.id)}
                  disabled={areaItems.length === 1}
                >
                  <X className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddAreaItem}
              className="gap-1 bg-transparent"
            >
              <Plus className="h-4 w-4" /> Añadir Cálculo de Área
            </Button>
          </div>
        )
      case "volume":
        return (
          <div className="space-y-4">
            {volumeItems.map((item, index) => (
              <div
                key={item.id}
                className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] items-end gap-2 border p-3 rounded-md bg-green-50/30"
              >
                <div className="space-y-1">
                  <Label htmlFor={`volume-name-${item.id}`} className="text-sm">
                    Nombre del Elemento
                  </Label>
                  <Input
                    id={`volume-name-${item.id}`}
                    value={item.name}
                    onChange={(e) => handleUpdateVolumeItem(item.id, "name", e.target.value)}
                    placeholder={`Volumen ${index + 1}`}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`volume-length-${item.id}`} className="text-sm">
                    Largo
                  </Label>
                  <Input
                    id={`volume-length-${item.id}`}
                    type="number"
                    step="0.01"
                    value={item.length}
                    onChange={(e) => handleUpdateVolumeItem(item.id, "length", Number.parseFloat(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`volume-width-${item.id}`} className="text-sm">
                    Ancho
                  </Label>
                  <Input
                    id={`volume-width-${item.id}`}
                    type="number"
                    step="0.01"
                    value={item.width}
                    onChange={(e) => handleUpdateVolumeItem(item.id, "width", Number.parseFloat(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`volume-height-${item.id}`} className="text-sm">
                    Alto
                  </Label>
                  <Input
                    id={`volume-height-${item.id}`}
                    type="number"
                    step="0.01"
                    value={item.height}
                    onChange={(e) => handleUpdateVolumeItem(item.id, "height", Number.parseFloat(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => handleRemoveVolumeItem(item.id)}
                  disabled={volumeItems.length === 1}
                >
                  <X className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddVolumeItem}
              className="gap-1 bg-transparent"
            >
              <Plus className="h-4 w-4" /> Añadir Cálculo de Volumen
            </Button>
          </div>
        )
      case "rebar":
        return (
          <div className="space-y-4">
            {rebarItems.map((item, index) => (
              <div
                key={item.id}
                className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] items-end gap-2 border p-3 rounded-md bg-green-50/30"
              >
                <div className="space-y-1">
                  <Label htmlFor={`rebar-name-${item.id}`} className="text-sm">
                    Nombre de Varilla
                  </Label>
                  <Input
                    id={`rebar-name-${item.id}`}
                    value={item.name}
                    onChange={(e) => handleUpdateRebarItem(item.id, "name", e.target.value)}
                    placeholder={`Varilla ${index + 1}`}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`rebar-diameter-${item.id}`} className="text-sm">
                    Diámetro (mm)
                  </Label>
                  <Input
                    id={`rebar-diameter-${item.id}`}
                    type="number"
                    step="0.1"
                    value={item.diameter}
                    onChange={(e) => handleUpdateRebarItem(item.id, "diameter", Number.parseFloat(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`rebar-length-${item.id}`} className="text-sm">
                    Longitud (m)
                  </Label>
                  <Input
                    id={`rebar-length-${item.id}`}
                    type="number"
                    step="0.01"
                    value={item.length}
                    onChange={(e) => handleUpdateRebarItem(item.id, "length", Number.parseFloat(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`rebar-quantity-${item.id}`} className="text-sm">
                    Cantidad de Barras
                  </Label>
                  <Input
                    id={`rebar-quantity-${item.id}`}
                    type="number"
                    step="1"
                    value={item.quantity}
                    onChange={(e) => handleUpdateRebarItem(item.id, "quantity", Number.parseInt(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => handleRemoveRebarItem(item.id)}
                  disabled={rebarItems.length === 1}
                >
                  <X className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddRebarItem}
              className="gap-1 bg-transparent"
            >
              <Plus className="h-4 w-4" /> Añadir Varilla
            </Button>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] border-green-200">
        <DialogHeader>
          <DialogTitle className="text-green-900 flex items-center gap-2">
            <Calculator className="h-5 w-5 text-green-600" />
            Justificar Cantidad para "{apuName}"
          </DialogTitle>
          <DialogDescription className="text-green-600">
            Explica la cantidad requerida o utiliza las herramientas de cálculo.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="justification-text" className="text-green-800">
              Justificación / Observaciones
            </Label>
            <Textarea
              id="justification-text"
              placeholder="Ej: Se requieren 15m³ de excavación para la cimentación del muro perimetral."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="min-h-[80px] border-green-200 focus:border-green-400 focus:ring-green-400"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image-upload" className="text-green-800">
              Adjuntar Imagen (Opcional)
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="border-green-200 focus:border-green-400 focus:ring-green-400"
              />
              {image && (
                <Button variant="outline" size="icon" onClick={handleRemoveImage} className="shrink-0 bg-transparent">
                  <X className="h-4 w-4 text-red-500" />
                </Button>
              )}
            </div>
            {image && (
              <div className="mt-2 relative w-full h-48 border border-green-200 rounded-md overflow-hidden">
                <Image
                  src={image || "/placeholder.svg"}
                  alt="Justification preview"
                  layout="fill"
                  objectFit="contain"
                />
              </div>
            )}
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="calculation-type" className="text-green-800">
              Herramienta de Cálculo
            </Label>
            <Select value={calcMode} onValueChange={(value: CalcMode) => setCalcMode(value)}>
              <SelectTrigger className="border-green-200 focus:border-green-400 focus:ring-green-400">
                <SelectValue placeholder="Seleccionar tipo de cálculo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="sum">Suma de Valores</SelectItem>
                <SelectItem value="area">Cálculo de Área (2D)</SelectItem>
                <SelectItem value="volume">Cálculo de Volumen (3D)</SelectItem>
                <SelectItem value="rebar">Cálculo de Acero (Varillas)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {renderCalculationInputs()}

          <Separator />

          <div className="flex justify-between items-center pt-2">
            <span className="text-green-800 font-medium">Cantidad Calculada:</span>
            <span className="text-xl font-bold text-green-900">{result.toFixed(2)}</span>
          </div>
        </div>
        <DialogFooter className="gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-green-300 text-green-700 hover:bg-green-50"
          >
            Cancelar
          </Button>
          <Button type="button" onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white">
            Aplicar Cantidad
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
