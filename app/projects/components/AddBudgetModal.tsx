"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Search, Loader2, Plus } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import apiClient from "@/app/api/apiClient";

interface Budget {
  id: number;
  nombre: string;
  descripcion: string;
  valor_total: number;
  estado: string;
}

interface AddBudgetModalProps {
  proyectoId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBudgetAdded: () => void;
}

export default function AddBudgetModal({
  proyectoId,
  open,
  onOpenChange,
  onBudgetAdded,
}: AddBudgetModalProps) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingBudget, setAddingBudget] = useState<number | null>(null);
  const [start, setStart] = useState(0);
  const [length, setLength] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  const fetchBudgets = async (resetPagination = false) => {
    if (resetPagination) {
      setStart(0);
    }

    setLoading(true);
    try {
      const response = await apiClient.get("/proyectos/search-budgets", {
        params: {
          search: searchTerm,
          id_proyecto: proyectoId,
          start: resetPagination ? 0 : start,
          length: length,
        },
      });

      if (response.data.success) {
        if (resetPagination) {
          setBudgets(response.data.data);
        } else {
          setBudgets((prev) => [...prev, ...response.data.data]);
        }
        setTotalRecords(response.data.iTotalRecords);
      }
    } catch (error) {
      console.error("Error fetching budgets:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los presupuestos",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (open) {
        fetchBudgets(true);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, open]);

  const handleAddBudget = async (budgetId: number) => {
    console.log("budgetId: ", budgetId);
    console.log("proyectoId: ", proyectoId);
    setAddingBudget(budgetId);
    try {
      const response = await apiClient.post("/proyectos/agregar-budget", {
        id_proyecto: proyectoId,
        id_budget: budgetId,
      });

      if (response.data.success) {
        toast({
          variant: "success",
          title: "Presupuesto agregado",
          description:
            "El presupuesto ha sido agregado al proyecto correctamente.",
        });

        // Remover el budget de la lista
        setBudgets((prev) => prev.filter((b) => b.id !== budgetId));

        // Llamar a la función de recarga
        onBudgetAdded();
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error.response?.data?.message || "Error al agregar el presupuesto",
      });
    } finally {
      setAddingBudget(null);
    }
  };

  const handleLoadMore = () => {
    if (start + length < totalRecords) {
      setStart((prev) => prev + length);
      fetchBudgets(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <div className="flex items-start justify-between w-full">
            <div className="flex flex-col space-y-1">
              <DialogTitle className="text-green-900">
                Agregar Presupuesto al Proyecto
              </DialogTitle>
              <DialogDescription className="text-green-700">
                Busca y selecciona los presupuestos que deseas agregar al
                proyecto
              </DialogDescription>
            </div>
            <Button
              asChild
              className="gap-2 bg-green-600 hover:bg-green-700 text-white mr-6">
              <Link href="/budgets/new">
                <Plus className="h-4 w-4" />
                Crear Presupuesto
              </Link>
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-green-500" />
            <Input
              placeholder="Buscar presupuestos por nombre o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 border-green-200 focus:border-green-400 focus:ring-green-400"
            />
          </div>

          <div className="border border-green-200 rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-green-50">
                  <TableHead className="text-green-800">Nombre</TableHead>
                  <TableHead className="text-green-800">Descripción</TableHead>
                  <TableHead className="text-green-800">Valor Total</TableHead>
                  <TableHead className="text-green-800 w-[100px]">
                    Acción
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && budgets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-green-600" />
                    </TableCell>
                  </TableRow>
                ) : budgets.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 text-green-700"
                    >
                      No se encontraron presupuestos disponibles
                    </TableCell>
                  </TableRow>
                ) : (
                  budgets.map((budget) => (
                    <TableRow key={budget.id} className="hover:bg-green-50/50">
                      <TableCell className="font-medium text-green-900">
                        {budget.nombre}
                      </TableCell>
                      <TableCell className="text-green-700">
                        {budget.descripcion || "Sin descripción"}
                      </TableCell>
                      <TableCell className="text-green-900 font-medium">
                        {formatCurrency(budget.valor_total)}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => handleAddBudget(budget.id)}
                          disabled={addingBudget === budget.id}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          {addingBudget === budget.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Plus className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {budgets.length > 0 && start + length < totalRecords && (
              <div className="p-4 border-t border-green-200 bg-green-50 text-center">
                <Button
                  variant="ghost"
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="text-green-700 hover:bg-green-100"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Cargando...
                    </>
                  ) : (
                    "Cargar más presupuestos"
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
