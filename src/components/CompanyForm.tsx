import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

interface CompanyFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const PORTES = [
  "MEI",
  "MICRO EMPRESA", 
  "PEQUENA EMPRESA",
  "MÉDIA EMPRESA",
  "GRANDE EMPRESA"
];

const ESTADOS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", 
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", 
  "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];

export function CompanyForm({ isOpen, onClose, onSuccess }: CompanyFormProps) {
  const [formData, setFormData] = useState({
    cnpj: "",
    cnae_principal_codigo: "",
    cnae_principal_nome: "",
    razao_social: "",
    nome_fantasia: "",
    telefone_1: "",
    telefone_2: "",
    telefone_3: "",
    email: "",
    bairro: "",
    cep: "",
    municipio: "",
    estado: "",
    endereco_mapa: "",
    matriz_filial: "MATRIZ",
    porte: "",
    capital_social: "",
    mei: false,
    simples: false,
    inicio_atividade: "",
    natureza_juridica: "",
    email_contabilidade: "",
    whatsapp_1: "",
    whatsapp_2: "",
    whatsapp_3: "",
    site: "",
    cnae_secundario_codigo: "",
    cnae_secundario_nome: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const createCompany = useMutation(api.companyManagement.createCompany);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const formatCNPJ = (value: string) => {
    // Remove tudo que não é dígito
    const digits = value.replace(/\D/g, "");
    
    // Aplica a máscara XX.XXX.XXX/XXXX-XX
    if (digits.length <= 2) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
    if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
    if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12, 14)}`;
  };

  const handleCNPJChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCNPJ(e.target.value);
    setFormData(prev => ({ ...prev, cnpj: formatted }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      // Validações básicas
      if (!formData.cnpj || !formData.razao_social || !formData.municipio || !formData.estado) {
        throw new Error("Preencha todos os campos obrigatórios");
      }

      // Remove formatação do CNPJ
      const cnpjDigits = formData.cnpj.replace(/\D/g, "");
      if (cnpjDigits.length !== 14) {
        throw new Error("CNPJ deve ter 14 dígitos");
      }

      const companyData = {
        ...formData,
        cnpj: cnpjDigits,
        capital_social: formData.capital_social ? parseFloat(formData.capital_social) : undefined,
        whatsapp_1: formData.telefone_1 ? `https://api.whatsapp.com/send/?phone=55${formData.telefone_1.replace(/\D/g, "")}` : undefined,
        whatsapp_2: formData.telefone_2 ? `https://api.whatsapp.com/send/?phone=55${formData.telefone_2.replace(/\D/g, "")}` : undefined,
        whatsapp_3: formData.telefone_3 ? `https://api.whatsapp.com/send/?phone=55${formData.telefone_3.replace(/\D/g, "")}` : undefined,
        codigo_cnae_fiscal: formData.cnae_principal_codigo,
        uf: formData.estado,
      };

      await createCompany(companyData);
      onSuccess();
      onClose();
      
      // Reset form
      setFormData({
        cnpj: "",
        cnae_principal_codigo: "",
        cnae_principal_nome: "",
        razao_social: "",
        nome_fantasia: "",
        telefone_1: "",
        telefone_2: "",
        telefone_3: "",
        email: "",
        bairro: "",
        cep: "",
        municipio: "",
        estado: "",
        endereco_mapa: "",
        matriz_filial: "MATRIZ",
        porte: "",
        capital_social: "",
        mei: false,
        simples: false,
        inicio_atividade: "",
        natureza_juridica: "",
        email_contabilidade: "",
        whatsapp_1: "",
        whatsapp_2: "",
        whatsapp_3: "",
        site: "",
        cnae_secundario_codigo: "",
        cnae_secundario_nome: "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar empresa");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Adicionar Nova Empresa
                </h2>
                <button
                  onClick={() => { void onClose(); }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={e => { void handleSubmit(e); }} className="p-6 space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Informações Básicas */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Informações Básicas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="cnpj" className="block text-sm font-medium text-gray-700 mb-1">
                      CNPJ *
                    </label>
                    <input
                      type="text"
                      id="cnpj"
                      name="cnpj"
                      value={formData.cnpj}
                      onChange={handleCNPJChange}
                      placeholder="00.000.000/0000-00"
                      maxLength={18}
                      required
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="razao_social" className="block text-sm font-medium text-gray-700 mb-1">
                      Razão Social *
                    </label>
                    <input
                      type="text"
                      id="razao_social"
                      name="razao_social"
                      value={formData.razao_social}
                      onChange={handleInputChange}
                      required
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="nome_fantasia" className="block text-sm font-medium text-gray-700 mb-1">
                      Nome Fantasia
                    </label>
                    <input
                      type="text"
                      id="nome_fantasia"
                      name="nome_fantasia"
                      value={formData.nome_fantasia}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="porte" className="block text-sm font-medium text-gray-700 mb-1">
                      Porte
                    </label>
                    <select
                      id="porte"
                      name="porte"
                      value={formData.porte}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    >
                      <option value="">Selecione o porte</option>
                      {PORTES.map(porte => (
                        <option key={porte} value={porte}>{porte}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* CNAE */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Classificação</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="cnae_principal_codigo" className="block text-sm font-medium text-gray-700 mb-1">
                      Código CNAE Principal *
                    </label>
                    <input
                      type="text"
                      id="cnae_principal_codigo"
                      name="cnae_principal_codigo"
                      value={formData.cnae_principal_codigo}
                      onChange={handleInputChange}
                      required
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="cnae_principal_nome" className="block text-sm font-medium text-gray-700 mb-1">
                      Descrição CNAE Principal *
                    </label>
                    <input
                      type="text"
                      id="cnae_principal_nome"
                      name="cnae_principal_nome"
                      value={formData.cnae_principal_nome}
                      onChange={handleInputChange}
                      required
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="mei"
                      name="mei"
                      checked={formData.mei}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="mei" className="ml-2 block text-sm text-gray-900">
                      MEI (Microempreendedor Individual)
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="simples"
                      name="simples"
                      checked={formData.simples}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="simples" className="ml-2 block text-sm text-gray-900">
                      Simples Nacional
                    </label>
                  </div>
                </div>
              </div>

              {/* Localização */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Localização</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-1">
                      Estado *
                    </label>
                    <select
                      id="estado"
                      name="estado"
                      value={formData.estado}
                      onChange={handleInputChange}
                      required
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    >
                      <option value="">Selecione o estado</option>
                      {ESTADOS.map(estado => (
                        <option key={estado} value={estado}>{estado}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="municipio" className="block text-sm font-medium text-gray-700 mb-1">
                      Município *
                    </label>
                    <input
                      type="text"
                      id="municipio"
                      name="municipio"
                      value={formData.municipio}
                      onChange={handleInputChange}
                      required
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="cep" className="block text-sm font-medium text-gray-700 mb-1">
                      CEP
                    </label>
                    <input
                      type="text"
                      id="cep"
                      name="cep"
                      value={formData.cep}
                      onChange={handleInputChange}
                      placeholder="00000-000"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Contatos */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Contatos</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="telefone_1" className="block text-sm font-medium text-gray-700 mb-1">
                      Telefone Principal
                    </label>
                    <input
                      type="tel"
                      id="telefone_1"
                      name="telefone_1"
                      value={formData.telefone_1}
                      onChange={handleInputChange}
                      placeholder="(00) 00000-0000"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="site" className="block text-sm font-medium text-gray-700 mb-1">
                      Website
                    </label>
                    <input
                      type="url"
                      id="site"
                      name="site"
                      value={formData.site}
                      onChange={handleInputChange}
                      placeholder="https://www.exemplo.com"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="capital_social" className="block text-sm font-medium text-gray-700 mb-1">
                      Capital Social (R$)
                    </label>
                    <input
                      type="number"
                      id="capital_social"
                      name="capital_social"
                      value={formData.capital_social}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => { void onClose(); }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Salvando..." : "Salvar Empresa"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
