import React from "react";
import { withTableExport } from "../lib/withTableExport";

interface RegionTableProps {
  headers: string[];
  data: { [key: string]: any }[];
  filename: string;
  formatters?: Record<string, (value: any) => string>;
  onExportAll?: () => Promise<any[]>;
}

function RegionTable({ headers, data, formatters }: RegionTableProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Empresas por Região
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Distribuição geográfica das empresas filtradas
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-800">
            <tr>
              {headers.map((header) => (
                <th key={header} className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  {header.replace(/_/g, ' ')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, rowIdx) => (
              <tr key={rowIdx}>
                {headers.map((col) => (
                  <td key={col} className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900${col === 'empresas' ? ' text-right' : ''}`}>
                    {formatters && formatters[col]
                      ? formatters[col](row[col])
                      : typeof row[col] === "boolean"
                        ? row[col] ? "SIM" : "NÃO"
                        : row[col] ?? ""}
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

export default withTableExport(RegionTable);
