interface PanoramaData {
  totalEmpresas: number;
  idadeMedia: number;
  mesAnoAtual: string;
}

interface PanoramaCardsProps {
  data: PanoramaData;
}

export function PanoramaCards({ data }: PanoramaCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Total de Empresas */}
      <div className="bg-white rounded-lg shadow-sm border-l-4 border-pink-500 p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
          <div className="ml-4 flex-1">
            <div className="flex items-baseline">
              <p className="text-3xl font-bold text-gray-900">
                {data.totalEmpresas.toLocaleString('pt-BR')}
              </p>
              <p className="ml-2 text-sm font-medium text-gray-600">empresas</p>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Ativas com atualização em {data.mesAnoAtual}
            </p>
          </div>
        </div>
      </div>

      {/* Idade Média */}
      <div className="bg-white rounded-lg shadow-sm border-l-4 border-orange-500 p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="ml-4 flex-1">
            <div className="flex items-baseline">
              <p className="text-3xl font-bold text-gray-900">
                {data.idadeMedia}
              </p>
              <p className="ml-2 text-sm font-medium text-gray-600">anos</p>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              anos de experiência no mercado
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
