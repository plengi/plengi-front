"use client";

import type React from "react";
import apiClient from "@/app/api/apiClient";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Plus, Loader, Building2 } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	calculateBaseSalary,
	getBenefitPercentage,
	calculateJornal,
	calculateJornalWithBenefits,
} from "@/lib/laborUtils";
import { formatCurrency } from "@/lib/format";

export interface Insumo {
	id: number;
	nombre: string;
	unidad_medida: string;
	valor: number;
	tipo_proveedor: string;
	tipo_producto: number;
	mano_obra?: {
		salario_base: number;
		tipo_salario: string;
		multiplicador: number | null;
		id_configuracion_prestaciones: number | null;
		especialidad: string;
		jornada_horas: number | null;
		configuracion_prestaciones?: any; // opcional, si el backend la incluye
	};
}

interface InsumoFormProps {
	insumoEditar?: Insumo | null;
	mostrarBotonCrear?: boolean;
	setInsumos: React.Dispatch<React.SetStateAction<Insumo[]>>;
	setInsumoEditar?: React.Dispatch<React.SetStateAction<Insumo | null>>;
	tipoProducto: number;
	titulo: string;
	descripcion: string;
	icon?: React.ReactNode;
	onSuccess?: () => void;
}

const units = [
	{ id: "1", nombre: "kg" },
	{ id: "2", nombre: "m³" },
	{ id: "3", nombre: "m²" },
	{ id: "4", nombre: "Metro lineal" },
	{ id: "5", nombre: "Bolsa 50kg" },
	{ id: "6", nombre: "Galón" },
	{ id: "7", nombre: "Litro" },
	{ id: "8", nombre: "Tonelada" },
];

const proveedores = [
	{ id: "1", nombre: "Proveedor A" },
	{ id: "2", nombre: "Proveedor B" },
	{ id: "3", nombre: "Proveedor C" },
	{ id: "4", nombre: "Proveedor D" },
];

const specialties = [
	"Supervisión",
	"Albañilería",
	"Soldadura",
	"Operación Maquinaria",
	"Electricidad",
	"Plomería",
	"Carpintería",
	"Ayudantía",
	"Pintura",
	"Herrería",
	"Acabados",
	"Otros",
];

export default function InsumoForm({
	setInsumos,
	insumoEditar,
	setInsumoEditar,
	mostrarBotonCrear,
	tipoProducto,
	titulo,
	descripcion,
	icon,
	onSuccess,
}: InsumoFormProps) {
	const { toast } = useToast();
	const [error, setError] = useState("");
	const [open, setOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const [selectedUnidadMedida, setSelectedUnidadMedida] = useState<string>("");
	const [selectedProveedor, setSelectedProveedor] = useState<string>("");
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [formData, setFormData] = useState({
		id: 0,
		nombre: "",
		unidad_medida: "",
		valor: 0,
		tipo_proveedor: "",
		tipo_producto: tipoProducto,
	});

	// Estados específicos para mano de obra
	const [config, setConfig] = useState<any>(null);
	const [configuraciones, setConfiguraciones] = useState<any[]>([]);
	const [selectedConfigId, setSelectedConfigId] = useState<string>("");
	const [selectedConfig, setSelectedConfig] = useState<any>(null);
	const [tipoSalario, setTipoSalario] = useState<string>("monthly");
	const [salarioInput, setSalarioInput] = useState<string>("");
	const [multiplicadorInput, setMultiplicadorInput] = useState<number>(1);
	const [especialidad, setEspecialidad] = useState<string>("");
	const [salarioBaseCalculado, setSalarioBaseCalculado] = useState<number>(0);
	const [benefitPercentage, setBenefitPercentage] = useState<number>(50.66);
	const [jornalSinPrestaciones, setJornalSinPrestaciones] = useState<number>(0);
	const [jornalConPrestaciones, setJornalConPrestaciones] = useState<number>(0);

	// Cargar configuración de mano de obra
	useEffect(() => {
		if (tipoProducto === 2) {
			apiClient
				.get("/labor-configuracion")
				.then((res) => setConfig(res.data.data))
				.catch(console.error);
			apiClient
				.get("/configuraciones-prestaciones")
				.then((res) => setConfiguraciones(res.data.data))
				.catch(console.error);
		}
	}, [tipoProducto]);

	// Cargar datos de edición
	useEffect(() => {
		if (insumoEditar) {
			setFormData({
				id: insumoEditar.id,
				nombre: insumoEditar.nombre,
				unidad_medida: insumoEditar.unidad_medida,
				valor: insumoEditar.valor,
				tipo_proveedor: insumoEditar.tipo_proveedor,
				tipo_producto: insumoEditar.tipo_producto,
			});
			setSelectedUnidadMedida(insumoEditar.unidad_medida);
			setSelectedProveedor(insumoEditar.tipo_proveedor);

			if (tipoProducto === 2 && insumoEditar.mano_obra) {
				const mo = insumoEditar.mano_obra;
				setTipoSalario(mo.tipo_salario);
				setEspecialidad(mo.especialidad);
				setMultiplicadorInput(mo.multiplicador || 1);
				// Cargar configuración seleccionada
				setSelectedConfigId(mo.id_configuracion_prestaciones ? mo.id_configuracion_prestaciones.toString() : "");
				if (mo.tipo_salario === "monthly") {
					setSalarioInput(mo.salario_base.toString());
				} else if (mo.tipo_salario === "daily") {
					setSalarioInput((mo.salario_base / 30).toString());
				} else {
					setSalarioInput("");
				}
			}
			setOpen(true);
		}
	}, [insumoEditar, tipoProducto]);

	// Recalcular cuando cambian los inputs de mano de obra
	useEffect(() => {
		if (tipoProducto !== 2 || !config) return;

		let baseSalary = 0;
		let multiplier = multiplicadorInput || 1;

		if (tipoSalario === "monthly") {
			baseSalary = Number(salarioInput) || 0;
		} else if (tipoSalario === "daily") {
			baseSalary = (Number(salarioInput) || 0) * (config.dias_laborales_mes || 30);
		} else if (tipoSalario === "multiplier") {
			baseSalary = (config.salario_minimo || 498100) * multiplier;
		}

		// Obtener el porcentaje total de la configuración seleccionada
		const configSeleccionada = configuraciones.find(c => c.id === Number(selectedConfigId));
		const totalPrestaciones = configSeleccionada
			? configSeleccionada.detalles
				.filter((d: any) => d.activo)
				.reduce((sum: number, d: any) => sum + Number(d.porcentaje), 0)
			: 0;

		const jornal = calculateJornal(baseSalary, config.dias_laborales_mes || 30);
		const jornalWithBenefits = calculateJornalWithBenefits(jornal, totalPrestaciones);

		setSalarioBaseCalculado(baseSalary);
		setBenefitPercentage(totalPrestaciones); // Ahora usamos el total de la config
		setJornalSinPrestaciones(jornal);
		setJornalConPrestaciones(jornalWithBenefits);
		setSelectedConfig(configSeleccionada || null);

		// Actualizar formData.valor con el jornal con prestaciones
		setFormData((prev) => ({
			...prev,
			valor: jornalWithBenefits,
			unidad_medida: "Hora",
		}));
	}, [tipoSalario, salarioInput, multiplicadorInput, config, configuraciones, selectedConfigId]);

	const handleOpenChange = (isOpen: boolean) => {
		setOpen(isOpen);
		if (!isOpen) {
			setFormData({
				id: 0,
				nombre: "",
				unidad_medida: "",
				valor: 0,
				tipo_proveedor: "",
				tipo_producto: tipoProducto,
			});
			setSelectedUnidadMedida("");
			setSelectedProveedor("");
			if (setInsumoEditar) setInsumoEditar(null);
			// Resetear campos de mano de obra
			if (tipoProducto === 2) {
				setTipoSalario("monthly");
				setSalarioInput("");
				setMultiplicadorInput(1);
				setEspecialidad("");
			}
		}
	};

	const handleInputChange = (field: string, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const validateForm = () => {
		const newErrors: Record<string, string> = {};
		if (!formData.nombre) newErrors.nombre = "Requerido";
		if (!selectedConfigId) newErrors.id_configuracion_prestaciones = "Requerido";
		if (tipoProducto !== 2) {
			if (!formData.unidad_medida) newErrors.unidad_medida = "Requerido";
			if (!formData.valor) newErrors.valor = "Requerido";
		} else {
			// Validar campos de mano de obra
			if (!especialidad) newErrors.especialidad = "Requerido";
			if (tipoSalario === "monthly" && !salarioInput) newErrors.salario = "Requerido";
			if (tipoSalario === "daily" && !salarioInput) newErrors.salario = "Requerido";
			if (tipoSalario === "multiplier" && !multiplicadorInput) newErrors.salario = "Requerido";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		if (!validateForm()) {
			setLoading(false);
			return;
		}

		try {
			const method = formData.id ? "put" : "post";
			const endpoint = "/productos";
			const action = formData.id ? "actualizado" : "creado";

			const payload: any = {
				id: formData.id,
				nombre: formData.nombre,
				tipo_proveedor: formData.tipo_proveedor,
				tipo_producto: formData.tipo_producto
			};

			// Si es mano de obra, agregar campos extra y ajustar
			if (tipoProducto !== 2) {
				payload.unidad_medida = formData.unidad_medida;
				payload.valor = formData.valor;
			} else {
				// Datos para mano de obra
				payload.unidad_medida = "Hora";
				payload.valor = jornalConPrestaciones;
				payload.salario_base = salarioBaseCalculado;
				payload.tipo_salario = tipoSalario;
				payload.multiplicador = multiplicadorInput;
				payload.id_configuracion_prestaciones = selectedConfigId ? Number(selectedConfigId) : null;
				payload.especialidad = especialidad;
				payload.jornada_horas = config?.horas_diarias || 8;
			}
			
			const response = await apiClient[method](endpoint, payload);

			if (response.data.success) {
				toast({
					variant: "success",
					title: `${titulo} ${action}`,
					description: `El insumo ha sido ${action} correctamente.`,
				});

				if (onSuccess) {
					onSuccess();
				}

				handleClose();

				if (typeof window !== "undefined") {
					window.dispatchEvent(
						new CustomEvent("insumoActualizado", {
							detail: { tipoProducto, action },
						})
					);
				}
			}
		} catch (err) {
			toast({
				variant: "destructive",
				title: `Error ${titulo}`,
				description: `Error al ${formData.id ? "actualizar" : "crear"} insumo.`,
			});
		} finally {
			setLoading(false);
		}
	};

	const handleClose = () => {
		setOpen(false);
		setFormData({
			id: 0,
			nombre: "",
			unidad_medida: "",
			valor: 0,
			tipo_proveedor: "",
			tipo_producto: tipoProducto,
		});
		setSelectedUnidadMedida("");
		setSelectedProveedor("");
		if (setInsumoEditar) setInsumoEditar(null);
		if (tipoProducto === 2) {
			setTipoSalario("monthly");
			setSalarioInput("");
			setMultiplicadorInput(1);
			setEspecialidad("");
		}
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				{mostrarBotonCrear ? (
					<Button className="gap-2 bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-200">
						<Plus className="h-4 w-4" />
						Nuevo {titulo}
					</Button>
				) : (
					""
				)}
			</DialogTrigger>

			<DialogContent className="sm:max-w-[500px] border-green-200">
				<DialogHeader>
					<DialogTitle className="text-green-900 flex items-center gap-2 text-3xl">
						{icon || <Building2 className="h-5 w-5 text-green-600" />}
						{formData.id ? `Editar ${titulo}` : `Crear nuevo ${titulo}`}
					</DialogTitle>
					<DialogDescription className="text-green-600">
						{descripcion}
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-0">
						<Label htmlFor="nombre" className="text-green-800">
							Nombre <span className="text-red-500">*</span>
						</Label>
						<Input
							id="nombre"
							name="nombre"
							placeholder={`${titulo} A`}
							value={formData.nombre}
							onChange={(e) => handleInputChange("nombre", e.target.value)}
							className="border-green-200 focus:border-green-400 focus:ring-green-400"
							required
						/>
					</div>

					{tipoProducto === 2 ? (
						<>
							{/* Campos específicos de mano de obra */}
							<div className="space-y-2">
								<Label className="text-green-800">Tipo de Salario *</Label>
								<div className="grid grid-cols-3 gap-2">
									{[
										{ value: "monthly", label: "Mensual" },
										{ value: "daily", label: "Jornal" },
										{ value: "multiplier", label: "Multiplicador" },
									].map((option) => (
										<button
											key={option.value}
											type="button"
											onClick={() => setTipoSalario(option.value)}
											className={`p-2 rounded-lg border-2 transition-all text-center ${tipoSalario === option.value
													? "border-green-500 bg-green-100 text-green-900 font-semibold"
													: "border-green-200 bg-white text-green-700 hover:border-green-300"
												}`}
										>
											<span className="text-xs">{option.label}</span>
										</button>
									))}
								</div>
							</div>

							<div className="space-y-2">
								{tipoSalario === "monthly" && (
									<>
										<Label>Salario Base Mensual (COP) *</Label>
										<Input
											type="number"
											placeholder="Ej: 1500000"
											value={salarioInput}
											onChange={(e) => setSalarioInput(e.target.value)}
											className="border-green-200"
										/>
									</>
								)}
								{tipoSalario === "daily" && (
									<>
										<Label>Jornal Básico (COP) *</Label>
										<Input
											type="number"
											placeholder="Ej: 50000"
											value={salarioInput}
											onChange={(e) => setSalarioInput(e.target.value)}
											className="border-green-200"
										/>
									</>
								)}
								{tipoSalario === "multiplier" && (
									<>
										<Label>Factor Multiplicador del SMMLV *</Label>
										<Input
											type="number"
											step="0.1"
											placeholder="Ej: 2.5"
											value={multiplicadorInput}
											onChange={(e) => setMultiplicadorInput(Number(e.target.value))}
											className="border-green-200"
										/>
									</>
								)}
								{errors.salario && <p className="text-red-500 text-sm">{errors.salario}</p>}
							</div>

							{salarioBaseCalculado > 0 && (
								<div className="bg-green-50 border border-green-200 rounded p-3">
									<p className="text-sm font-medium text-green-900">
										Salario Base: {formatCurrency(Math.round(salarioBaseCalculado))}
									</p>
									<p className="text-sm text-green-900">
										Jornal sin prestaciones: {formatCurrency(Math.round(jornalSinPrestaciones))}
									</p>
									<p className="text-sm font-bold text-green-700">
										Jornal con prestaciones ({benefitPercentage}%): 
										{formatCurrency(Math.round(jornalConPrestaciones))}
									</p>
									{selectedConfig && (
										<p className="text-xs text-green-600 mt-1">
											Configuración: {selectedConfig.nombre}
										</p>
									)}
								</div>
							)}

							<div className="space-y-2">
								<Label>Especialidad *</Label>
								<Select value={especialidad} onValueChange={setEspecialidad} required>
									<SelectTrigger className="border-green-200">
										<SelectValue placeholder="Seleccionar especialidad" />
									</SelectTrigger>
									<SelectContent>
										{specialties.map((spec) => (
											<SelectItem key={spec} value={spec}>
												{spec}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								{errors.especialidad && <p className="text-red-500 text-sm">{errors.especialidad}</p>}
							</div>

							<div className="space-y-2">
								<Label>Configuración de Prestaciones *</Label>
								<Select
									value={selectedConfigId}
									onValueChange={setSelectedConfigId}
									required
								>
									<SelectTrigger className="border-green-200">
										<SelectValue placeholder="Seleccionar configuración" />
									</SelectTrigger>
									<SelectContent>
										{configuraciones.map((cfg) => {
											const total = cfg.detalles
												.filter((d: any) => d.activo)
												.reduce((sum: number, d: any) => sum + Number(d.porcentaje), 0);
											return (
												<SelectItem key={cfg.id} value={cfg.id.toString()}>
													{cfg.nombre} ({total.toFixed(2)}%)
												</SelectItem>
											);
										})}
									</SelectContent>
								</Select>
								{errors.id_configuracion_prestaciones && (
									<p className="text-red-500 text-sm">{errors.id_configuracion_prestaciones}</p>
								)}
							</div>

							{/* Ocultamos unidad_medida y valor ya que se calculan */}
							<input type="hidden" name="unidad_medida" value="Hora" />
						</>
					) : (
						// Campos para otros tipos de productos (materiales, equipos)
						<>
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-0">
									<Label htmlFor="unidad_medida" className="text-green-800">
										Unidad de medida
									</Label>
									<Select
										value={selectedUnidadMedida}
										onValueChange={(value) => {
											setSelectedUnidadMedida(value);
											handleInputChange("unidad_medida", value);
										}}
									>
										<SelectTrigger className="border-green-200 focus:border-green-400 focus:ring-green-400">
											<SelectValue placeholder="Seleccionar unidad de medida" />
										</SelectTrigger>
										<SelectContent>
											{units.map((unit) => (
												<SelectItem key={unit.id} value={unit.nombre}>
													{unit.nombre}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									{errors.unidad_medida && (
										<p className="text-red-500 text-sm">{errors.unidad_medida}</p>
									)}
								</div>

								<div className="space-y-0">
									<Label htmlFor="valor" className="text-green-800">
										Valor Unitario <span className="text-red-500">*</span>
									</Label>
									<Input
										id="valor"
										name="valor"
										type="number"
										placeholder="0"
										value={formData.valor}
										onChange={(e) => handleInputChange("valor", e.target.value)}
										className="border-green-200 focus:border-green-400 focus:ring-green-400"
										required
									/>
									{errors.valor && (
										<p className="text-red-500 text-sm">{errors.valor}</p>
									)}
								</div>
							</div>
						</>
					)}

					<div className="space-y-0">
						<Label htmlFor="tipo_proveedor" className="text-green-800">
							Proveedor
						</Label>
						<Select
							value={selectedProveedor}
							onValueChange={(value) => {
								setSelectedProveedor(value);
								handleInputChange("tipo_proveedor", value);
							}}
						>
							<SelectTrigger className="border-green-200 focus:border-green-400 focus:ring-green-400">
								<SelectValue placeholder="Seleccionar proveedor" />
							</SelectTrigger>
							<SelectContent>
								{proveedores.map((proveedor) => (
									<SelectItem key={proveedor.id} value={proveedor.id}>
										{proveedor.nombre}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						{errors.tipo_proveedor && (
							<p className="text-red-500 text-sm">{errors.tipo_proveedor}</p>
						)}
					</div>

					<DialogFooter className="gap-2 pt-4">
						<Button
							type="button"
							variant="outline"
							onClick={handleClose}
							className="border-green-300 text-green-700 hover:bg-green-50"
						>
							Cancelar
						</Button>
						<Button
							type="submit"
							className="bg-green-600 hover:bg-green-700 text-white"
							disabled={loading}
						>
							{loading ? (
								<Loader className="h-4 w-4 animate-spin" />
							) : formData.id ? (
								`Actualizar ${titulo}`
							) : (
								`Crear ${titulo}`
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
			<Toaster />
		</Dialog>
	);
}