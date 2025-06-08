import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface CompanyModalProps {
  companyId: Id<"companies">;
  onClose: () => void;
}

export function CompanyModal({ companyId, onClose }: CompanyModalProps) {
  const company = useQuery(api.companies.getCompany, { id: companyId });

  if (company === undefined) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (company === null) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
          <p className="text-center text-gray-500">Empresa não encontrada</p>
          <button
            onClick={onClose}
            className="mt-4 w-full px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Fechar
          </button>
        </div>
      </div>
    );
  }

  const formatCNPJ = (cnpj: string) => {
    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
  };

  const formatCurrency = (value: number | undefined) => {
    if (!value) return "Não informado";
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "Não informado";
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Detalhes da Empresa
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Informações Básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Informações Básicas</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Razão Social</label>
                  <p className="text-sm text-gray-900">{company.razao_social}</p>
                </div>
                {company.nome_fantasia && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nome Fantasia</label>
                    <p className="text-sm text-gray-900">{company.nome_fantasia}</p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700">CNPJ</label>
                  <p className="text-sm text-gray-900">{formatCNPJ(company.cnpj)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tipo</label>
                  <p className="text-sm text-gray-900">{company.matriz_filial || "Não informado"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Porte</label>
                  <p className="text-sm text-gray-900">{company.porte || "Não informado"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Capital Social</label>
                  <p className="text-sm text-gray-900">{formatCurrency(company.capital_social)}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Classificação</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">CNAE Principal</label>
                  <p className="text-sm text-gray-900">{company.cnae_principal_codigo} - {company.cnae_principal_nome}</p>
                </div>
                {company.cnae_secundario_codigo && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">CNAE Secundário</label>
                    <p className="text-sm text-gray-900">{company.cnae_secundario_codigo}</p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Natureza Jurídica</label>
                  <p className="text-sm text-gray-900">{company.natureza_juridica || "Não informado"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Início de Atividade</label>
                  <p className="text-sm text-gray-900">{formatDate(company.inicio_atividade)}</p>
                </div>
                <div className="flex space-x-4">
                  <div className="flex items-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      company.mei ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {company.mei ? 'MEI' : 'Não MEI'}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      company.simples ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {company.simples ? 'Simples Nacional' : 'Não Simples'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Endereço */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Endereço</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">CEP</label>
                <p className="text-sm text-gray-900">{company.cep || "Não informado"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Município</label>
                <p className="text-sm text-gray-900">{company.municipio}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Estado</label>
                <p className="text-sm text-gray-900">{company.estado}</p>
              </div>
              {company.bairro && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Bairro</label>
                  <p className="text-sm text-gray-900">{company.bairro}</p>
                </div>
              )}
              {company.endereco_mapa && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Endereço Completo</label>
                  <p className="text-sm text-gray-900">{company.endereco_mapa}</p>
                </div>
              )}
            </div>
          </div>

          {/* Contatos */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Contatos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-md font-medium text-gray-800 mb-3">Telefones</h4>
                <div className="space-y-2">
                  {company.telefone_1 && (
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className="text-sm text-gray-900">{company.telefone_1}</span>
                      {company.whatsapp_1 && (
                        <a
                          href={company.whatsapp_1}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-800"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                          </svg>
                        </a>
                      )}
                    </div>
                  )}
                  {company.telefone_2 && (
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className="text-sm text-gray-900">{company.telefone_2}</span>
                    </div>
                  )}
                  {company.telefone_3 && (
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className="text-sm text-gray-900">{company.telefone_3}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-md font-medium text-gray-800 mb-3">Email e Web</h4>
                <div className="space-y-2">
                  {company.email && (
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <a href={`mailto:${company.email}`} className="text-sm text-blue-600 hover:text-blue-800">
                        {company.email}
                      </a>
                    </div>
                  )}
                  {company.email_contabilidade && (
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <a href={`mailto:${company.email_contabilidade}`} className="text-sm text-blue-600 hover:text-blue-800">
                        {company.email_contabilidade} (Contabilidade)
                      </a>
                    </div>
                  )}
                  {company.site && (
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0 9c-5 0-9-4-9-9s4-9 9-9" />
                      </svg>
                      <a href={company.site} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-800">
                        Site
                      </a>
                    </div>
                  )}
                  {company.dominio_corporativo && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Domínio</label>
                      <p className="text-sm text-gray-900">{company.dominio_corporativo}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Links Externos */}
          {(company.receita_federal || company.maps) && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Links Externos</h3>
              <div className="flex space-x-4">
                {company.receita_federal && (
                  <a
                    href={company.receita_federal}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Ver na Receita Federal
                  </a>
                )}
                {company.maps && (
                  <a
                    href={company.maps}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Ver no Maps
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
