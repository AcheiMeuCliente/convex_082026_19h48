import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { AnalyticsFilters } from "./AnalyticsFilters";
import { PanoramaCards } from "./PanoramaCards";
import { ContactCards } from "./ContactCards";
import { RegionTable } from "./RegionTable";

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

export function AnalyticsDashboard() {
  const [filters, setFilters] = useState<FilterState>({
    cnpj: "",
    razao_social: "",
    nome_fantasia: "",
    cep: "",
    logradouro: "",
    capital_social_min: "",
    capital_social_max: "",
    codigo_cnae_fiscal: "",
    natureza_juridica: "",
    porte_empresa: "",
    data_inicio_atividade_from: "",
    data_inicio_atividade_to: "",
    is_mei: null,
    opcao_pelo_simples: null,
    has_website: null,
  });

  // Preparar argumentos para a query
  const queryArgs = {
    cnpj: filters.cnpj || undefined,
    razao_social: filters.razao_social || undefined,
    nome_fantasia: filters.nome_fantasia || undefined,
    cep: filters.cep || undefined,
    logradouro: filters.logradouro || undefined,
    capital_social_min: filters.capital_social_min ? parseFloat(filters.capital_social_min) : undefined,
    capital_social_max: filters.capital_social_max ? parseFloat(filters.capital_social_max) : undefined,
    codigo_cnae_fiscal: filters.codigo_cnae_fiscal || undefined,
    natureza_juridica: filters.natureza_juridica || undefined,
    porte_empresa: filters.porte_empresa || undefined,
    data_inicio_atividade_from: filters.data_inicio_atividade_from || undefined,
    data_inicio_atividade_to: filters.data_inicio_atividade_to || undefined,
    is_mei: filters.is_mei ?? undefined,
    opcao_pelo_simples: filters.opcao_pelo_simples ?? undefined,
    has_website: filters.has_website ?? undefined,
  };

  const dashboardData = useQuery(api.analytics.getDashboardData, queryArgs);
  const filterOptions = useQuery(api.analytics.getFilterOptions);

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearAllFilters = () => {
    setFilters({
      cnpj: "",
      razao_social: "",
      nome_fantasia: "",
      cep: "",
      logradouro: "",
      capital_social_min: "",
      capital_social_max: "",
      codigo_cnae_fiscal: "",
      natureza_juridica: "",
      porte_empresa: "",
      data_inicio_atividade_from: "",
      data_inicio_atividade_to: "",
      is_mei: null,
      opcao_pelo_simples: null,
      has_website: null,
    });
  };

  if (dashboardData === undefined || filterOptions === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Dashboard de Análise Empresarial
              </h1>
              <p className="mt-2 text-gray-600">
                Análise interativa de dados empresariais com filtros avançados
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtros */}
        <div className="mb-8">
          <AnalyticsFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={clearAllFilters}
            filterOptions={filterOptions}
          />
        </div>

        {/* Cards de Panorama */}
        <div className="mb-8">
          <PanoramaCards data={dashboardData.panorama} />
        </div>

        {/* Cards de Contato */}
        <div className="mb-8">
          <ContactCards data={dashboardData.contatos} />
        </div>

        {/* Tabela de Empresas por Região */}
        <div className="mb-8">
          <RegionTable data={dashboardData.empresasPorRegiao} />
        </div>
      </div>
    </div>
  );
}
