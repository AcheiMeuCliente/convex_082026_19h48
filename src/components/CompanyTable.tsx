import { Doc } from "../../convex/_generated/dataModel";

interface CompanyTableProps {
  companies: (Doc<"companies"> & { idade_empresa?: number | null })[];
  onCompanyClick: (company: Doc<"companies">) => void;
}

export function CompanyTable({ companies, onCompanyClick }: CompanyTableProps) {
  const formatCNPJ = (cnpj: string) => {
    if (cnpj.length === 14) {
      return `${cnpj.slice(0, 2)}.${cnpj.slice(2, 5)}.${cnpj.slice(5, 8)}/${cnpj.slice(8, 12)}-${cnpj.slice(12, 14)}`;
    }
    return cnpj;
  };

  const formatCurrency = (value: number | undefined) => {
    if (!value) return "N/A";
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR');
    } catch {
      return dateString;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Empresa
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                CNPJ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                CNAE
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Localização
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Porte
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Capital Social
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Idade
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contatos
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {companies.map((company) => (
              <tr
                key={company._id}
                onClick={() => onCompanyClick(company)}
                className="hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {company.razao_social}
                    </div>
                    {company.nome_fantasia && (
                      <div className="text-sm text-gray-500">
                        {company.nome_fantasia}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCNPJ(company.cnpj)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {company.cnae_principal_codigo}
                  </div>
                  <div className="text-sm text-gray-500 max-w-xs truncate">
                    {company.cnae_principal_nome}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {company.municipio}, {company.estado}
                  </div>
                  {company.bairro && (
                    <div className="text-sm text-gray-500">
                      {company.bairro}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {company.porte || company.porte_empresa || "N/A"}
                  </div>
                  {company.matriz_filial && (
                    <div className="text-sm text-gray-500">
                      {company.matriz_filial}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCurrency(company.capital_social)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {company.idade_empresa ? `${company.idade_empresa} anos` : "N/A"}
                  </div>
                  {company.data_inicio_atividade && (
                    <div className="text-sm text-gray-500">
                      Desde {formatDate(company.data_inicio_atividade)}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex space-x-2">
                    {company.tem_email && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Email
                      </span>
                    )}
                    {company.tem_telefone && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Tel
                      </span>
                    )}
                    {company.whatsapp_1 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        WhatsApp
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col space-y-1">
                    {company.mei && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        MEI
                      </span>
                    )}
                    {company.simples && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Simples
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
