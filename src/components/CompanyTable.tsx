import React from "react";
import { Doc } from "../../convex/_generated/dataModel";
import { withTableExport } from "../lib/withTableExport";

interface CompanyTableProps {
  headers: string[];
  data: ({ [key: string]: any } & Doc<"companies"> & { idade_empresa?: number | null })[];
  onCompanyClick: (company: Doc<"companies">) => void;
  filename: string;
  formatters?: Record<string, (value: any) => string>;
  onExportAll?: () => Promise<any[]>;
}

function CompanyTable({ headers, data, onCompanyClick, formatters }: CompanyTableProps) {
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
              {headers.map((header) => (
                <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {header.replace(/_/g, ' ')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((company) => (
              <tr
                key={company._id}
                onClick={() => onCompanyClick(company)}
                className="hover:bg-gray-50 cursor-pointer transition-colors"
              >
                {headers.map((col) => (
                  <td key={col} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatters && formatters[col]
                      ? formatters[col](company[col])
                      : typeof company[col] === "boolean"
                        ? company[col] ? "SIM" : "NÃO"
                        : company[col] ?? ""}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default withTableExport(CompanyTable);
