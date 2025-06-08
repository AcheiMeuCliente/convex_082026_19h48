import { useEffect, useState } from "react";
import { Doc, Id } from "../../convex/_generated/dataModel";

interface CompanyMapProps {
  companies: Doc<"companies">[];
  selectedCompanyId?: Id<"companies"> | null;
  onCompanySelect: (id: Id<"companies">) => void;
}

export function CompanyMap({ companies, selectedCompanyId, onCompanySelect }: CompanyMapProps) {
  const [stateDistribution, setStateDistribution] = useState<Record<string, number>>({});

  useEffect(() => {
    const distribution = companies.reduce((acc, company) => {
      acc[company.estado] = (acc[company.estado] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    setStateDistribution(distribution);
  }, [companies]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          Company Locations
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Interactive map showing company locations based on address data
        </p>
      </div>
      
      <div className="p-4">
        <div className="w-full h-96 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Interactive Map</h3>
            <p className="text-gray-500 text-sm">Map showing {companies.length} companies</p>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              {Object.entries(stateDistribution)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 6)
                .map(([state, count]) => (
                <div key={state} className="flex justify-between bg-white rounded px-2 py-1">
                  <span className="font-medium">{state}</span>
                  <span className="text-gray-600">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {companies.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>
              {companies.filter(c => c.endereco_mapa).length} of {companies.length} companies have address data
            </span>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <span>Regular</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                <span>Selected</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
