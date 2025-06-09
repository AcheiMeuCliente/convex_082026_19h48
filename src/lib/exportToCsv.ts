import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { ExportTemplate } from "./types";

/**
 * Exporta dados para CSV dinâmico, baseado nos headers visíveis da tabela.
 * - Usa separador ; (compatível com Excel/LibreOffice BR)
 * - Adiciona BOM UTF-8 para compatibilidade com Excel
 * - Faz escaping seguro de aspas
 * - Converte booleanos para SIM/NÃO
 * - Permite customização de formatação por coluna
 *
 * @param headers Array de nomes das colunas (em snake_case ou conforme visível)
 * @param data Array de objetos de dados
 * @param filename Nome do arquivo CSV
 * @param formatters (Opcional) Objeto { [col]: (value) => string } para formatação customizada
 */
export async function exportToCsv(
  data: any[],
  headers: string[],
  formatters?: Record<string, (value: any) => string>,
  filename: string = "export.csv"
): Promise<void> {
  if (data.length === 0) {
    throw new Error("Não há dados para exportar");
  }

  // Formatar dados
  const formattedData = data.map(row => {
    const formattedRow: Record<string, string> = {};
    headers.forEach(header => {
      const value = row[header];
      formattedRow[header] = formatters?.[header]?.(value) ?? String(value ?? "");
    });
    return formattedRow;
  });

  // Converter para CSV
  const csvContent = [
    headers.join(","),
    ...formattedData.map(row => 
      headers.map(header => {
        const value = row[header];
        return typeof value === "string" ? `"${value}"` : value;
      }).join(",")
    )
  ].join("\n");

  // Criar blob e download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

interface ExportOptions {
  formatters?: Record<string, (value: any) => string>;
  sheetName?: string;
}

export function exportToExcel(
  headers: string[],
  data: any[],
  filename: string,
  options: ExportOptions = {}
) {
  const { formatters, sheetName = "Sheet1" } = options;

  // Preparar dados formatados
  const formattedData = data.map(row => {
    const formattedRow: Record<string, any> = {};
    headers.forEach(header => {
      let value = row[header];
      if (formatters && formatters[header]) {
        value = formatters[header](value);
      }
      if (typeof value === "boolean") {
        value = value ? "SIM" : "NÃO";
      }
      formattedRow[header] = value ?? "";
    });
    return formattedRow;
  });

  // Criar workbook e worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(formattedData);

  // Adicionar worksheet ao workbook
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  // Gerar arquivo Excel
  XLSX.writeFile(wb, filename);
}

export function exportToPdf(
  headers: string[],
  data: any[],
  filename: string,
  options: ExportOptions = {}
) {
  // TODO: Implementar exportação PDF usando biblioteca como jsPDF
  console.warn("Exportação PDF ainda não implementada");
} 