export interface BudgetAPU {
    id: string
    apuId: number
    name: string
    code: string
    unit: string
    unitPrice: number
    quantity: number
    total: number
    sectionId: string
    activityType: string
    order: number
    description?: string
}

export interface BudgetSection {
    id: string
    name: string
    description?: string
    order: number
}

export interface IndirectCost {
    id: string
    name: string
    percentage: number
    amount: number
}

export interface BudgetData {
    name: string
    description: string
    sections: BudgetSection[]
    apus: BudgetAPU[]
    indirectCosts: IndirectCost[]
    directTotal: number
    indirectTotal: number
    grandTotal: number
}

export interface ApiApu {
    id: number
    codigo: string
    nombre: string
    descripcion?: string
    tipo_actividad: string
    unidad_medida: string
    valor_total: number
    detalles?: any[]
}

export interface BudgetFormProps {
    initialData?: BudgetData
    isEditing?: boolean
    budgetId?: string
    onSave?: (budgetData: BudgetData) => Promise<void>
}