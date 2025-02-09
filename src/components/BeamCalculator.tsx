import React, { useState, useEffect } from 'react';
import { Calculator, Info, Save } from 'lucide-react';
import { beamConditions, BeamParams, BeamResults } from '../data/beamConditions';

interface BeamCalculatorProps {
  selectedIx?: number;
  selectedIy?: number;
  selectedE?: number;
  onSaveResults: (results: {
    condition: string;
    F?: number;
    w?: number;
    L: number;
    deltaMax: number;
    shear: number;
    moments: { sag?: number; hog?: number; max: number };
  }) => void;
}

export default function BeamCalculator({ selectedIx, selectedIy, selectedE, onSaveResults }: BeamCalculatorProps) {
  const [selectedCondition, setSelectedCondition] = useState('');
  const [useIy, setUseIy] = useState(false);
  const [params, setParams] = useState<BeamParams>({
    F: 0,
    w: 0,
    L: 0,
    E: selectedE || 0,
    I: selectedIx || 0
  });
  const [results, setResults] = useState<BeamResults>({
    deltaMax: 0,
    shear: 0,
    moments: { max: 0 }
  });

  // Update parameters when section properties change
  useEffect(() => {
    const selectedI = useIy ? selectedIy : selectedIx;
    setParams(prev => ({
      ...prev,
      E: selectedE || 0,
      I: selectedI || 0
    }));
  }, [selectedE, selectedIx, selectedIy, useIy]);

  // Calculate results whenever parameters change
  useEffect(() => {
    calculateResults();
  }, [params, selectedCondition]);

  const calculateResults = () => {
    const condition = beamConditions.find(c => c.name === selectedCondition);
    if (!condition || !params.L || !params.I || !params.E) return;

    setResults({
      deltaMax: condition.calculateDeflection(params),
      shear: condition.calculateShear(params),
      moments: condition.calculateMoments(params)
    });
  };

  const handleParamChange = (name: keyof BeamParams, value: number) => {
    setParams(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveResult = () => {
    if (selectedCondition && params.L && results.deltaMax !== 0) {
      onSaveResults({
        condition: selectedCondition,
        F: params.F,
        w: params.w,
        L: params.L,
        deltaMax: results.deltaMax,
        shear: results.shear,
        moments: results.moments
      });
    }
  };

  const formatNumber = (num: number) => {
    if (!isFinite(num) || isNaN(num)) return '0';
    return Number(num.toPrecision(3)).toString();
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <Calculator className="w-6 h-6 mr-2" />
        Set Boundary Conditions and Loading
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Support Condition
          </label>
          <select
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            value={selectedCondition}
            onChange={(e) => setSelectedCondition(e.target.value)}
          >
            <option value="">Select a condition</option>
            {beamConditions.map((condition) => (
              <option key={condition.name} value={condition.name}>
                {condition.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Section Property
          </label>
          <select
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            value={useIy ? 'Iy' : 'Ix'}
            onChange={(e) => setUseIy(e.target.value === 'Iy')}
          >
            <option value="Ix">Use Ix</option>
            <option value="Iy">Use Iy</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {selectedCondition.includes('Distributed') ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              w (Load per unit length) [kN/m]
            </label>
            <input
              type="number"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={params.w || ''}
              onChange={(e) => handleParamChange('w', parseFloat(e.target.value))}
            />
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              F (Point load) [kN]
            </label>
            <input
              type="number"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={params.F || ''}
              onChange={(e) => handleParamChange('F', parseFloat(e.target.value))}
            />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            L (Length) [m]
          </label>
          <input
            type="number"
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            value={params.L || ''}
            onChange={(e) => handleParamChange('L', parseFloat(e.target.value))}
          />
        </div>
      </div>

      {/* Results Display */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="relative group">
            <div className="flex items-center space-x-2">
              <span className="text-lg font-mono">δ<sub>max</sub> =</span>
              <span className="text-xl font-semibold">
                {formatNumber(results.deltaMax)} mm
              </span>
              <Info className="w-4 h-4 text-gray-400 cursor-help" />
            </div>
            <div className="hidden group-hover:block absolute z-10 w-48 p-2 bg-gray-800 text-white text-sm rounded shadow-lg">
              Maximum deflection
            </div>
          </div>

          <div className="relative group">
            <div className="flex items-center space-x-2">
              <span className="text-lg font-mono">V<sub>max</sub> =</span>
              <span className="text-xl font-semibold">
                {formatNumber(results.shear)} kN
              </span>
              <Info className="w-4 h-4 text-gray-400 cursor-help" />
            </div>
            <div className="hidden group-hover:block absolute z-10 w-48 p-2 bg-gray-800 text-white text-sm rounded shadow-lg">
              Maximum shear force
            </div>
          </div>

          {results.moments.sag !== undefined ? (
            <>
              <div className="relative group">
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-mono">M<sub>sag</sub> =</span>
                  <span className="text-xl font-semibold">
                    {formatNumber(results.moments.sag)} kN⋅m
                  </span>
                  <Info className="w-4 h-4 text-gray-400 cursor-help" />
                </div>
                <div className="hidden group-hover:block absolute z-10 w-48 p-2 bg-gray-800 text-white text-sm rounded shadow-lg">
                  Maximum sagging moment
                </div>
              </div>
              <div className="relative group">
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-mono">M<sub>hog</sub> =</span>
                  <span className="text-xl font-semibold">
                    {formatNumber(Math.abs(results.moments.hog || 0))} kN⋅m
                  </span>
                  <Info className="w-4 h-4 text-gray-400 cursor-help" />
                </div>
                <div className="hidden group-hover:block absolute z-10 w-48 p-2 bg-gray-800 text-white text-sm rounded shadow-lg">
                  Maximum hogging moment
                </div>
              </div>
            </>
          ) : (
            <div className="relative group">
              <div className="flex items-center space-x-2">
                <span className="text-lg font-mono">M<sub>max</sub> =</span>
                <span className="text-xl font-semibold">
                  {formatNumber(results.moments.max)} kN⋅m
                </span>
                <Info className="w-4 h-4 text-gray-400 cursor-help" />
              </div>
              <div className="hidden group-hover:block absolute z-10 w-48 p-2 bg-gray-800 text-white text-sm rounded shadow-lg">
                Maximum bending moment
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Save Result Button */}
      <button
        onClick={handleSaveResult}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        disabled={!selectedCondition || !params.L || results.deltaMax === 0}
      >
        <Save className="w-4 h-4 mr-2" />
        Save Result
      </button>
    </div>
  );
}