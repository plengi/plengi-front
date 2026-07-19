export interface PrestacionFactor {
    nombre: string;
    descripcion: string;
    porcentaje: number;
    activo: boolean;
}

export interface PrestacionesData {
    auxilio_transporte: {
        activo: boolean;
        porcentaje: number;
        valor: number;
    };
    seguridad_social: PrestacionFactor[];
    prestaciones: PrestacionFactor[];
    parafiscales: PrestacionFactor[];
    otros: PrestacionFactor[];
}

export const getDefaultPrestaciones = (salarioBase: number, auxilioTransporte: number): PrestacionesData => {
    const auxilioPorcentaje = (auxilioTransporte / salarioBase) * 100;

    return {
        auxilio_transporte: {
            activo: true,
            porcentaje: Math.round(auxilioPorcentaje * 100) / 100,
            valor: auxilioTransporte,
        },
        seguridad_social: [
            { nombre: "Pensión", descripcion: "Aporte patronal al sistema de pensiones", porcentaje: 12.00, activo: true },
            { nombre: "Salud", descripcion: "Aporte patronal al sistema de salud", porcentaje: 8.50, activo: true },
            { nombre: "Riesgos Profesionales", descripcion: "Seguro de accidentes de trabajo (construcción)", porcentaje: 6.96, activo: true },
        ],
        prestaciones: [
            { nombre: "Cesantía Anual", descripcion: "Fondo de cesantía", porcentaje: 8.33, activo: true },
            { nombre: "Intereses de Cesantía", descripcion: "Intereses legales sobre cesantías", porcentaje: 1.00, activo: true },
            { nombre: "Vacaciones 15 días", descripcion: "Derecho a vacaciones remuneradas", porcentaje: 4.17, activo: true },
            { nombre: "Prima - 30 días", descripcion: "Equivalente mensual (dos pagas al año)", porcentaje: 8.33, activo: true },
        ],
        parafiscales: [
            { nombre: "Caja de Compensación", descripcion: "Aportes a fondo de compensación", porcentaje: 4.00, activo: true },
            { nombre: "ICBF", descripcion: "Instituto Colombiano de Bienestar Familiar", porcentaje: 3.00, activo: true },
            { nombre: "SENA", descripcion: "Servicio Nacional de Aprendizaje", porcentaje: 2.00, activo: true },
            { nombre: "FIC Construcción", descripcion: "Fondo de Industria de la Construcción", porcentaje: 2.50, activo: true },
        ],
        otros: [
            { nombre: "Dotación y Seguridad Industrial", descripcion: "Equipos de protección personal y seguridad", porcentaje: 4.00, activo: true },
        ],
    };
};