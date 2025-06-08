interface StatsCardsProps {
  stats: {
    total: number;
    mei: number;
    simples: number;
    com_email: number;
    com_telefone: number;
    com_whatsapp: number;
    com_site: number;
    por_porte: Record<string, number>;
    por_estado: Record<string, number>;
    por_municipio: Record<string, number>;
    top_cnaes: Record<string, number>;
  };
}

export function StatsCards({ stats }: StatsCardsProps) {
  const topEstados = Object.entries(stats.por_estado)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const topMunicipios = Object.entries(stats.por_municipio)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const topCnaes = Object.entries(stats.top_cnaes)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const formatPercentage = (value: number, total: number) => {
    return total > 0 ? ((value / total) * 100).toFixed(1) : "0.0";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total de Empresas */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total de Empresas</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.total.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* MEI */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">MEI</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.mei.toLocaleString()}</p>
            <p className="text-xs text-gray-500">
              {formatPercentage(stats.mei, stats.total)}% do total
            </p>
          </div>
        </div>
      </div>

      {/* Simples Nacional */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Simples Nacional</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.simples.toLocaleString()}</p>
            <p className="text-xs text-gray-500">
              {formatPercentage(stats.simples, stats.total)}% do total
            </p>
          </div>
        </div>
      </div>

      {/* Com Email */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Com Email</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.com_email.toLocaleString()}</p>
            <p className="text-xs text-gray-500">
              {formatPercentage(stats.com_email, stats.total)}% do total
            </p>
          </div>
        </div>
      </div>

      {/* Contatos Digitais */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:col-span-2">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Presença Digital</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-semibold text-blue-600">{stats.com_telefone.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Com Telefone</p>
            <p className="text-xs text-gray-500">{formatPercentage(stats.com_telefone, stats.total)}%</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-semibold text-green-600">{stats.com_whatsapp.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Com WhatsApp</p>
            <p className="text-xs text-gray-500">{formatPercentage(stats.com_whatsapp, stats.total)}%</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-semibold text-purple-600">{stats.com_site.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Com Site</p>
            <p className="text-xs text-gray-500">{formatPercentage(stats.com_site, stats.total)}%</p>
          </div>
        </div>
      </div>

      {/* Distribuição por Porte */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:col-span-2">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Distribuição por Porte</h3>
        <div className="space-y-3">
          {Object.entries(stats.por_porte)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([porte, count]) => (
            <div key={porte} className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">{porte}</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${(count / stats.total) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-900 w-12 text-right">{count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Estados */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 lg:col-span-2">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Estados com Mais Empresas</h3>
        <div className="space-y-3">
          {topEstados.map(([estado, count]) => (
            <div key={estado} className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">{estado}</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${(count / stats.total) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-900 w-12 text-right">{count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Municípios */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 lg:col-span-2">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Municípios com Mais Empresas</h3>
        <div className="space-y-3">
          {topMunicipios.map(([municipio, count]) => (
            <div key={municipio} className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">{municipio}</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full"
                    style={{ width: `${(count / stats.total) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-900 w-12 text-right">{count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
