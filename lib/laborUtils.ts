export const benefitsScale = [
    { minMultiplier: 0, maxMultiplier: 1, percentage: 50.66 },
    { minMultiplier: 1, maxMultiplier: 2, percentage: 48.66 },
    { minMultiplier: 2, maxMultiplier: 3, percentage: 46.66 },
    { minMultiplier: 3, maxMultiplier: Infinity, percentage: 44.66 },
];

export const getBenefitPercentage = (multiplier: number): number => {
    const scale = benefitsScale.find(
        (s) => multiplier >= s.minMultiplier && multiplier < s.maxMultiplier
    );
    return scale ? scale.percentage : 44.66;
};

export const calculateBaseSalary = (
    tipoSalario: string,
    valor: number,
    multiplicador: number,
    salarioMinimo: number
): number => {
    switch (tipoSalario) {
        case 'monthly':
            return valor;
        case 'daily':
            return valor * 30; // Asumiendo 30 días, se puede usar el parámetro global
        case 'multiplier':
            return salarioMinimo * multiplicador;
        default:
            return 0;
    }
};

export const calculateJornal = (
    baseSalary: number,
    diasLaboralesMes: number
): number => {
    return baseSalary / diasLaboralesMes;
};

export const calculateJornalWithBenefits = (
    jornal: number,
    benefitPercentage: number
): number => {
    return jornal * (1 + benefitPercentage / 100);
};

export const calcularTotalPrestaciones = (configuracion: any): number => {
    if (!configuracion || !configuracion.detalles) return 0;
    return configuracion.detalles
        .filter((d: any) => d.activo)
        .reduce((sum: number, d: any) => sum + Number(d.porcentaje), 0);
};