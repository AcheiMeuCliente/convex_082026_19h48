interface ContactData {
  comEmail: number;
  percentualEmail: number;
  comTelefone: number;
  percentualTelefone: number;
}

interface ContactCardsProps {
  data: ContactData;
}

export function ContactCards({ data }: ContactCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Com E-mail */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <div className="ml-4 flex-1">
            <div className="flex items-baseline">
              <p className="text-3xl font-bold text-gray-900">
                {data.comEmail.toLocaleString('pt-BR')}
              </p>
              <p className="ml-2 text-sm font-medium text-gray-600">
                ({data.percentualEmail}%)
              </p>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              contatos disponíveis
            </p>
          </div>
        </div>
        
        {/* Barra de progresso */}
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${data.percentualEmail}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Com Telefone */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
          </div>
          <div className="ml-4 flex-1">
            <div className="flex items-baseline">
              <p className="text-3xl font-bold text-gray-900">
                {data.comTelefone.toLocaleString('pt-BR')}
              </p>
              <p className="ml-2 text-sm font-medium text-gray-600">
                ({data.percentualTelefone}%)
              </p>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              números diretos
            </p>
          </div>
        </div>
        
        {/* Barra de progresso */}
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${data.percentualTelefone}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
