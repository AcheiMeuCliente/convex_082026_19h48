import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

interface CompanyFiltersProps {
  onFiltersChange: (filters: any) => void;
  onClearFilters: () => void;
}

export function CompanyFilters({ onFiltersChange, onClearFilters }: CompanyFiltersProps) {
  const [filters, setFilters] = useState({
    search: "",
    cnae: "",
    estado: "",
    municipio: "",
    porte: "",
    mei: "",
    simples: "",
    tem_email: "",
    tem_telefone: "",
    bairro: "",
    cep: "",
    matriz_filial: "",
    natureza_juridica: "",
    porte_empresa: "",
    dominio_corporativo: "",
    capital_social_min: "",
    capital_social_max: "",
    data_inicio_from: "",
    data_inicio_to: "",
    idade_min: "",
    idade_max: "",
  });

  const [isExpanded, setIsExpanded] = useState(false);

  const cnaes = useQuery(api.companies.getUniqueCnaes);
  const estados = useQuery(api.companies.getUniqueEstados);
  const municipios = useQuery(api.companies.getMunicipiosByEstado, 
    filters.estado ? { estado: filters.estado } : "skip"
  );
  
  // Queries para valores únicos dos novos campos
  const bairros = useQuery(api.companies.getUniqueValues, { field: "bairro" });
  const matrizFilial = useQuery(api.companies.getUniqueValues, { field: "matriz_filial" });
  const naturezasJuridicas = useQuery(api.companies.getUniqueValues, { field: "natureza_juridica" });
  const portesEmpresa = useQuery(api.companies.getUniqueValues, { field: "porte_empresa" });
  const dominiosCorporativos = useQuery(api.companies.getUniqueValues, { field: "dominio_corporativo" });

  useEffect(() => {
    const processedFilters = {
      ...filters,
      mei: filters.mei === "" ? undefined : filters.mei === "true",
      simples: filters.simples === "" ? undefined : filters.simples === "true",
      tem_email: filters.tem_email === "" ? undefined : filters.tem_email === "true",
      tem_telefone: filters.tem_telefone === "" ? undefined : filters.tem_telefone === "true",
      capital_social_min: filters.capital_social_min ? parseFloat(filters.capital_social_min) : undefined,
      capital_social_max: filters.capital_social_max ? parseFloat(filters.capital_social_max) : undefined,
      idade_min: filters.idade_min ? parseInt(filters.idade_min) : undefined,
      idade_max: filters.idade_max ? parseInt(filters.idade_max) : undefined,
    };

    // Remove campos vazios
    Object.keys(processedFilters).forEach(key => {
      if ((processedFilters as any)[key] === "" || (processedFilters as any)[key] === undefined) {
        delete (processedFilters as any)[key];
      }
    });

    onFiltersChange(processedFilters);
  }, [filters, onFiltersChange]);

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      search: "",
      cnae: "",
      estado: "",
      municipio: "",
      porte: "",
      mei: "",
      simples: "",
      tem_email: "",
      tem_telefone: "",
      bairro: "",
      cep: "",
      matriz_filial: "",
      natureza_juridica: "",
      porte_empresa: "",
      dominio_corporativo: "",
      capital_social_min: "",
      capital_social_max: "",
      data_inicio_from: "",
      data_inicio_to: "",
      idade_min: "",
      idade_max: "",
    });
    onClearFilters();
  };

  const formatCNPJ = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 2) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
    if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
    if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12, 14)}`;
  };

  const formatCEP = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 5) return digits;
    return `${digits.slice(0, 5)}-${digits.slice(5, 8)}`;
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== "");

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
            {hasActiveFilters && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Filtros ativos
              </span>
            )}
          </div>
          <div className="flex items-center space-x-3">
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Limpar
              </button>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              {isExpanded ? "Recolher" : "Expandir"}
            </button>
          </div>
        </div>
      </div>

      {/* Filtros Básicos */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Busca */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              placeholder="Razão social..."
              className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* CNAE */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CNAE
            </label>
            <select
              value={filters.cnae}
              onChange={(e) => handleFilterChange("cnae", e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos</option>
              {cnaes?.slice(0, 20).map(cnae => (
                <option key={cnae.codigo} value={cnae.codigo}>
                  {cnae.codigo} - {cnae.nome.substring(0, 30)}... ({cnae.total})
                </option>
              ))}
            </select>
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              value={filters.estado}
              onChange={(e) => handleFilterChange("estado", e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos</option>
              {estados?.map(estado => (
                <option key={estado.codigo} value={estado.codigo}>
                  {estado.codigo} ({estado.total})
                </option>
              ))}
            </select>
          </div>

          {/* MEI */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              MEI
            </label>
            <select
              value={filters.mei}
              onChange={(e) => handleFilterChange("mei", e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos</option>
              <option value="true">Sim</option>
              <option value="false">Não</option>
            </select>
          </div>
        </div>

        {/* Filtros Expandidos */}
        {isExpanded && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Município */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Município
                </label>
                <select
                  value={filters.municipio}
                  onChange={(e) => handleFilterChange("municipio", e.target.value)}
                  disabled={!filters.estado}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                >
                  <option value="">Todos</option>
                  {municipios?.map(municipio => (
                    <option key={municipio.nome} value={municipio.nome}>
                      {municipio.nome} ({municipio.total})
                    </option>
                  ))}
                </select>
              </div>

              {/* Bairro */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bairro
                </label>
                <select
                  value={filters.bairro}
                  onChange={(e) => handleFilterChange("bairro", e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Todos</option>
                  {bairros?.slice(0, 50).map(bairro => (
                    <option key={bairro as string} value={bairro as string}>
                      {bairro as string}
                    </option>
                  ))}
                </select>
              </div>

              {/* CEP */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CEP
                </label>
                <input
                  type="text"
                  value={filters.cep}
                  onChange={(e) => handleFilterChange("cep", formatCEP(e.target.value))}
                  placeholder="00000-000"
                  maxLength={9}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Matriz/Filial */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Matriz/Filial
                </label>
                <select
                  value={filters.matriz_filial}
                  onChange={(e) => handleFilterChange("matriz_filial", e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Todos</option>
                  {matrizFilial?.map(tipo => (
                    <option key={tipo as string} value={tipo as string}>
                      {tipo as string}
                    </option>
                  ))}
                </select>
              </div>

              {/* Natureza Jurídica */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Natureza Jurídica
                </label>
                <select
                  value={filters.natureza_juridica}
                  onChange={(e) => handleFilterChange("natureza_juridica", e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Todas</option>
                  {naturezasJuridicas?.map(natureza => (
                    <option key={natureza as string} value={natureza as string}>
                      {natureza as string}
                    </option>
                  ))}
                </select>
              </div>

              {/* Porte da Empresa */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Porte da Empresa
                </label>
                <select
                  value={filters.porte_empresa}
                  onChange={(e) => handleFilterChange("porte_empresa", e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Todos</option>
                  {portesEmpresa?.map(porte => (
                    <option key={porte as string} value={porte as string}>
                      {porte as string}
                    </option>
                  ))}
                </select>
              </div>

              {/* Domínio Corporativo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Domínio Corporativo
                </label>
                <select
                  value={filters.dominio_corporativo}
                  onChange={(e) => handleFilterChange("dominio_corporativo", e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Todos</option>
                  {dominiosCorporativos?.map(dominio => (
                    <option key={dominio as string} value={dominio as string}>
                      {dominio as string}
                    </option>
                  ))}
                </select>
              </div>

              {/* Simples Nacional */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Simples Nacional
                </label>
                <select
                  value={filters.simples}
                  onChange={(e) => handleFilterChange("simples", e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Todos</option>
                  <option value="true">Sim</option>
                  <option value="false">Não</option>
                </select>
              </div>

              {/* Tem Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tem Email
                </label>
                <select
                  value={filters.tem_email}
                  onChange={(e) => handleFilterChange("tem_email", e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Todos</option>
                  <option value="true">Sim</option>
                  <option value="false">Não</option>
                </select>
              </div>

              {/* Tem Telefone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tem Telefone
                </label>
                <select
                  value={filters.tem_telefone}
                  onChange={(e) => handleFilterChange("tem_telefone", e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Todos</option>
                  <option value="true">Sim</option>
                  <option value="false">Não</option>
                </select>
              </div>

              {/* Capital Social Mínimo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Capital Social Mínimo (R$)
                </label>
                <input
                  type="number"
                  value={filters.capital_social_min}
                  onChange={(e) => handleFilterChange("capital_social_min", e.target.value)}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Capital Social Máximo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Capital Social Máximo (R$)
                </label>
                <input
                  type="number"
                  value={filters.capital_social_max}
                  onChange={(e) => handleFilterChange("capital_social_max", e.target.value)}
                  placeholder="999999999"
                  min="0"
                  step="0.01"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Data Início - De */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data Início - De
                </label>
                <input
                  type="date"
                  value={filters.data_inicio_from}
                  onChange={(e) => handleFilterChange("data_inicio_from", e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Data Início - Até */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data Início - Até
                </label>
                <input
                  type="date"
                  value={filters.data_inicio_to}
                  onChange={(e) => handleFilterChange("data_inicio_to", e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Idade Mínima */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Idade Mínima (anos)
                </label>
                <input
                  type="number"
                  value={filters.idade_min}
                  onChange={(e) => handleFilterChange("idade_min", e.target.value)}
                  placeholder="0"
                  min="0"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Idade Máxima */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Idade Máxima (anos)
                </label>
                <input
                  type="number"
                  value={filters.idade_max}
                  onChange={(e) => handleFilterChange("idade_max", e.target.value)}
                  placeholder="100"
                  min="0"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
