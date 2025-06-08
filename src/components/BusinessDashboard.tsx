import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { StatsCards } from "./StatsCards";
import { CompanyTable } from "./CompanyTable";
import { CompanyMap } from "./CompanyMap";
import { CompanyModal } from "./CompanyModal";
import { FiltersSidebar } from "./FiltersSidebar";
import { CompanyForm } from "./CompanyForm";
import { CSVImport } from "./CSVImport";
import { toast } from "sonner";

export function BusinessDashboard() {
  const [filters, setFilters] = useState({
    search: "",
    cnae: "",
    estado: "",
    municipio: "",
    porte: "",
    mei: undefined as boolean | undefined,
    simples: undefined as boolean | undefined,
    tem_email: undefined as boolean | undefined,
    tem_telefone: undefined as boolean | undefined,
  });
  const [selectedCompanyId, setSelectedCompanyId] = useState<Id<"companies"> | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [showCSVImport, setShowCSVImport] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "map">("table");
  const pageSize = 50;

  const stats = useQuery(api.companies.getDashboardStats, {
    cnae: filters.cnae || undefined,
    estado: filters.estado || undefined,
  });
  
  const companiesResult = useQuery(api.companies.listCompanies, {
    paginationOpts: { numItems: pageSize, cursor: null },
    search: filters.search || undefined,
    cnae: filters.cnae || undefined,
    estado: filters.estado || undefined,
    municipio: filters.municipio || undefined,
    porte: filters.porte || undefined,
    mei: filters.mei,
    simples: filters.simples,
    tem_email: filters.tem_email,
    tem_telefone: filters.tem_telefone,
  });

  const cnaes = useQuery(api.companies.getUniqueCnaes);
  const estados = useQuery(api.companies.getUniqueEstados);
  const municipios = useQuery(api.companies.getMunicipiosByEstado, 
    filters.estado ? { estado: filters.estado } : "skip"
  );

  const seedData = useMutation(api.companies.seedExampleData);

  const handleSeedData = async () => {
    try {
      const result = await seedData({});
      toast.success(`${result.total} example companies created successfully!`);
    } catch (error) {
      toast.error("Error creating example data");
    }
  };

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setCurrentPage(0);
  };

  const handleExportData = () => {
    if (!companiesResult?.page) return;
    
    // Create CSV content
    const headers = [
      "Company Name",
      "Trade Name", 
      "Primary Activity",
      "Secondary Activity",
      "Capital",
      "Email",
      "City",
      "Neighborhood",
      "Address",
      "Tax ID",
      "Website",
      "Phone 1",
      "Phone 2", 
      "Phone 3",
      "WhatsApp 1",
      "WhatsApp 2",
      "WhatsApp 3",
      "State",
      "ZIP",
      "Size",
      "MEI",
      "Simples",
      "Federal Revenue"
    ];
    
    const csvContent = [
      headers.join(","),
      ...companiesResult.page.map(company => [
        `"${company.razao_social}"`,
        `"${company.nome_fantasia || ""}"`,
        `"${company.cnae_principal_nome}"`,
        `"${company.cnae_secundario_nome || ""}"`,
        company.capital_social || 0,
        `"${company.email || ""}"`,
        `"${company.municipio}"`,
        `"${company.bairro || ""}"`,
        `"${company.endereco_mapa || ""}"`,
        `"${company.cnpj}"`,
        `"${company.site || ""}"`,
        `"${company.telefone_1 || ""}"`,
        `"${company.telefone_2 || ""}"`,
        `"${company.telefone_3 || ""}"`,
        `"${company.whatsapp_1 || ""}"`,
        `"${company.whatsapp_2 || ""}"`,
        `"${company.whatsapp_3 || ""}"`,
        `"${company.estado}"`,
        `"${company.cep || ""}"`,
        `"${company.porte || ""}"`,
        company.mei,
        company.simples,
        `"${company.receita_federal || ""}"`
      ].join(","))
    ].join("\n");
    
    // Download CSV
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `companies_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Data exported successfully!");
  };

  if (stats === undefined || companiesResult === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const hasNoData = stats.total === 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Brazilian Business Dashboard
          </h1>
          <p className="mt-2 text-gray-600">
            Complete analysis of business data based on CNAEs and location
          </p>
        </div>
        
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          {!hasNoData && (
            <>
              {/* View Mode Toggle */}
              <div className="flex rounded-md shadow-sm">
                <button
                  onClick={() => setViewMode("table")}
                  className={`px-4 py-2 text-sm font-medium rounded-l-md border ${
                    viewMode === "table"
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <svg className="w-4 h-4 mr-2 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 6h18m-9 8h9" />
                  </svg>
                  Table
                </button>
                <button
                  onClick={() => setViewMode("map")}
                  className={`px-4 py-2 text-sm font-medium rounded-r-md border-t border-r border-b ${
                    viewMode === "map"
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <svg className="w-4 h-4 mr-2 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Map
                </button>
              </div>

              {/* Add Company Button */}
              <button
                onClick={() => setShowCompanyForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Company
              </button>

              {/* Import CSV Button */}
              <button
                onClick={() => setShowCSVImport(true)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
                Import CSV
              </button>

              {/* Filters Button */}
              <button
                onClick={() => setShowFilters(true)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                </svg>
                Filters
              </button>
            </>
          )}
          
          {hasNoData && (
            <button
              onClick={handleSeedData}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Load Example Data
            </button>
          )}
        </div>
      </div>

      {hasNoData ? (
        <div className="text-center py-12">
          <div className="mx-auto h-24 w-24 text-gray-400">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            No companies registered
          </h3>
          <p className="mt-2 text-gray-500">
            Start by loading some example data to explore the dashboard.
          </p>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <StatsCards stats={stats} />

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {viewMode === "table" ? (
                <CompanyTable
                  companies={companiesResult.page}
                  onCompanyClick={(company) => setSelectedCompanyId(company._id)}
                />
              ) : (
                <CompanyMap
                  companies={companiesResult.page}
                  selectedCompanyId={selectedCompanyId}
                  onCompanySelect={setSelectedCompanyId}
                />
              )}
            </div>

            <div className="lg:col-span-1">
              {viewMode === "map" ? (
                <CompanyTable
                  companies={companiesResult.page}
                  onCompanyClick={(company) => setSelectedCompanyId(company._id)}
                />
              ) : (
                <CompanyMap
                  companies={companiesResult.page}
                  selectedCompanyId={selectedCompanyId}
                  onCompanySelect={setSelectedCompanyId}
                />
              )}
            </div>
          </div>

          {/* Filters Sidebar */}
          <FiltersSidebar
            isOpen={showFilters}
            onClose={() => setShowFilters(false)}
            filters={filters}
            onFiltersChange={handleFilterChange}
            cnaes={cnaes || []}
            estados={estados || []}
            municipios={municipios || []}
          />

          {/* Company Modal */}
          {selectedCompanyId && (
            <CompanyModal
              companyId={selectedCompanyId}
              onClose={() => setSelectedCompanyId(null)}
            />
          )}

          {/* Company Form */}
          <CompanyForm
            isOpen={showCompanyForm}
            onClose={() => setShowCompanyForm(false)}
            onSuccess={() => {
              toast.success("Company created successfully!");
              // Refresh data by resetting filters
              setFilters(prev => ({ ...prev }));
            }}
          />

          {/* CSV Import */}
          <CSVImport
            isOpen={showCSVImport}
            onClose={() => setShowCSVImport(false)}
            onSuccess={(count) => {
              toast.success(`Successfully imported ${count} companies!`);
              // Refresh data by resetting filters
              setFilters(prev => ({ ...prev }));
            }}
          />
        </>
      )}
    </div>
  );
}
