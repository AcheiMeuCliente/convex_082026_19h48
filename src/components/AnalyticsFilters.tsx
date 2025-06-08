import { useState } from "react";

interface FilterOptions {
  naturezasJuridicas: string[];
  portesEmpresa: string[];
  cnaes: Array<{ codigo: string; nome: string; total: number }>;
}

interface FilterState {
  cnpj: string;
  razao_social: string;
  nome_fantasia: string;
  cep: string;
  logradouro: string;
  capital_social_min: string;
  capital_social_max: string;
  codigo_cnae_fiscal: string;
  natureza_juridica: string;
  porte_empresa: string;
  data_inicio_atividade_from: string;
  data_inicio_atividade_to: string;
  is_mei: boolean | null;
  opcao_pelo_simples: boolean | null;
  has_website: boolean | null;
}

interface AnalyticsFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: Partial<FilterState>) => void;
  onClearFilters: () => void;
  filterOptions: FilterOptions;
}

export function AnalyticsFilters({ 
  filters, 
  onFilterChange, 
  onClearFilters, 
  filterOptions 
}: AnalyticsFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleInputChange = (field: keyof FilterState, value: string | boolean | null) => {
    onFilterChange({ [field]: value });
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

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== "" && value !== null
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Filtros de Análise
            </h2>
            {hasActiveFilters && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Filtros ativos
              </span>
            )}
          </div>
          <div className="flex items-center space-x-3">
            {hasActiveFilters && (
              <button
                onClick={onClearFilters}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Limpar Filtros
              </button>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isExpanded ? (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                  Recolher
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  Expandir Filtros
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Filtros Básicos (sempre visíveis) */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* CNPJ */}
          <div>
            <label htmlFor="cnpj" className="block text-sm font-medium text-gray-700 mb-1">
              CNPJ
            </label>
            <input
              type="text"
              id="cnpj"
              value={filters.cnpj}
              onChange={(e) => handleInputChange("cnpj", formatCNPJ(e.target.value))}
              placeholder="00.000.000/0000-00"
              maxLength={18}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Razão Social */}
          <div>
            <label htmlFor="razao_social" className="block text-sm font-medium text-gray-700 mb-1">
              Razão Social
            </label>
            <input
              type="text"
              id="razao_social"
              value={filters.razao_social}
              onChange={(e) => handleInputChange("razao_social", e.target.value)}
              placeholder="Digite a razão social..."
              className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* CNAE */}
          <div>
            <label htmlFor="codigo_cnae_fiscal" className="block text-sm font-medium text-gray-700 mb-1">
              Atividade Principal (CNAE)
            </label>
            <select
              id="codigo_cnae_fiscal"
              value={filters.codigo_cnae_fiscal}
              onChange={(e) => handleInputChange("codigo_cnae_fiscal", e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todas as atividades</option>
              {filterOptions.cnaes.slice(0, 50).map(cnae => (
                <option key={cnae.codigo} value={cnae.codigo}>
                  {cnae.codigo} - {cnae.nome.substring(0, 40)}... ({cnae.total})
                </option>
              ))}
            </select>
          </div>

          {/* MEI */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              MEI?
            </label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="is_mei"
                  checked={filters.is_mei === true}
                  onChange={() => handleInputChange("is_mei", true)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">Sim</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="is_mei"
                  checked={filters.is_mei === false}
                  onChange={() => handleInputChange("is_mei", false)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">Não</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="is_mei"
                  checked={filters.is_mei === null}
                  onChange={() => handleInputChange("is_mei", null)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">Todos</span>
              </label>
            </div>
          </div>
        </div>

        {/* Filtros Expandidos */}
        {isExpanded && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Nome Fantasia */}
              <div>
                <label htmlFor="nome_fantasia" className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Fantasia
                </label>
                <input
                  type="text"
                  id="nome_fantasia"
                  value={filters.nome_fantasia}
                  onChange={(e) => handleInputChange("nome_fantasia", e.target.value)}
                  placeholder="Digite o nome fantasia..."
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* CEP */}
              <div>
                <label htmlFor="cep" className="block text-sm font-medium text-gray-700 mb-1">
                  CEP
                </label>
                <input
                  type="text"
                  id="cep"
                  value={filters.cep}
                  onChange={(e) => handleInputChange("cep", formatCEP(e.target.value))}
                  placeholder="00000-000"
                  maxLength={9}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Endereço Completo */}
              <div>
                <label htmlFor="logradouro" className="block text-sm font-medium text-gray-700 mb-1">
                  Endereço Completo
                </label>
                <input
                  type="text"
                  id="logradouro"
                  value={filters.logradouro}
                  onChange={(e) => handleInputChange("logradouro", e.target.value)}
                  placeholder="Digite o endereço..."
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Capital Social Mínimo */}
              <div>
                <label htmlFor="capital_social_min" className="block text-sm font-medium text-gray-700 mb-1">
                  Capital Social Mínimo (R$)
                </label>
                <input
                  type="number"
                  id="capital_social_min"
                  value={filters.capital_social_min}
                  onChange={(e) => handleInputChange("capital_social_min", e.target.value)}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Capital Social Máximo */}
              <div>
                <label htmlFor="capital_social_max" className="block text-sm font-medium text-gray-700 mb-1">
                  Capital Social Máximo (R$)
                </label>
                <input
                  type="number"
                  id="capital_social_max"
                  value={filters.capital_social_max}
                  onChange={(e) => handleInputChange("capital_social_max", e.target.value)}
                  placeholder="999999999"
                  min="0"
                  step="0.01"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Natureza Jurídica */}
              <div>
                <label htmlFor="natureza_juridica" className="block text-sm font-medium text-gray-700 mb-1">
                  Natureza Jurídica
                </label>
                <select
                  id="natureza_juridica"
                  value={filters.natureza_juridica}
                  onChange={(e) => handleInputChange("natureza_juridica", e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Todas as naturezas</option>
                  {filterOptions.naturezasJuridicas.map(natureza => (
                    <option key={natureza} value={natureza}>
                      {natureza}
                    </option>
                  ))}
                </select>
              </div>

              {/* Porte da Empresa */}
              <div>
                <label htmlFor="porte_empresa" className="block text-sm font-medium text-gray-700 mb-1">
                  Porte da Empresa
                </label>
                <select
                  id="porte_empresa"
                  value={filters.porte_empresa}
                  onChange={(e) => handleInputChange("porte_empresa", e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Todos os portes</option>
                  {filterOptions.portesEmpresa.map(porte => (
                    <option key={porte} value={porte}>
                      {porte}
                    </option>
                  ))}
                </select>
              </div>

              {/* Data de Abertura - De */}
              <div>
                <label htmlFor="data_inicio_atividade_from" className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Abertura - De
                </label>
                <input
                  type="date"
                  id="data_inicio_atividade_from"
                  value={filters.data_inicio_atividade_from}
                  onChange={(e) => handleInputChange("data_inicio_atividade_from", e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Data de Abertura - Até */}
              <div>
                <label htmlFor="data_inicio_atividade_to" className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Abertura - Até
                </label>
                <input
                  type="date"
                  id="data_inicio_atividade_to"
                  value={filters.data_inicio_atividade_to}
                  onChange={(e) => handleInputChange("data_inicio_atividade_to", e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Checkboxes/Switches */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Simples Nacional */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Simples Nacional?
                </label>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="opcao_pelo_simples"
                      checked={filters.opcao_pelo_simples === true}
                      onChange={() => handleInputChange("opcao_pelo_simples", true)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">Sim</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="opcao_pelo_simples"
                      checked={filters.opcao_pelo_simples === false}
                      onChange={() => handleInputChange("opcao_pelo_simples", false)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">Não</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="opcao_pelo_simples"
                      checked={filters.opcao_pelo_simples === null}
                      onChange={() => handleInputChange("opcao_pelo_simples", null)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">Todos</span>
                  </label>
                </div>
              </div>

              {/* Possui Website */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Possui Website?
                </label>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="has_website"
                      checked={filters.has_website === true}
                      onChange={() => handleInputChange("has_website", true)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">Sim</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="has_website"
                      checked={filters.has_website === false}
                      onChange={() => handleInputChange("has_website", false)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">Não</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="has_website"
                      checked={filters.has_website === null}
                      onChange={() => handleInputChange("has_website", null)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">Todos</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
