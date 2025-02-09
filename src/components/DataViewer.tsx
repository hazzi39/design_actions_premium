import React, { useState, useEffect } from 'react';
import { Info, Save, Table, Download } from 'lucide-react';
import { structuralData, uniqueSections } from '../data';
import BeamCalculator from './BeamCalculator';

interface SavedResult {
  timestamp: string;
  section: string;
  designation: string;
  condition: string;
  F?: number;
  w?: number;
  L: number;
  deltaMax: number;
  shear: number;
  moments: {
    sag?: number;
    hog?: number;
    max: number;
  };
}

export default function DataViewer() {
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedDesignation, setSelectedDesignation] = useState('');
  const [availableDesignations, setAvailableDesignations] = useState<string[]>([]);
  const [savedResults, setSavedResults] = useState<SavedResult[]>([]);
  const [currentData, setCurrentData] = useState<any>(null);

  useEffect(() => {
    if (selectedSection) {
      const designations = structuralData
        .filter((item) => item.Section === selectedSection)
        .map((item) => item.Designation);
      setAvailableDesignations(designations);
      setSelectedDesignation('');
    }
  }, [selectedSection]);

  useEffect(() => {
    if (selectedSection && selectedDesignation) {
      const data = structuralData.find(
        (item) =>
          item.Section === selectedSection && item.Designation === selectedDesignation
      );
      setCurrentData(data);
    }
  }, [selectedSection, selectedDesignation]);

  const handleSaveBeamResults = (results: {
    condition: string;
    F?: number;
    w?: number;
    L: number;
    deltaMax: number;
    shear: number;
    moments: { sag?: number; hog?: number; max: number };
  }) => {
    const newResult: SavedResult = {
      timestamp: new Date().toLocaleString(),
      section: selectedSection,
      designation: selectedDesignation,
      ...results
    };
    setSavedResults([...savedResults, newResult]);
  };

  const formatNumber = (num: number) => {
    if (!isFinite(num) || isNaN(num)) return '0';
    return Number(num).toPrecision(3);
  };

  const handleExportCSV = () => {
    const headers = [
      'Timestamp',
      'Section',
      'Designation',
      'Condition',
      'Load',
      'Length (m)',
      'Max Deflection (mm)',
      'Max Shear (kN)',
      'Moments (kN⋅m)'
    ];

    const csvContent = savedResults.map(result => {
      const load = result.F 
        ? `F = ${formatNumber(result.F)} kN`
        : `w = ${formatNumber(result.w || 0)} kN/m`;
      
      const moments = result.moments.sag !== undefined
        ? `Sag: ${formatNumber(result.moments.sag)}, Hog: ${formatNumber(Math.abs(result.moments.hog || 0))}`
        : formatNumber(result.moments.max);

      return [
        result.timestamp,
        result.section,
        result.designation,
        result.condition,
        load,
        formatNumber(result.L),
        formatNumber(result.deltaMax),
        formatNumber(result.shear),
        moments
      ].join(',');
    });

    const csv = [headers.join(','), ...csvContent].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'beam_calculations.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            Design Actions M*, V* and Deflection Calculator
          </h1>

          {/* Mathematical Notation */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <p className="text-lg font-mono text-gray-700">
              I<sub>x</sub>, I<sub>y</sub>: Second Moment of Area
            </p>
            <p className="text-lg font-mono text-gray-700">
              E: Modulus of Elasticity
            </p>
          </div>

          {/* Selection Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Section
              </label>
              <select
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
              >
                <option value="">Select a section</option>
                {uniqueSections.map((section) => (
                  <option key={section} value={section}>
                    {section}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Designation
              </label>
              <select
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={selectedDesignation}
                onChange={(e) => setSelectedDesignation(e.target.value)}
                disabled={!selectedSection}
              >
                <option value="">Select a designation</option>
                {availableDesignations.map((designation) => (
                  <option key={designation} value={designation}>
                    {designation}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Display */}
          {currentData && (
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Section Properties</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="relative group">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-mono">
                      I<sub>x</sub> =
                    </span>
                    <span className="text-xl font-semibold">{formatNumber(currentData.Ix)}</span>
                    <Info className="w-4 h-4 text-gray-400 cursor-help" />
                  </div>
                  <div className="hidden group-hover:block absolute z-10 w-48 p-2 bg-gray-800 text-white text-sm rounded shadow-lg">
                    Second moment of area about the x-axis
                  </div>
                </div>

                <div className="relative group">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-mono">
                      I<sub>y</sub> =
                    </span>
                    <span className="text-xl font-semibold">{formatNumber(currentData.Iy)}</span>
                    <Info className="w-4 h-4 text-gray-400 cursor-help" />
                  </div>
                  <div className="hidden group-hover:block absolute z-10 w-48 p-2 bg-gray-800 text-white text-sm rounded shadow-lg">
                    Second moment of area about the y-axis
                  </div>
                </div>

                <div className="relative group">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-mono">E =</span>
                    <span className="text-xl font-semibold">{formatNumber(currentData.E)}</span>
                    <Info className="w-4 h-4 text-gray-400 cursor-help" />
                  </div>
                  <div className="hidden group-hover:block absolute z-10 w-48 p-2 bg-gray-800 text-white text-sm rounded shadow-lg">
                    Modulus of elasticity
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Beam Calculator */}
          {currentData && (
            <BeamCalculator
              selectedIx={currentData.Ix}
              selectedIy={currentData.Iy}
              selectedE={currentData.E}
              onSaveResults={handleSaveBeamResults}
            />
          )}

          {/* Saved Results Table */}
          {savedResults.length > 0 && (
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                  <Table className="w-5 h-5 mr-2" />
                  Saved Results
                </h2>
                <div className="space-x-4">
                  <button
                    onClick={handleExportCSV}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Section</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Designation</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Condition</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Load</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">L [m]</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">δ<sub>max</sub> [mm]</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">V<sub>max</sub> [kN]</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">M [kN⋅m]</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {savedResults.map((result, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{result.timestamp}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{result.section}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{result.designation}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{result.condition}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {result.F 
                            ? `F = ${formatNumber(result.F)} kN` 
                            : `w = ${formatNumber(result.w || 0)} kN/m`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatNumber(result.L)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatNumber(result.deltaMax)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatNumber(result.shear)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {result.moments.sag !== undefined
                            ? `Sag: ${formatNumber(result.moments.sag)}, Hog: ${formatNumber(Math.abs(result.moments.hog || 0))}`
                            : formatNumber(result.moments.max)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}