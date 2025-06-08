import { Doc, Id } from "../../convex/_generated/dataModel";

interface CompanyListProps {
  companies: Doc<"companies">[];
  onCompanySelect: (id: Id<"companies">) => void;
  hasMore: boolean;
  onLoadMore: () => void;
}

export function CompanyList({ companies, onCompanySelect, hasMore, onLoadMore }: CompanyListProps) {
  if (companies.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <div className="mx-auto h-12 w-12 text-gray-400">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h3 className="mt-4 text-lg font-medium text-gray-900">
          Nenhuma empresa encontrada
        </h3>
        <p className="mt-2 text-gray-500">
          Tente ajustar os filtros para encontrar empresas.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          Empresas ({companies.length})
        </h3>
      </div>

      <div className="divide-y divide-gray-200">
        {companies.map((company) => (
          <CompanyCard
            key={company._id}
            company={company}
            onClick={() => onCompanySelect(company._id)}
          />
        ))}
      </div>

      {hasMore && (
        <div className="px-6 py-4 border-t border-gray-200">
          <button
            onClick={onLoadMore}
            className="w-full text-center py-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Carregar mais empresas
          </button>
        </div>
      )}
    </div>
  );
}

interface CompanyCardProps {
  company: Doc<"companies">;
  onClick: () => void;
}

function CompanyCard({ company, onClick }: CompanyCardProps) {
  const getPorteColor = (porte: string) => {
    switch (porte) {
      case "MEI": return "bg-purple-100 text-purple-800";
      case "MICRO EMPRESA": return "bg-blue-100 text-blue-800";
      case "PEQUENA EMPRESA": return "bg-indigo-100 text-indigo-800";
      case "MÉDIA EMPRESA": return "bg-orange-100 text-orange-800";
      case "GRANDE EMPRESA": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatCurrency = (value: number | undefined) => {
    if (!value) return "Não informado";
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatCNPJ = (cnpj: string) => {
    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
  };

  return (
    <div
      onClick={onClick}
      className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-3 mb-2">
            <h4 className="text-lg font-medium text-gray-900 truncate">
              {company.razao_social}
            </h4>
            {company.porte && (
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPorteColor(company.porte)}`}>
                {company.porte}
              </span>
            )}
          </div>

          {company.nome_fantasia && (
            <p className="text-sm text-gray-600 mb-1">
              Nome Fantasia: {company.nome_fantasia}
            </p>
          )}

          <p className="text-sm text-gray-600 mb-1">
            CNPJ: {formatCNPJ(company.cnpj)} • {company.matriz_filial || "Não informado"}
          </p>

          <p className="text-sm text-gray-600 mb-2">
            {company.municipio}/{company.estado} • {company.cnae_principal_nome}
          </p>

          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span>Capital: {formatCurrency(company.capital_social)}</span>
            {company.mei && (
              <span className="inline-flex items-center">
                <svg className="w-4 h-4 mr-1 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                MEI
              </span>
            )}
            {company.simples && (
              <span className="inline-flex items-center">
                <svg className="w-4 h-4 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Simples
              </span>
            )}
            {company.tem_email && (
              <span className="inline-flex items-center">
                <svg className="w-4 h-4 mr-1 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                Email
              </span>
            )}
            {company.tem_telefone && (
              <span className="inline-flex items-center">
                <svg className="w-4 h-4 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                Telefone
              </span>
            )}
          </div>
        </div>

        <div className="flex-shrink-0 ml-4">
          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  );
}
