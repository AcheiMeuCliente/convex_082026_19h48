import { useState } from "react";

interface FiltersSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  filters: {
    search: string;
    cnae: string;
    estado: string;
    municipio: string;
    porte: string;
    mei: boolean | undefined;
    simples: boolean | undefined;
    tem_email: boolean | undefined;
    tem_telefone: boolean | undefined;
  };
  onFiltersChange: (filters: any) => void;
  cnaes: Array<{ codigo: string; nome: string; total: number }>;
  estados: Array<{ codigo: string; total: number }>;
  municipios: Array<{ nome: string; total: number }>;
}

const PORTES = [
  "MEI",
  "MICRO EMPRESA", 
  "PEQUENA EMPRESA",
  "MÉDIA EMPRESA",
  "GRANDE EMPRESA"
];

const MATRIZ_FILIAL_OPTIONS = [
  "MATRIZ",
  "FILIAL"
];

export function FiltersSidebar({ 
  isOpen, 
  onClose, 
  filters, 
  onFiltersChange, 
  cnaes, 
  estados, 
  municipios 
}: FiltersSidebarProps) {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleFilterChange = (key: string, value: string | boolean | undefined) => {
    const newFilters = { 
      ...localFilters, 
      [key]: value,
      // Clear município when estado changes
      ...(key === 'estado' ? { municipio: '' } : {})
    };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    const clearedFilters = { 
      search: "", 
      cnae: "", 
      estado: "", 
      municipio: "",
      porte: "", 
      mei: undefined,
      simples: undefined,
      tem_email: undefined,
      tem_telefone: undefined,
    };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const hasActiveFilters = Object.values(localFilters).some(value => 
    value !== "" && value !== undefined
  );

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl z-50 overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Advanced Filters</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear all filters
            </button>
          )}
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Search */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Company Search
            </label>
            <input
              type="text"
              id="search"
              placeholder="Company name, CNPJ, or trade name..."
              value={localFilters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>

          {/* Location Filters */}
          <div className="space-y-4">
            <h3 className="text-md font-medium text-gray-900">Location</h3>
            
            <div>
              <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-1">
                State
              </label>
              <select
                id="estado"
                value={localFilters.estado}
                onChange={(e) => handleFilterChange("estado", e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="">All states</option>
                {estados.map(estado => (
                  <option key={estado.codigo} value={estado.codigo}>
                    {estado.codigo} ({estado.total})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="municipio" className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <select
                id="municipio"
                value={localFilters.municipio}
                onChange={(e) => handleFilterChange("municipio", e.target.value)}
                disabled={!localFilters.estado}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:bg-gray-100"
              >
                <option value="">All cities</option>
                {municipios.map(municipio => (
                  <option key={municipio.nome} value={municipio.nome}>
                    {municipio.nome} ({municipio.total})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Business Classification */}
          <div className="space-y-4">
            <h3 className="text-md font-medium text-gray-900">Business Classification</h3>
            
            <div>
              <label htmlFor="cnae" className="block text-sm font-medium text-gray-700 mb-1">
                Primary CNAE
              </label>
              <select
                id="cnae"
                value={localFilters.cnae}
                onChange={(e) => handleFilterChange("cnae", e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="">All CNAEs</option>
                {cnaes.slice(0, 50).map(cnae => (
                  <option key={cnae.codigo} value={cnae.codigo}>
                    {cnae.codigo} - {cnae.nome.substring(0, 40)}... ({cnae.total})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="porte" className="block text-sm font-medium text-gray-700 mb-1">
                Company Size
              </label>
              <select
                id="porte"
                value={localFilters.porte}
                onChange={(e) => handleFilterChange("porte", e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="">All sizes</option>
                {PORTES.map(porte => (
                  <option key={porte} value={porte}>{porte}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tax Status */}
          <div className="space-y-4">
            <h3 className="text-md font-medium text-gray-900">Tax Status</h3>
            
            <div>
              <label htmlFor="mei" className="block text-sm font-medium text-gray-700 mb-1">
                MEI Status
              </label>
              <select
                id="mei"
                value={localFilters.mei === undefined ? "" : localFilters.mei.toString()}
                onChange={(e) => handleFilterChange("mei", e.target.value === "" ? undefined : e.target.value === "true")}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="">All</option>
                <option value="true">MEI only</option>
                <option value="false">Non-MEI</option>
              </select>
            </div>

            <div>
              <label htmlFor="simples" className="block text-sm font-medium text-gray-700 mb-1">
                Simples Nacional
              </label>
              <select
                id="simples"
                value={localFilters.simples === undefined ? "" : localFilters.simples.toString()}
                onChange={(e) => handleFilterChange("simples", e.target.value === "" ? undefined : e.target.value === "true")}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="">All</option>
                <option value="true">Simples Nacional</option>
                <option value="false">Non-Simples</option>
              </select>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-md font-medium text-gray-900">Contact Information</h3>
            
            <div>
              <label htmlFor="tem_email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Available
              </label>
              <select
                id="tem_email"
                value={localFilters.tem_email === undefined ? "" : localFilters.tem_email.toString()}
                onChange={(e) => handleFilterChange("tem_email", e.target.value === "" ? undefined : e.target.value === "true")}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="">All</option>
                <option value="true">With email</option>
                <option value="false">Without email</option>
              </select>
            </div>

            <div>
              <label htmlFor="tem_telefone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Available
              </label>
              <select
                id="tem_telefone"
                value={localFilters.tem_telefone === undefined ? "" : localFilters.tem_telefone.toString()}
                onChange={(e) => handleFilterChange("tem_telefone", e.target.value === "" ? undefined : e.target.value === "true")}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="">All</option>
                <option value="true">With phone</option>
                <option value="false">Without phone</option>
              </select>
            </div>
          </div>

          {/* Active Filters Summary */}
          {hasActiveFilters && (
            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Active Filters</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(localFilters).map(([key, value]) => {
                  if (value === "" || value === undefined) return null;
                  return (
                    <span
                      key={key}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {key}: {value.toString()}
                      <button
                        onClick={() => handleFilterChange(key, key.includes('tem_') || key === 'mei' || key === 'simples' ? undefined : "")}
                        className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-600"
                      >
                        ×
                      </button>
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
