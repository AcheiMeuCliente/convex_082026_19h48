import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

interface CSVImportProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (count: number) => void;
}

export function CSVImport({ isOpen, onClose, onSuccess }: CSVImportProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<string[][]>([]);

  const importCompanies = useMutation(api.companies.importCompaniesFromCSV);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError("");
      
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

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  };

  const handleImport = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError("");

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        throw new Error("CSV file must have at least a header and one data row");
      }

      const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().replace(/[^a-z0-9_]/g, '_'));
      const companies = [];

      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        if (values.length < headers.length) continue;

        const company: any = {};
        
        headers.forEach((header, index) => {
          const value = values[index]?.replace(/^"|"$/g, '').trim();
          
          switch (header) {
            case 'cnpj':
              company.cnpj = value.replace(/\D/g, '');
              break;
            case 'razao_social':
            case 'razão_social':
              company.razao_social = value;
              break;
            case 'nome_fantasia':
              company.nome_fantasia = value || undefined;
              break;
            case 'cnae_principal_codigo':
            case 'cnae_codigo':
              company.cnae_principal_codigo = value;
              break;
            case 'cnae_principal_nome':
            case 'cnae_nome':
              company.cnae_principal_nome = value;
              break;
            case 'municipio':
            case 'cidade':
              company.municipio = value;
              break;
            case 'estado':
            case 'uf':
              company.estado = value.toUpperCase();
              break;
            case 'telefone_1':
            case 'telefone':
              company.telefone_1 = value || undefined;
              break;
            case 'email':
              company.email = value || undefined;
              break;
            case 'porte':
              company.porte = value || undefined;
              break;
            case 'capital_social':
              company.capital_social = value ? parseFloat(value.replace(/[^\d.,]/g, '').replace(',', '.')) : undefined;
              break;
            case 'mei':
              company.mei = value.toLowerCase() === 'true' || value.toLowerCase() === 'sim' || value === '1';
              break;
            case 'simples':
            case 'simples_nacional':
              company.simples = value.toLowerCase() === 'true' || value.toLowerCase() === 'sim' || value === '1';
              break;
            case 'cep':
              company.cep = value || undefined;
              break;
            case 'bairro':
              company.bairro = value || undefined;
              break;
            case 'endereco_mapa':
            case 'endereco':
              company.endereco_mapa = value || undefined;
              break;
            case 'site':
            case 'website':
              company.site = value || undefined;
              break;
            case 'matriz_filial':
              company.matriz_filial = value || undefined;
              break;
            case 'natureza_juridica':
              company.natureza_juridica = value || undefined;
              break;
            case 'inicio_atividade':
              company.inicio_atividade = value || undefined;
              break;
          }
        });

        // Required fields validation
        if (company.cnpj && company.razao_social && company.municipio && company.estado && 
            company.cnae_principal_codigo && company.cnae_principal_nome) {
          
          // Set derived fields
          company.tem_email = !!company.email;
          company.tem_telefone = !!company.telefone_1;
          
          // Generate WhatsApp links if phone exists
          if (company.telefone_1) {
            const cleanPhone = company.telefone_1.replace(/\D/g, '');
            company.whatsapp_1 = `https://api.whatsapp.com/send/?phone=55${cleanPhone}`;
          }

          companies.push(company);
        }
      }

      if (companies.length === 0) {
        throw new Error("No valid companies found in CSV. Please check the format and required fields.");
      }

      const result = await importCompanies({ companies });
      onSuccess(result.imported);
      onClose();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error importing CSV");
    } finally {
      setIsProcessing(false);
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
                  Import Companies from CSV
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
            <div className="p-6 space-y-6">
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

              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h3 className="text-sm font-medium text-blue-800 mb-2">CSV Format Requirements</h3>
                <div className="text-sm text-blue-700">
                  <p className="mb-2">Your CSV file should include the following columns (case-insensitive):</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li><strong>Required:</strong> cnpj, razao_social, municipio, estado, cnae_principal_codigo, cnae_principal_nome</li>
                    <li><strong>Optional:</strong> nome_fantasia, telefone_1, email, porte, capital_social, mei, simples, cep, bairro, site</li>
                  </ul>
                  <p className="mt-2">Boolean fields (mei, simples) should use: true/false, sim/não, or 1/0</p>
                </div>
              </div>

              {/* File Upload */}
              <div>
                <label htmlFor="csv-file" className="block text-sm font-medium text-gray-700 mb-2">
                  Select CSV File
                </label>
                <input
                  type="file"
                  id="csv-file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              {/* Preview */}
              {preview.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Preview (first 5 rows)</h3>
                  <div className="overflow-x-auto border border-gray-200 rounded-md">
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

              {/* Footer */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImport}
                  disabled={!file || isProcessing}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? "Importing..." : "Import CSV"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
