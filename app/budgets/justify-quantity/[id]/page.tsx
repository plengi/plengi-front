'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Plus, X, ImageIcon, Save, Loader } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import apiClient from '@/app/api/apiClient'

// Diámetros de acero comercial (igual que tu plantilla)
const COMMERCIAL_REBAR_SIZES = [
    { label: '#2', value: 6.35, inches: '1/4"', weightPerMeter: 0.25 },
    { label: '#3', value: 9.53, inches: '3/8"', weightPerMeter: 0.56 },
    { label: '#4', value: 12.7, inches: '1/2"', weightPerMeter: 0.99 },
    { label: '#5', value: 15.88, inches: '5/8"', weightPerMeter: 1.55 },
    { label: '#6', value: 19.05, inches: '3/4"', weightPerMeter: 2.24 },
    { label: '#7', value: 22.23, inches: '7/8"', weightPerMeter: 3.04 },
    { label: '#8', value: 25.4, inches: '1"', weightPerMeter: 3.97 },
    { label: '#9', value: 28.58, inches: '1 1/8"', weightPerMeter: 5.06 },
    { label: '#10', value: 32.26, inches: '1 1/4"', weightPerMeter: 6.41 },
    { label: '#11', value: 35.81, inches: '1 3/8"', weightPerMeter: 7.91 },
    { label: '#14', value: 43.0, inches: '1 3/4"', weightPerMeter: 11.38 },
    { label: '#18', value: 57.33, inches: '2 1/4"', weightPerMeter: 20.1 },
]

type CalcMode = 'manual' | 'sum' | 'area' | 'volume' | 'rebar'

// Interfaz para un ítem de justificación
interface JustifyItem {
    id: string
    tipo: CalcMode
    nombre: string
    largo: number
    ancho: number
    alto: number
    valor: number
    diametro: number | null
    cantidad: number
    numero_elementos: number
    total: number
}

interface ColumnLabels {
    sumValue: string
    areaLength: string
    areaWidth: string
    volumeLength: string
    volumeWidth: string
    volumeHeight: string
    rebarLength: string
}

interface BudgetActivity {
    id: number
    name: string
    quantity: number
    unit: string
}

export default function JustifyQuantityPage() {
    const router = useRouter()
    const searchParams = useParams<{ id?: string | string[] }>()
    const { toast } = useToast()

    const budgetApuId = Array.isArray(searchParams?.id)
        ? searchParams.id[0] || ''
        : searchParams?.id || ''
    const apuName = 'APU'

    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [calcMode, setCalcMode] = useState<CalcMode>('manual')

    // Items según el tipo
    const [initialQuantity, setInitialQuantity] = useState(0)
    const [manualQuantity, setManualQuantity] = useState(initialQuantity)
    const [sumItems, setSumItems] = useState<JustifyItem[]>([
        { id: crypto.randomUUID(), tipo: 'sum', nombre: 'Elemento 1', largo: 0, ancho: 0, alto: 0, valor: 0, diametro: null, cantidad: 0, numero_elementos: 1, total: 0 }
    ])
    const [areaItems, setAreaItems] = useState<JustifyItem[]>([
        { id: crypto.randomUUID(), tipo: 'area', nombre: 'Área 1', largo: 0, ancho: 0, alto: 0, valor: 0, diametro: null, cantidad: 0, numero_elementos: 1, total: 0 }
    ])
    const [volumeItems, setVolumeItems] = useState<JustifyItem[]>([
        { id: crypto.randomUUID(), tipo: 'volume', nombre: 'Volumen 1', largo: 0, ancho: 0, alto: 0, valor: 0, diametro: null, cantidad: 0, numero_elementos: 1, total: 0 }
    ])
    const [rebarItems, setRebarItems] = useState<JustifyItem[]>([
        { id: crypto.randomUUID(), tipo: 'rebar', nombre: 'Acero 1', largo: 0, ancho: 0, alto: 0, valor: 0, diametro: 12.7, cantidad: 0, numero_elementos: 1, total: 0 }
    ])

    const [result, setResult] = useState(initialQuantity)
    const [decimals, setDecimals] = useState(2)
    const [note, setNote] = useState('')
    const [justificationImages, setJustificationImages] = useState<string[]>([])
    const [imageFiles, setImageFiles] = useState<File[]>([])
    const [existingImages, setExistingImages] = useState<Array<{ id: number; url: string }>>([])

    const [columnLabels, setColumnLabels] = useState<ColumnLabels>({
        sumValue: 'Valor',
        areaLength: 'Largo (m)',
        areaWidth: 'Ancho (m)',
        volumeLength: 'Largo (m)',
        volumeWidth: 'Ancho (m)',
        volumeHeight: 'Alto (m)',
        rebarLength: 'Largo (m)',
    })

    // Estado para actividades del presupuesto (desde el API)
    const [activities, setActivities] = useState<BudgetActivity[]>([])
    const [currentActivityIndex, setCurrentActivityIndex] = useState(0)
    const [showCopyActivityDialog, setShowCopyActivityDialog] = useState(false)

    // Cargar datos existentes
    useEffect(() => {
        loadJustifyData()
    }, [budgetApuId])

    const loadJustifyData = async () => {
        setLoading(true)
        try {
            const response = await apiClient.get('/budget-apu-justify/find', {
                params: { id_budget_apus: budgetApuId }
            })
            if (response.data.success) {
                const data = response.data.data
                const actividades = data.actividades || []
                const budgetApu = data.budget_apu
                const justifies = data.justifies || []
                const notas = data.note || ''

                if (actividades.length > 0) {
                    // Mapear al formato que necesita el frontend
                    const mappedActivities: BudgetActivity[] = actividades.map((act: any) => ({
                        id: act.id,
                        name: act.apu ? `${act.apu.codigo} - ${act.apu.nombre}` : `APU ${act.id}`,
                        quantity: act.cantidad,
                        unit: act.apu?.unidad_medida || '',
                    }));
                    
                    setActivities(mappedActivities);
                    
                    // Encontrar el índice de la actividad actual (la que estamos justificando)
                    const currentIndex = mappedActivities.findIndex((activity) => activity.id === parseInt(budgetApuId));
                    setCurrentActivityIndex(currentIndex >= 0 ? currentIndex : 0);
                }

                // Si hay justificaciones, cargarlas
                if (justifies.length > 0) {
                    // Asumimos que todas son del mismo tipo
                    const tipo = justifies[0].tipo
                    setCalcMode(tipo)

                    if (tipo === 'manual') {
                        setManualQuantity(justifies[0].valor || initialQuantity)
                    } else if (tipo === 'sum') {
                        setSumItems(justifies.map((j: any) => ({
                            id: crypto.randomUUID(),
                            tipo: j.tipo,
                            nombre: j.nombre || 'Elemento',
                            largo: parseFloat(j.largo) || 0,
                            ancho: parseFloat(j.ancho) || 0,
                            alto: parseFloat(j.alto) || 0,
                            valor: parseFloat(j.valor) || 0,
                            diametro: j.diametro ? parseFloat(j.diametro) : null,
                            cantidad: parseFloat(j.cantidad) || 0,
                            numero_elementos: parseInt(j.numero_elementos) || 1,
                            total: parseFloat(j.total) || 0,
                        })))
                    } else if (tipo === 'area') {
                        setAreaItems(justifies.map((j: any) => ({
                            id: crypto.randomUUID(),
                            tipo: j.tipo,
                            nombre: j.nombre || 'Área',
                            largo: parseFloat(j.largo) || 0,
                            ancho: parseFloat(j.ancho) || 0,
                            alto: 0,
                            valor: 0,
                            diametro: null,
                            cantidad: 0,
                            numero_elementos: parseInt(j.numero_elementos) || 1,
                            total: parseFloat(j.total) || 0,
                        })))
                    } else if (tipo === 'volume') {
                        setVolumeItems(justifies.map((j: any) => ({
                            id: crypto.randomUUID(),
                            tipo: j.tipo,
                            nombre: j.nombre || 'Volumen',
                            largo: parseFloat(j.largo) || 0,
                            ancho: parseFloat(j.ancho) || 0,
                            alto: parseFloat(j.alto) || 0,
                            valor: 0,
                            diametro: null,
                            cantidad: 0,
                            numero_elementos: parseInt(j.numero_elementos) || 1,
                            total: parseFloat(j.total) || 0,
                        })))
                    } else if (tipo === 'rebar') {
                        setRebarItems(justifies.map((j: any) => ({
                            id: crypto.randomUUID(),
                            tipo: j.tipo,
                            nombre: j.nombre || 'Acero',
                            largo: parseFloat(j.largo) || 0,
                            ancho: 0,
                            alto: 0,
                            valor: 0,
                            diametro: j.diametro ? parseFloat(j.diametro) : 12.7,
                            cantidad: parseFloat(j.cantidad) || 0,
                            numero_elementos: parseInt(j.numero_elementos) || 1,
                            total: parseFloat(j.total) || 0,
                        })))
                    }

                    // Cargar imágenes del primer ítem
                    if (justifies[0].archivos) {
                        setExistingImages(justifies[0].archivos.map((a: any) => ({
                            id: a.id,
                            url: a.url_archivo
                        })))
                    }
                    setInitialQuantity(budgetApu.cantidad)
                    setNote(notas)
                } else {
                    setManualQuantity(budgetApu.cantidad)
                    setInitialQuantity(budgetApu.cantidad)
                }
            }
        } catch (error) {
            console.error('Error al cargar justificación:', error)
            toast({
                variant: "destructive",
                title: "Error",
                description: "No se pudo cargar la justificación"
            })
        } finally {
            setLoading(false)
        }
    }

    // Calcular resultado según el modo
    useEffect(() => {
        let calculated = 0

        if (calcMode === 'manual') {
            calculated = manualQuantity
        } else if (calcMode === 'sum') {
            calculated = sumItems.reduce((acc, item) => acc + item.valor * item.numero_elementos, 0)
        } else if (calcMode === 'area') {
            calculated = areaItems.reduce((acc, item) => acc + item.largo * item.ancho * item.numero_elementos, 0)
        } else if (calcMode === 'volume') {
            calculated = volumeItems.reduce((acc, item) => acc + item.largo * item.ancho * item.alto * item.numero_elementos, 0)
        } else if (calcMode === 'rebar') {
            calculated = rebarItems.reduce((acc, item) => {
                const rebarSize = COMMERCIAL_REBAR_SIZES.find(s => s.value === item.diametro)
                const weightPerMeter = rebarSize?.weightPerMeter || 0.99
                return acc + weightPerMeter * item.largo * item.cantidad * item.numero_elementos
            }, 0)
        }

        setResult(calculated)
    }, [calcMode, manualQuantity, sumItems, areaItems, volumeItems, rebarItems])

    // Funciones para manejar items
    const updateSumItem = (id: string, updates: Partial<JustifyItem>) => {
        setSumItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item))
    }

    const addSumItem = () => {
        setSumItems([...sumItems, {
            id: crypto.randomUUID(),
            tipo: 'sum',
            nombre: `Elemento ${sumItems.length + 1}`,
            largo: 0, ancho: 0, alto: 0,
            valor: 0,
            diametro: null,
            cantidad: 0,
            numero_elementos: 1,
            total: 0,
        }])
    }

    const removeSumItem = (id: string) => {
        if (sumItems.length > 1) {
            setSumItems(sumItems.filter(item => item.id !== id))
        }
    }

    const updateAreaItem = (id: string, updates: Partial<JustifyItem>) => {
        setAreaItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item))
    }

    const addAreaItem = () => {
        setAreaItems([...areaItems, {
            id: crypto.randomUUID(),
            tipo: 'area',
            nombre: `Área ${areaItems.length + 1}`,
            largo: 0, ancho: 0, alto: 0,
            valor: 0,
            diametro: null,
            cantidad: 0,
            numero_elementos: 1,
            total: 0,
        }])
    }

    const removeAreaItem = (id: string) => {
        if (areaItems.length > 1) {
            setAreaItems(areaItems.filter(item => item.id !== id))
        }
    }

    const updateVolumeItem = (id: string, updates: Partial<JustifyItem>) => {
        setVolumeItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item))
    }

    const addVolumeItem = () => {
        setVolumeItems([...volumeItems, {
            id: crypto.randomUUID(),
            tipo: 'volume',
            nombre: `Volumen ${volumeItems.length + 1}`,
            largo: 0, ancho: 0, alto: 0,
            valor: 0,
            diametro: null,
            cantidad: 0,
            numero_elementos: 1,
            total: 0,
        }])
    }

    const removeVolumeItem = (id: string) => {
        if (volumeItems.length > 1) {
            setVolumeItems(volumeItems.filter(item => item.id !== id))
        }
    }

    const updateRebarItem = (id: string, updates: Partial<JustifyItem>) => {
        setRebarItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item))
    }

    const addRebarItem = () => {
        setRebarItems([...rebarItems, {
            id: crypto.randomUUID(),
            tipo: 'rebar',
            nombre: `Acero ${rebarItems.length + 1}`,
            largo: 0, ancho: 0, alto: 0,
            valor: 0,
            diametro: 12.7,
            cantidad: 0,
            numero_elementos: 1,
            total: 0,
        }])
    }

    const removeRebarItem = (id: string) => {
        if (rebarItems.length > 1) {
            setRebarItems(rebarItems.filter(item => item.id !== id))
        }
    }

    const handleCopyActivity = async (sourceId: number) => {
        if (!budgetApuId) return;

        setSaving(true); // Podrías usar un estado específico para copia
        try {
            const response = await apiClient.post('/budget-apu-justify/copy', {
                id_budget_apus_origen: sourceId,
                id_budget_apus_destino: parseInt(budgetApuId)
            });

            if (response.data.success) {
                toast({ title: "Éxito", description: "Justificación copiada correctamente" });
                // Recargar datos para mostrar la copia
                loadJustifyData();
                setShowCopyActivityDialog(false);
            } else {
                throw new Error(response.data.message);
            }
        } catch (error) {
            console.error('Error al copiar:', error);
            toast({ variant: "destructive", title: "Error", description: "No se pudo copiar la justificación" });
        } finally {
            setSaving(false);
        }
    };

    // Guardar
    const handleSave = async () => {
        if (!budgetApuId) {
            toast({ variant: "destructive", title: "Error", description: "ID de APU no válido" })
            return
        }

        setSaving(true)
        try {
            let itemsToSend: any[] = []

            if (calcMode === 'manual') {
                itemsToSend = [{
                    tipo: 'manual',
                    nombre: 'Manual',
                    largo: 0, ancho: 0, alto: 0,
                    valor: manualQuantity,
                    diametro: null,
                    cantidad: 0,
                    numero_elementos: 1,
                    total: manualQuantity,
                }]
            } else if (calcMode === 'sum') {
                itemsToSend = sumItems.map(item => ({
                    tipo: 'sum',
                    nombre: item.nombre,
                    largo: 0, ancho: 0, alto: 0,
                    valor: item.valor,
                    diametro: null,
                    cantidad: 0,
                    numero_elementos: item.numero_elementos,
                    total: item.valor * item.numero_elementos,
                }))
            } else if (calcMode === 'area') {
                itemsToSend = areaItems.map(item => ({
                    tipo: 'area',
                    nombre: item.nombre,
                    largo: item.largo,
                    ancho: item.ancho,
                    alto: 0,
                    valor: 0,
                    diametro: null,
                    cantidad: 0,
                    numero_elementos: item.numero_elementos,
                    total: item.largo * item.ancho * item.numero_elementos,
                }))
            } else if (calcMode === 'volume') {
                itemsToSend = volumeItems.map(item => ({
                    tipo: 'volume',
                    nombre: item.nombre,
                    largo: item.largo,
                    ancho: item.ancho,
                    alto: item.alto,
                    valor: 0,
                    diametro: null,
                    cantidad: 0,
                    numero_elementos: item.numero_elementos,
                    total: item.largo * item.ancho * item.alto * item.numero_elementos,
                }))
            } else if (calcMode === 'rebar') {
                itemsToSend = rebarItems.map(item => {
                    const rebarSize = COMMERCIAL_REBAR_SIZES.find(s => s.value === item.diametro)
                    const weightPerMeter = rebarSize?.weightPerMeter || 0.99
                    return {
                        tipo: 'rebar',
                        nombre: item.nombre,
                        largo: item.largo,
                        ancho: 0, alto: 0,
                        valor: 0,
                        diametro: item.diametro,
                        cantidad: item.cantidad,
                        numero_elementos: item.numero_elementos,
                        total: weightPerMeter * item.largo * item.cantidad * item.numero_elementos,
                    }
                })
            }

            const formData = new FormData()
            formData.append('id_budget_apus', budgetApuId)
            formData.append('items', JSON.stringify(itemsToSend))
            formData.append('note', note)

            // Enviar IDs de imágenes existentes que queremos conservar
            const existingImageIds = existingImages.map(img => img.id);

            existingImages.forEach(img => {
                formData.append('imagenes_existentes[]', img.id.toString())
            })

            // Agregar imágenes nuevas
            imageFiles.forEach(file => {
                formData.append('imagenes[]', file)
            })

            const response = await apiClient.post('/budget-apu-justify/save', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })

            if (response.data.success) {
                toast({ title: "Éxito", description: "Justificación guardada" })
                router.back()
            } else {
                throw new Error(response.data.message)
            }
        } catch (error) {
            console.error('Error al guardar:', error)
            toast({ variant: "destructive", title: "Error", description: "No se pudo guardar" })
        } finally {
            setSaving(false)
        }
    }

    // Manejo de imágenes
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files)
            setImageFiles([...imageFiles, ...files])
            files.forEach(file => {
                const reader = new FileReader()
                reader.onloadend = () => setJustificationImages(prev => [...prev, reader.result as string])
                reader.readAsDataURL(file)
            })
        }
    }

    const removeImage = (index: number) => {
        setJustificationImages(prev => prev.filter((_, i) => i !== index))
        setImageFiles(prev => prev.filter((_, i) => i !== index))
    }

    const removeExistingImage = async (imageId: number) => {
        // Aquí podrías llamar a un endpoint para eliminar la imagen
        setExistingImages(prev => prev.filter(img => img.id !== imageId))
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-4 md:p-8 flex items-center justify-center">
                <Loader className="h-8 w-8 animate-spin text-green-600" />
            </div>
        )
    }

    return (
        <>
            <header className="flex h-16 shrink-0 items-center gap-2 border-b border-green-100 px-4 bg-gradient-to-r from-white to-white">
                <SidebarTrigger className="-ml-1 text-green-600 hover:bg-green-100" />
                <div className="flex flex-1 items-center gap-4">
                    <h1 className="text-3xl font-bold tracking-tight text-green-900">Justificar Cantidad</h1>
                </div>
            </header>

            <main className="flex-1 space-y-6 p-6 bg-gradient-to-br from-green-50 to-green-50">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    {/* Columna principal */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Tipo de Cálculo</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Tabs value={calcMode} onValueChange={(v) => setCalcMode(v as CalcMode)}>
                                    <TabsList className="grid grid-cols-5 gap-2 bg-green-100 p-1">
                                        <TabsTrigger value="manual">Manual</TabsTrigger>
                                        <TabsTrigger value="sum">Suma</TabsTrigger>
                                        <TabsTrigger value="area">Área</TabsTrigger>
                                        <TabsTrigger value="volume">Volumen</TabsTrigger>
                                        <TabsTrigger value="rebar">Acero</TabsTrigger>
                                    </TabsList>

                                    {/* Manual */}
                                    <TabsContent value="manual" className="space-y-4 mt-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="manual-qty">Cantidad</Label>
                                            <Input
                                                id="manual-qty"
                                                type="number"
                                                step="0.01"
                                                value={manualQuantity}
                                                onChange={(e) => setManualQuantity(parseFloat(e.target.value) || 0)}
                                                className="border-green-200"
                                            />
                                        </div>
                                    </TabsContent>

                                    {/* Suma */}
                                    <TabsContent value="sum" className="space-y-4 mt-4">
                                        <div className="flex gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={addSumItem}
                                                className="border-green-300 text-green-700 hover:bg-green-50 gap-2 flex-1 bg-transparent"
                                            >
                                                <Plus className="h-4 w-4" />
                                                Agregar Elemento
                                            </Button>
                                        </div>

                                        {sumItems.length > 0 && (
                                            <div className="border border-green-200 rounded-lg overflow-hidden">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow className="bg-green-50">
                                                            <TableHead className="text-green-800 w-1/3">Elemento</TableHead>
                                                            <TableHead className="text-green-800">{columnLabels.sumValue}</TableHead>
                                                            <TableHead className="text-green-800">Nº Elementos</TableHead>
                                                            <TableHead className="text-green-800">Parcial</TableHead>
                                                            <TableHead className="text-green-800 w-10"></TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {sumItems.map((item) => (
                                                            <TableRow key={item.id}>
                                                                <TableCell className="w-1/3">
                                                                    <Input
                                                                        value={item.nombre}
                                                                        onChange={(e) => updateSumItem(item.id, { nombre: e.target.value })}
                                                                        className="border-green-200 text-sm"
                                                                        placeholder="Nombre"
                                                                    />
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Input
                                                                        type="number"
                                                                        step="0.01"
                                                                        value={item.valor}
                                                                        onChange={(e) => updateSumItem(item.id, { valor: parseFloat(e.target.value) || 0 })}
                                                                        className="border-green-200 text-sm"
                                                                    />
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Input
                                                                        type="number"
                                                                        step="1"
                                                                        min="1"
                                                                        value={item.numero_elementos}
                                                                        onChange={(e) => updateSumItem(item.id, { numero_elementos: parseInt(e.target.value) || 1 })}
                                                                        className="border-green-200 text-sm"
                                                                    />
                                                                </TableCell>
                                                                <TableCell className="text-green-700 font-medium">
                                                                    {(item.valor * item.numero_elementos).toFixed(decimals)}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {sumItems.length > 1 && (
                                                                        <Button
                                                                            type="button"
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            onClick={() => removeSumItem(item.id)}
                                                                            className="h-6 w-6 p-0 text-red-600 hover:bg-red-50"
                                                                        >
                                                                            <X className="h-4 w-4" />
                                                                        </Button>
                                                                    )}
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        )}
                                    </TabsContent>

                                    {/* Área */}
                                    <TabsContent value="area" className="space-y-4 mt-4">
                                        <div className="flex gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={addAreaItem}
                                                className="border-green-300 text-green-700 hover:bg-green-50 gap-2 flex-1 bg-transparent"
                                            >
                                                <Plus className="h-4 w-4" />
                                                Agregar Área
                                            </Button>
                                        </div>

                                        {areaItems.length > 0 && (
                                            <div className="border border-green-200 rounded-lg overflow-hidden">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow className="bg-green-50">
                                                            <TableHead className="text-green-800 w-1/3">Área</TableHead>
                                                            <TableHead className="text-green-800">{columnLabels.areaLength}</TableHead>
                                                            <TableHead className="text-green-800">{columnLabels.areaWidth}</TableHead>
                                                            <TableHead className="text-green-800">Nº Elementos</TableHead>
                                                            <TableHead className="text-green-800">Parcial (m²)</TableHead>
                                                            <TableHead className="text-green-800 w-10"></TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {areaItems.map((item) => (
                                                            <TableRow key={item.id}>
                                                                <TableCell className="w-1/3">
                                                                    <Input
                                                                        value={item.nombre}
                                                                        onChange={(e) => updateAreaItem(item.id, { nombre: e.target.value })}
                                                                        className="border-green-200 text-sm"
                                                                        placeholder="Nombre"
                                                                    />
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Input
                                                                        type="number"
                                                                        step="0.01"
                                                                        value={item.largo}
                                                                        onChange={(e) => updateAreaItem(item.id, { largo: parseFloat(e.target.value) || 0 })}
                                                                        className="border-green-200 text-sm"
                                                                    />
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Input
                                                                        type="number"
                                                                        step="0.01"
                                                                        value={item.ancho}
                                                                        onChange={(e) => updateAreaItem(item.id, { ancho: parseFloat(e.target.value) || 0 })}
                                                                        className="border-green-200 text-sm"
                                                                    />
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Input
                                                                        type="number"
                                                                        step="1"
                                                                        min="1"
                                                                        value={item.numero_elementos}
                                                                        onChange={(e) => updateAreaItem(item.id, { numero_elementos: parseInt(e.target.value) || 1 })}
                                                                        className="border-green-200 text-sm"
                                                                    />
                                                                </TableCell>
                                                                <TableCell className="text-green-700 font-medium">
                                                                    {(item.largo * item.ancho * item.numero_elementos).toFixed(decimals)}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {areaItems.length > 1 && (
                                                                        <Button
                                                                            type="button"
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            onClick={() => removeAreaItem(item.id)}
                                                                            className="h-6 w-6 p-0 text-red-600 hover:bg-red-50"
                                                                        >
                                                                            <X className="h-4 w-4" />
                                                                        </Button>
                                                                    )}
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        )}
                                    </TabsContent>

                                    {/* Volumen */}
                                    <TabsContent value="volume" className="space-y-4 mt-4">
                                        <div className="flex gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={addVolumeItem}
                                                className="border-green-300 text-green-700 hover:bg-green-50 gap-2 flex-1 bg-transparent"
                                            >
                                                <Plus className="h-4 w-4" />
                                                Agregar Volumen
                                            </Button>
                                        </div>

                                        {volumeItems.length > 0 && (
                                            <div className="border border-green-200 rounded-lg overflow-hidden">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow className="bg-green-50">
                                                            <TableHead className="text-green-800 w-1/3">Volumen</TableHead>
                                                            <TableHead className="text-green-800">{columnLabels.volumeLength}</TableHead>
                                                            <TableHead className="text-green-800">{columnLabels.volumeWidth}</TableHead>
                                                            <TableHead className="text-green-800">{columnLabels.volumeHeight}</TableHead>
                                                            <TableHead className="text-green-800">Nº Elementos</TableHead>
                                                            <TableHead className="text-green-800">Parcial (m³)</TableHead>
                                                            <TableHead className="text-green-800 w-10"></TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {volumeItems.map((item) => (
                                                            <TableRow key={item.id}>
                                                                <TableCell className="w-1/3">
                                                                    <Input
                                                                        value={item.nombre}
                                                                        onChange={(e) => updateVolumeItem(item.id, { nombre: e.target.value })}
                                                                        className="border-green-200 text-sm"
                                                                        placeholder="Nombre"
                                                                    />
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Input
                                                                        type="number"
                                                                        step="0.01"
                                                                        value={item.largo}
                                                                        onChange={(e) => updateVolumeItem(item.id, { largo: parseFloat(e.target.value) || 0 })}
                                                                        className="border-green-200 text-sm"
                                                                    />
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Input
                                                                        type="number"
                                                                        step="0.01"
                                                                        value={item.ancho}
                                                                        onChange={(e) => updateVolumeItem(item.id, { ancho: parseFloat(e.target.value) || 0 })}
                                                                        className="border-green-200 text-sm"
                                                                    />
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Input
                                                                        type="number"
                                                                        step="0.01"
                                                                        value={item.alto}
                                                                        onChange={(e) => updateVolumeItem(item.id, { alto: parseFloat(e.target.value) || 0 })}
                                                                        className="border-green-200 text-sm"
                                                                    />
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Input
                                                                        type="number"
                                                                        step="1"
                                                                        min="1"
                                                                        value={item.numero_elementos}
                                                                        onChange={(e) => updateVolumeItem(item.id, { numero_elementos: parseInt(e.target.value) || 1 })}
                                                                        className="border-green-200 text-sm"
                                                                    />
                                                                </TableCell>
                                                                <TableCell className="text-green-700 font-medium">
                                                                    {(item.largo * item.ancho * item.alto * item.numero_elementos).toFixed(decimals)}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {volumeItems.length > 1 && (
                                                                        <Button
                                                                            type="button"
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            onClick={() => removeVolumeItem(item.id)}
                                                                            className="h-6 w-6 p-0 text-red-600 hover:bg-red-50"
                                                                        >
                                                                            <X className="h-4 w-4" />
                                                                        </Button>
                                                                    )}
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        )}
                                    </TabsContent>

                                    {/* Acero */}
                                    <TabsContent value="rebar" className="space-y-4 mt-4">
                                        <div className="flex gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={addRebarItem}
                                                className="border-green-300 text-green-700 hover:bg-green-50 gap-2 flex-1 bg-transparent"
                                            >
                                                <Plus className="h-4 w-4" />
                                                Agregar Acero
                                            </Button>
                                        </div>

                                        {rebarItems.length > 0 && (
                                            <div className="border border-green-200 rounded-lg overflow-hidden">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow className="bg-green-50">
                                                            <TableHead className="text-green-800 w-1/3">Nombre</TableHead>
                                                            <TableHead className="text-green-800">Diámetro</TableHead>
                                                            <TableHead className="text-green-800">{columnLabels.rebarLength}</TableHead>
                                                            <TableHead className="text-green-800">Cantidad</TableHead>
                                                            <TableHead className="text-green-800">Nº Elementos</TableHead>
                                                            <TableHead className="text-green-800">Peso (kg)</TableHead>
                                                            <TableHead className="text-green-800 w-10"></TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {rebarItems.map((item) => (
                                                            <TableRow key={item.id}>
                                                                <TableCell className="w-1/3">
                                                                    <Input
                                                                        value={item.nombre}
                                                                        onChange={(e) => updateRebarItem(item.id, { nombre: e.target.value })}
                                                                        className="border-green-200 text-sm"
                                                                        placeholder="Nombre"
                                                                    />
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Select
                                                                        value={item.diametro?.toString()}
                                                                        onValueChange={(val) => updateRebarItem(item.id, { diametro: parseFloat(val) })}
                                                                    >
                                                                        <SelectTrigger className="border-green-200 h-8">
                                                                            <SelectValue />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            {COMMERCIAL_REBAR_SIZES.map((size) => (
                                                                                <SelectItem key={size.value} value={size.value.toString()}>
                                                                                    {size.label} ({size.inches})
                                                                                </SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Input
                                                                        type="number"
                                                                        step="0.01"
                                                                        value={item.largo}
                                                                        onChange={(e) => updateRebarItem(item.id, { largo: parseFloat(e.target.value) || 0 })}
                                                                        className="border-green-200 text-sm"
                                                                    />
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Input
                                                                        type="number"
                                                                        step="0.01"
                                                                        value={item.cantidad}
                                                                        onChange={(e) => updateRebarItem(item.id, { cantidad: parseFloat(e.target.value) || 0 })}
                                                                        className="border-green-200 text-sm"
                                                                    />
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Input
                                                                        type="number"
                                                                        step="1"
                                                                        min="1"
                                                                        value={item.numero_elementos}
                                                                        onChange={(e) => updateRebarItem(item.id, { numero_elementos: parseInt(e.target.value) || 1 })}
                                                                        className="border-green-200 text-sm"
                                                                    />
                                                                </TableCell>
                                                                <TableCell className="text-green-700 font-medium">
                                                                    {(() => {
                                                                        const rebarSize = COMMERCIAL_REBAR_SIZES.find((s) => s.value === item.diametro)
                                                                        const weightPerMeter = rebarSize?.weightPerMeter || 0.99
                                                                        const weight = weightPerMeter * item.largo * item.cantidad * item.numero_elementos
                                                                        return weight.toFixed(decimals)
                                                                    })()}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {rebarItems.length > 1 && (
                                                                        <Button
                                                                            type="button"
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            onClick={() => removeRebarItem(item.id)}
                                                                            className="h-6 w-6 p-0 text-red-600 hover:bg-red-50"
                                                                        >
                                                                            <X className="h-4 w-4" />
                                                                        </Button>
                                                                    )}
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        )}
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>

                        {/* Documentación (con tu diseño) */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Documentación</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="notes">Notas</Label>
                                    <Textarea
                                        id="notes"
                                        placeholder="Agrega notas sobre cómo se calculó la cantidad..."
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                        className="min-h-24"
                                    />
                                </div>

                                <div className="space-y-2 pt-4 border-t">
                                    <Label className="flex items-center gap-2">
                                        <ImageIcon className="h-4 w-4" />
                                        Imágenes Justificativas
                                    </Label>
                                    <p className="text-xs text-gray-600">Sube imágenes que respalden los cálculos realizados</p>

                                    <div className="grid grid-cols-3 gap-4 mt-2">
                                        {existingImages.map((img, idx) => (
                                            <div key={`exist-${idx}`} className="relative border rounded-lg overflow-hidden">
                                                <img src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${img.url}`} alt="" className="w-full h-24 object-cover" />
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    className="absolute top-1 right-1 h-6 w-6 p-0"
                                                    onClick={() => removeExistingImage(img.id)}
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        ))}
                                        {justificationImages.map((src, idx) => (
                                            <div key={`new-${idx}`} className="relative border rounded-lg overflow-hidden">
                                                <img src={src} alt="" className="w-full h-24 object-cover" />
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    className="absolute top-1 right-1 h-6 w-6 p-0"
                                                    onClick={() => removeImage(idx)}
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        ))}
                                        <label className="border-2 border-dashed rounded-lg flex items-center justify-center h-24 cursor-pointer hover:bg-gray-50">
                                            <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                                            <Plus className="h-6 w-6 text-gray-400" />
                                        </label>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1 space-y-6 self-start">
                        <Card className="border-green-200 sticky top-4 self-start">
                            <CardHeader>
                                <CardTitle className="text-green-900">Resultado</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="text-center">
                                    <p className="text-sm text-green-600 mb-2">Cantidad Calculada</p>
                                    <p className="text-4xl font-bold text-green-700">{result.toFixed(decimals)}</p>
                                </div>

                                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                    <p className="text-sm text-green-600 mb-2">Cantidad Original</p>
                                    <p className="text-lg font-semibold text-green-800">{initialQuantity.toFixed(decimals)}</p>
                                </div>

                                <div className="space-y-2">
                                    <Button onClick={handleSave} disabled={saving} className="w-full bg-green-600">
                                        {saving ? <Loader className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4 mr-2" /> Guardar</>}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Actividades del Presupuesto */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Actividades del Presupuesto</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {activities.length > 0 && (
                                    <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                                        <p className="text-xs text-green-600 mb-1">Actividad Actual</p>
                                        <p className="text-lg font-bold text-green-900">{activities[currentActivityIndex]?.name}</p>
                                        <p className="text-sm text-green-700 mt-1">
                                            {activities[currentActivityIndex]?.unit}
                                        </p>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    {currentActivityIndex > 0 && (
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                const prevId = activities[currentActivityIndex - 1].id;
                                                router.push(`/budgets/justify-quantity/${prevId}`);
                                            }}
                                            className="w-full border-green-300 text-green-700 hover:bg-green-50 text-sm"
                                        >
                                            ← Actividad Anterior
                                        </Button>
                                    )}
                                    {currentActivityIndex < activities.length - 1 && (
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                const nextId = activities[currentActivityIndex + 1].id;
                                                router.push(`/budgets/justify-quantity/${nextId}`);
                                            }}
                                            className="w-full border-green-300 text-green-700 hover:bg-green-50 text-sm"
                                        >
                                            Siguiente Actividad →
                                        </Button>
                                    )}
                                </div>

                                <Button
                                    variant="outline"
                                    onClick={() => setShowCopyActivityDialog(true)}
                                    className="w-full border-green-300 text-green-700 hover:bg-green-50 gap-2 text-sm"
                                >
                                    <Plus className="h-3 w-3" />
                                    Copiar de otra actividad
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Dialog para copiar (simulado) */}
                        {showCopyActivityDialog && (
                            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                                <Card className="border-green-200 max-w-sm w-full">
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-base">Copiar de otra actividad</CardTitle>
                                            <Button variant="ghost" size="icon" onClick={() => setShowCopyActivityDialog(false)} className="h-6 w-6">
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <p className="text-sm">Selecciona una actividad para copiar su justificación:</p>
                                        <div className="space-y-2 max-h-64 overflow-y-auto">
                                            {activities.map((activity, idx) => (
                                                idx !== currentActivityIndex &&
                                                (
                                                    <Button
                                                        key={activity.id}
                                                        variant="outline"
                                                        className="w-full justify-start text-left h-auto py-2 px-3"
                                                        onClick={() => handleCopyActivity(activity.id)} // Aquí activity.id es el id del budget_apu origen
                                                    >
                                                        <div className="text-sm">
                                                            <p className="font-semibold">{activity.name}</p>
                                                            <p className="text-xs text-gray-600">{activity.quantity} {activity.unit}</p>
                                                        </div>
                                                    </Button>
                                                )
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </>
    )
}