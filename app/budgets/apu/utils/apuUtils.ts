import { Apus } from "../table";

// Función para formatear precios (reutilizable)
export const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("es-CL", {
        style: "currency",
        currency: "CLP",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(price);
};

// Función para obtener color por tipo de actividad
export const getTypeColor = (type: string) => {
    switch (type) {
        case "Movimiento de Tierras":
            return "bg-amber-100 text-amber-800 border-amber-300";
        case "Hormigón Armado":
            return "bg-gray-100 text-gray-800 border-gray-300";
        case "Albañilería":
            return "bg-orange-100 text-orange-800 border-orange-300";
        case "Instalaciones Eléctricas":
            return "bg-yellow-100 text-yellow-800 border-yellow-300";
        case "Instalaciones Sanitarias":
            return "bg-blue-100 text-blue-800 border-blue-300";
        case "Techumbres":
            return "bg-red-100 text-red-800 border-red-300";
        case "Pavimentación":
            return "bg-slate-100 text-slate-800 border-slate-300";
        case "Terminaciones":
            return "bg-purple-100 text-purple-800 border-purple-300";
        case "Estructura Metálica":
            return "bg-indigo-100 text-indigo-800 border-indigo-300";
        case "Revestimientos":
            return "bg-cyan-100 text-cyan-800 border-cyan-300";
        default:
            return "bg-green-100 text-green-800 border-green-300";
    }
};

// Interfaz para paginación
export interface PaginationState {
    start: number;
    length: number;
    totalRecords: number;
    currentPage: number;
    totalPages: number;
}

// Función para calcular paginación
export const calculatePagination = (
    start: number,
    length: number,
    totalRecords: number
): PaginationState => {
    const currentPage = Math.floor(start / length) + 1;
    const totalPages = Math.ceil(totalRecords / length);

    return {
        start,
        length,
        totalRecords,
        currentPage,
        totalPages
    };
};

// Función para manejar la eliminación de APU
export const handleDeleteApu = async (
    id: number,
    apiClient: any,
    toast: any,
    fetchApus: () => Promise<void>
) => {
    try {
        await apiClient.delete('/apus', {
            data: { id }
        });

        toast({
            variant: "success",
            title: "APU eliminado",
            description: "El APU ha sido eliminado correctamente.",
        });

        await fetchApus();

    } catch (error) {
        console.error("Error al eliminar el APU:", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "No se pudo eliminar el APU.",
        });
    }
};