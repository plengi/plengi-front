import { BarChart3, PieChart, Calculator } from "lucide-react"

// Elementos secundarios para presupuestos
const analysisItems = [
  {
    title: "APU",
    url: "/budgets/apu",
    icon: BarChart3,
    description: "Análisis de Precios Unitarios",
  },
  {
    title: "APG",
    url: "/budgets/apg",
    icon: PieChart,
    description: "Análisis de Precios Globales",
  },
  {
    title: "Presupuesto General",
    url: "/budgets",
    icon: Calculator,
    description: "Gestión de presupuestos de obra",
  },
]

export default function ApuPage() {
  return (
    <div>
      <h1>Análisis de Precios Unitarios (APU)</h1>
      {/* You can add more content here */}
    </div>
  )
}
