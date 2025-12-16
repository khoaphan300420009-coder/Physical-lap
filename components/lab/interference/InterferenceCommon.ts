
// Physics Constants
export const NM_TO_M = 1e-9;
export const M_TO_MM = 1e3;

// Color Conversion (Wavelength to RGB)
export const nmToRGB = (wavelength: number) => {
    let Gamma = 0.80, IntensityMax = 255, R, G, B;
    if((wavelength >= 380) && (wavelength<440)){ R = -(wavelength - 440) / (440 - 380); G = 0.0; B = 1.0; }
    else if((wavelength >= 440) && (wavelength<490)){ R = 0.0; G = (wavelength - 440) / (490 - 440); B = 1.0; }
    else if((wavelength >= 490) && (wavelength<510)){ R = 0.0; G = 1.0; B = -(wavelength - 510) / (510 - 490); }
    else if((wavelength >= 510) && (wavelength<580)){ R = (wavelength - 510) / (580 - 510); G = 1.0; B = 0.0; }
    else if((wavelength >= 580) && (wavelength<645)){ R = 1.0; G = -(wavelength - 645) / (645 - 580); B = 0.0; }
    else if((wavelength >= 645) && (wavelength<781)){ R = 1.0; G = 0.0; B = 0.0; }
    else{ R = 0.0; G = 0.0; B = 0.0; }
    
    let factor;
    if((wavelength >= 380) && (wavelength<420)){ factor = 0.3 + 0.7*(wavelength - 380) / (420 - 380); }
    else if((wavelength >= 420) && (wavelength<701)){ factor = 1.0; }
    else if((wavelength >= 701) && (wavelength<781)){ factor = 0.3 + 0.7*(780 - wavelength) / (780 - 700); }
    else{ factor = 0.0; }

    const r = Math.round(IntensityMax * Math.pow(R * factor, Gamma));
    const g = Math.round(IntensityMax * Math.pow(G * factor, Gamma));
    const b = Math.round(IntensityMax * Math.pow(B * factor, Gamma));
    return `rgb(${r},${g},${b})`;
};

export const rgba = (wavelength: number, alpha: number) => {
    const rgb = nmToRGB(wavelength);
    return rgb.replace('rgb', 'rgba').replace(')', `,${alpha})`);
};

// Gaussian random for noise
export const gaussianRandom = (mean=0, stdev=1) => {
    const u = 1 - Math.random(); // Converting [0,1) to (0,1]
    const v = Math.random();
    const z = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
    return z * stdev + mean;
};
