import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import Papa from "papaparse";

interface CSVImportProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (count: number) => void;
}

interface ValidationError {
  line?: number;
  column?: string;
  message: string;
}

// Mapeamento de colunas do CSV oficial para snake_case
const csvToSnakeCaseMap: Record<string, string> = {
  "CNPJ": "cnpj",
  "CNAE_PRINCIPAL_CODIGO": "cnae_principal_codigo",
  "CNAE_PRINCIPAL_NOME": "cnae_principal_nome",
  "CNAE_SECUNDARIO_CODIGO": "cnae_secundario_codigo",
  "CNAE_SECUNDARIO_NOME": "cnae_secundario_nome",
  "RAZÃO SOCIAL": "razao_social",
  "NOME FANTASIA": "nome_fantasia",
  "TELEFONE_1": "telefone_1",
  "TELEFONE_2": "telefone_2",
  "TELEFONE_3": "telefone_3",
  "E-MAIL": "email",
  "BAIRRO": "bairro",
  "CEP": "cep",
  "MUNICIPIO": "municipio",
  "ESTADO": "estado",
  "ENDERECO MAPA": "endereco_mapa",
  "MAPS": "maps",
  "MATRIZ FILIAL": "matriz_filial",
  "PORTE": "porte",
  "CAPITAL SOCIAL": "capital_social",
  "MEI": "mei",
  "SIMPLES": "simples",
  "INICIO ATIVIDADE": "inicio_atividade",
  "RECEITA FEDERAL": "receita_federal",
  "NATUREZA_JURIDICA": "natureza_juridica",
  "EMAIL_CONTABILIDADE": "email_contabilidade",
  "TEM_EMAIL": "tem_email",
  "TEM_TELEFONE": "tem_telefone",
  "WHATSAPP_1": "whatsapp_1",
  "WHATSAPP_2": "whatsapp_2",
  "WHATSAPP_3": "whatsapp_3",
  "DOMINIO_CORPORATIVO": "dominio_corporativo",
  "SITE": "site"
};

export function CSVImport({ isOpen, onClose, onSuccess }: CSVImportProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [preview, setPreview] = useState<string[][]>([]);
  const [progress, setProgress] = useState(0);
  const [importedCount, setImportedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const importCompanies = useMutation(api.companies.importCompaniesFromCSV);

  const validateCNPJ = (cnpj: string): boolean => {
    const cleanCNPJ = cnpj.replace(/\D/g, '');
    return cleanCNPJ.length === 14;
  };

  const validateDate = (date: string): boolean => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(date)) return false;
    const d = new Date(date);
    return d instanceof Date && !isNaN(d.getTime());
  };

  const validateBoolean = (value: string): boolean => {
    const normalized = value.toLowerCase().trim();
    return ['true', 'false', 'sim', 'não', 'nao', '1', '0', 'yes', 'no'].includes(normalized);
  };

  const validateNumber = (value: string): boolean => {
    return !isNaN(Number(value));
  };

  const validateRow = (row: any, index: number): ValidationError[] => {
    const rowErrors: ValidationError[] = [];
    const lineNumber = index + 2; // +2 porque index começa em 0 e pulamos o header

    // Campos obrigatórios
    const requiredFields = {
      cnpj: "CNPJ",
      razao_social: "Razão Social",
      cnae_principal_codigo: "Código CNAE Principal",
      cnae_principal_nome: "Nome CNAE Principal",
      municipio: "Município",
      estado: "Estado",
      mei: "MEI",
      simples: "Simples"
    };

    // Verificar campos obrigatórios
    Object.entries(requiredFields).forEach(([field, label]) => {
      if (!row[field]) {
        rowErrors.push({
          line: lineNumber,
          column: label,
          message: `Campo obrigatório ausente: ${label}`
        });
      }
    });

    // Validações específicas
    if (row.cnpj && !validateCNPJ(row.cnpj)) {
      rowErrors.push({
        line: lineNumber,
        column: "CNPJ",
        message: "CNPJ inválido: deve conter 14 dígitos"
      });
    }

    if (row.data_inicio_atividade && !validateDate(row.data_inicio_atividade)) {
      rowErrors.push({
        line: lineNumber,
        column: "Data Início Atividade",
        message: "Data inválida: use o formato YYYY-MM-DD"
      });
    }

    if (row.mei && !validateBoolean(row.mei)) {
      rowErrors.push({
        line: lineNumber,
        column: "MEI",
        message: "Valor inválido: use true/false, sim/não ou 1/0"
      });
    }

    if (row.simples && !validateBoolean(row.simples)) {
      rowErrors.push({
        line: lineNumber,
        column: "Simples",
        message: "Valor inválido: use true/false, sim/não ou 1/0"
      });
    }

    if (row.capital_social && !validateNumber(row.capital_social)) {
      rowErrors.push({
        line: lineNumber,
        column: "Capital Social",
        message: "Valor inválido: deve ser um número"
      });
    }

    return rowErrors;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setErrors([]);
      
      // Read first few lines for preview
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const lines = text.split('\n').slice(0, 6); // Header + 5 rows
        const csvData = lines.map(line => line.split(','));
        setPreview(csvData);
      };
      reader.readAsText(selectedFile);
    }
  };

  const handleImport = async () => {
    if (!file) return;
    setIsProcessing(true);
    setErrors([]);
    setProgress(0);
    setImportedCount(0);
    setTotalCount(0);

    try {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          try {
            // Validar cabeçalho
            const required = ["cnpj", "razao_social", "estado", "municipio", "cnae_principal_codigo", "cnae_principal_nome", "mei", "simples"];
            const fields = results.meta?.fields || [];
            const missing = required.filter(col => !fields.includes(col));
            
            if (missing.length) {
              setErrors([{
                message: `Colunas obrigatórias ausentes: ${missing.join(", ")}`
              }]);
              setIsProcessing(false);
              return;
            }

            // Validar cada linha
            const allErrors: ValidationError[] = [];
            results.data.forEach((row: any, index: number) => {
              const rowErrors = validateRow(row, index);
              allErrors.push(...rowErrors);
            });

            if (allErrors.length > 0) {
              setErrors(allErrors);
              setIsProcessing(false);
              return;
            }

            const companies = results.data;
            setTotalCount(companies.length);
            const chunks = chunkArray(companies, 100);
            let totalImported = 0;

            for (let i = 0; i < chunks.length; i++) {
              try {
                const result = await importCompanies({ companies: chunks[i] });
                totalImported += result.imported;
                setImportedCount(totalImported);
                setProgress(Math.round(((i + 1) / chunks.length) * 100));
              } catch (e) {
                setErrors([{
                  message: `Erro ao importar chunk ${i + 1}: ${e instanceof Error ? e.message : String(e)}`
                }]);
                break;
              }
            }

            onSuccess(totalImported);
            onClose();
          } catch (err) {
            setErrors([{
              message: err instanceof Error ? err.message : "Erro ao processar CSV"
            }]);
            setIsProcessing(false);
          }
        },
        error: (err: any) => {
          setErrors([{
            message: `Erro ao ler o arquivo CSV: ${err.message}`
          }]);
          setIsProcessing(false);
        }
      });
    } catch (err) {
      setErrors([{
        message: err instanceof Error ? err.message : "Erro ao importar CSV"
      }]);
      setIsProcessing(false);
    }
  };

  function chunkArray(array: any[], size: number) {
    const result = [];
    for (let i = 0; i < array.length; i += size) {
      result.push(array.slice(i, i + size));
    }
    return result;
  }

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
                  Importar Empresas via CSV
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
            </div>

            {/* Content */}
            <div className="p-6">
              {errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Erros encontrados:</h3>
                      <div className="mt-2 text-sm text-red-700">
                        <ul className="list-disc pl-5 space-y-1">
                          {errors.map((error, index) => (
                            <li key={index}>
                              {error.line && error.column 
                                ? `Linha ${error.line}, Coluna "${error.column}": ${error.message}`
                                : error.message}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
                <h3 className="text-sm font-medium text-blue-800 mb-2">Requisitos do Arquivo CSV</h3>
                <div className="text-sm text-blue-700">
                  <p className="mb-2">Seu arquivo CSV deve incluir as seguintes colunas:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li><strong>Obrigatórias:</strong> cnpj, razao_social, municipio, estado, cnae_principal_codigo, cnae_principal_nome, mei, simples</li>
                    <li><strong>Opcionais:</strong> nome_fantasia, telefone_1, email, porte, capital_social, cep, bairro, site</li>
                  </ul>
                  <p className="mt-2">Formatos esperados:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>CNPJ: apenas números (14 dígitos)</li>
                    <li>Datas: YYYY-MM-DD</li>
                    <li>Booleanos (mei, simples): true/false, sim/não, ou 1/0</li>
                    <li>Capital social: número sem formatação</li>
                  </ul>
                </div>
              </div>

              {/* File Upload */}
              <div className="mb-4">
                <label htmlFor="csv-file" className="block text-sm font-medium text-gray-700 mb-2">
                  Selecione o Arquivo CSV
                </label>
                <input
                  type="file"
                  id="csv-file"
                  accept=".csv"
                  onChange={e => { void handleFileChange(e); }}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              {/* Preview */}
              {preview.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Prévia (primeiras 5 linhas)</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          {preview[0]?.map((header: string, index: number) => (
                            <th key={index} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {preview.slice(1).map((row, rowIndex) => (
                          <tr key={rowIndex}>
                            {row.map((cell: string, cellIndex: number) => (
                              <td key={cellIndex} className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                                {cell.length > 30 ? cell.substring(0, 30) + '...' : cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Progress Bar */}
              {isProcessing && (
                <div className="my-4">
                  <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                    <div className="bg-blue-600 h-4 rounded-full" style={{ width: `${progress}%` }}></div>
                  </div>
                  <div className="text-sm text-gray-700">{`Importados: ${importedCount} / ${totalCount}`}</div>
                </div>
              )}

              {/* Footer */}
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => { void handleImport(); }}
                  disabled={!file || isProcessing}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? "Importando..." : "Importar CSV"}
                </button>
              </div>

              {/* Download Template Button */}
              <button
                className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                onClick={() => {
                  const headers = [
                    "cnpj,razao_social,estado,municipio,cnae_principal_codigo,cnae_principal_nome,nome_fantasia,telefone_1,email,porte,capital_social,mei,simples,data_inicio_atividade"
                  ];
                  const blob = new Blob([headers.join("\n")], { type: "text/csv" });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement("a");
                  link.href = url;
                  link.download = "template_empresas.csv";
                  link.click();
                  URL.revokeObjectURL(url);
                }}
              >
                Baixar Template CSV
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
