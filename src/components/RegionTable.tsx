interface RegionData {
  estado: string;
  municipio: string;
  bairro: string;
  empresas: number;
}

interface RegionTableProps {
  data: RegionData[];
}

export function RegionTable({ data }: RegionTableProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          Empresas por Região
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Distribuição geográfica das empresas filtradas
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          {/* Table Header */}
          <thead className="bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Município
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Bairro
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">
                Empresas
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="bg-white divide-y divide-gray-200">
            {data.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  <div className="flex flex-col items-center">
                    <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <p className="text-lg font-medium text-gray-900 mb-1">
                      Nenhuma empresa encontrada
                    </p>
                    <p className="text-sm text-gray-500">
                      Ajuste os filtros para visualizar dados
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((region, index) => (
                <tr 
                  key={`${region.estado}-${region.municipio}-${region.bairro}`}
                  className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-xs font-medium text-blue-800">
                          {region.estado}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {region.estado}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {region.municipio}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {region.bairro}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end">
                      <span className="text-sm font-semibold text-gray-900 mr-2">
                        {region.empresas.toLocaleString('pt-BR')}
                      </span>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ 
                            width: `${Math.min((region.empresas / Math.max(...data.map(d => d.empresas))) * 100, 100)}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      {data.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              Total de {data.length} regiões encontradas
            </span>
            <span>
              {data.reduce((acc, region) => acc + region.empresas, 0).toLocaleString('pt-BR')} empresas no total
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
