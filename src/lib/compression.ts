import { CompressionOptions } from "./types";
import JSZip from "jszip";
import { saveAs } from "file-saver";

export async function compressData(
  data: any[],
  filename: string,
  options: CompressionOptions = { enabled: true, level: 6, format: 'zip' }
): Promise<void> {
  if (!options.enabled) return;

  const zip = new JSZip();

  // Converter dados para string
  const dataString = JSON.stringify(data, null, 2);
  
  // Adicionar ao ZIP
  zip.file(`${filename}.json`, dataString, {
    compression: "DEFLATE",
    compressionOptions: {
      level: options.level || 6
    }
  });

  // Gerar arquivo ZIP
  const content = await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: {
      level: options.level || 6
    }
  });

  // Salvar arquivo
  saveAs(content, `${filename}.zip`);
}

export async function compressAndExport(
  data: any[],
  filename: string,
  format: 'csv' | 'excel' | 'pdf',
  options: CompressionOptions = { enabled: true, level: 6, format: 'zip' }
): Promise<void> {
  if (!options.enabled) return;

  const zip = new JSZip();

  // Adicionar arquivo no formato especificado
  {
    switch (format) {
      case 'csv': {
        const csvContent = convertToCsv(data);
        zip.file(`${filename}.csv`, csvContent);
        break;
      }
      case 'excel': {
        const excelContent = await convertToExcel(data);
        zip.file(`${filename}.xlsx`, excelContent);
        break;
      }
      case 'pdf': {
        const pdfContent = await convertToPdf(data);
        zip.file(`${filename}.pdf`, pdfContent);
        break;
      }
    }
  }

  // Gerar arquivo ZIP
  const content = await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: {
      level: options.level || 6
    }
  });

  // Salvar arquivo
  saveAs(content, `${filename}.zip`);
}

// Funções auxiliares de conversão
function convertToCsv(data: any[]): string {
  if (data.length === 0) return "";
  
  const headers = Object.keys(data[0]);
  const rows = data.map(row => 
    headers.map(header => {
      const value = row[header];
      return typeof value === "string" ? `"${value}"` : value;
    }).join(",")
  );
  
  return [headers.join(","), ...rows].join("\n");
}

async function convertToExcel(data: any[]): Promise<Blob> {
  // TODO: Implementar conversão para Excel
  throw new Error("Conversão para Excel ainda não implementada");
}

async function convertToPdf(data: any[]): Promise<Blob> {
  // TODO: Implementar conversão para PDF
  throw new Error("Conversão para PDF ainda não implementada");
} 