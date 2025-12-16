
export const EPSILON_0 = 8.854e-12;

export const calculateCapacitance = (epsilon: number, area: number, dist: number): number => {
    // Area in cm^2 -> m^2 (1e-4)
    // Dist in mm -> m (1e-3)
    const A = area * 1e-4;
    const d = dist * 1e-3;
    // Return Farad
    return (epsilon * EPSILON_0 * A) / d;
};

export const calculateReactance = (f: number, C: number): number => {
    if (f === 0 || C === 0) return Infinity;
    return 1 / (2 * Math.PI * f * C);
};

export const calculateImpedance = (R: number, Xc: number): number => {
    return Math.sqrt(R*R + Xc*Xc);
};

export const calculateEnergy = (C: number, V: number): number => {
    return 0.5 * C * V * V;
};

export const calculateCharge = (C: number, V: number): number => {
    return C * V;
};
