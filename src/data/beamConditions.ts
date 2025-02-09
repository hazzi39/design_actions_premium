export interface BeamCondition {
  name: string;
  calculateDeflection: (params: BeamParams) => number;
  calculateShear: (params: BeamParams) => number;
  calculateMoments: (params: BeamParams) => { sag?: number; hog?: number; max: number };
}

export interface BeamParams {
  F?: number;  // Point load in kN
  w?: number;  // Distributed load in kN/m
  L: number;   // Length in meters
  E: number;   // Modulus of elasticity in MPa
  I: number;   // Moment of inertia in mm^4
}

export interface BeamResults {
  deltaMax: number;
  shear: number;
  moments: {
    sag?: number;
    hog?: number;
    max: number;
  };
}

export const beamConditions: BeamCondition[] = [
  {
    name: "Cantilever, End Load",
    calculateDeflection: ({ F = 0, L, E, I }) => (F * 1000 * Math.pow(L * 1000, 3)) / (3 * E * I),
    calculateShear: ({ F = 0 }) => F,
    calculateMoments: ({ F = 0, L }) => ({ max: F * L })
  },
  {
    name: "Cantilever, Uniform Distributed Load",
    calculateDeflection: ({ w = 0, L, E, I }) => (w * 1000 * Math.pow(L * 1000, 4)) / (8 * E * I),
    calculateShear: ({ w = 0, L }) => w * L,
    calculateMoments: ({ w = 0, L }) => ({ max: (w * Math.pow(L, 2)) / 2 })
  },
  {
    name: "Simply Supported, Center Load",
    calculateDeflection: ({ F = 0, L, E, I }) => (F * 1000 * Math.pow(L * 1000, 3)) / (48 * E * I),
    calculateShear: ({ F = 0 }) => F / 2,
    calculateMoments: ({ F = 0, L }) => ({ max: (F * L) / 4 })
  },
  {
    name: "Simply Supported, Uniform Distributed Load",
    calculateDeflection: ({ w = 0, L, E, I }) => (5 * w * 1000 * Math.pow(L * 1000, 4)) / (384 * E * I),
    calculateShear: ({ w = 0, L }) => (w * L) / 2,
    calculateMoments: ({ w = 0, L }) => ({ max: (w * Math.pow(L, 2)) / 8 })
  },
  {
    name: "Fixed-Fixed, Center Load",
    calculateDeflection: ({ F = 0, L, E, I }) => (F * 1000 * Math.pow(L * 1000, 3)) / (192 * E * I),
    calculateShear: ({ F = 0 }) => F / 2,
    calculateMoments: ({ F = 0, L }) => {
      const hogging = -(F * L) / 8;  // At supports
      const sagging = (F * L) / 8;   // At midspan
      return {
        sag: sagging,
        hog: hogging,
        max: Math.max(Math.abs(sagging), Math.abs(hogging))
      };
    }
  },
  {
    name: "Fixed-Fixed, Uniform Distributed Load",
    calculateDeflection: ({ w = 0, L, E, I }) => (w * 1000 * Math.pow(L * 1000, 4)) / (384 * E * I),
    calculateShear: ({ w = 0, L }) => (w * L) / 2,
    calculateMoments: ({ w = 0, L }) => {
      const hogging = -(w * Math.pow(L, 2)) / 12;  // At supports
      const sagging = (w * Math.pow(L, 2)) / 24;   // At midspan
      return {
        sag: sagging,
        hog: hogging,
        max: Math.max(Math.abs(sagging), Math.abs(hogging))
      };
    }
  }
];