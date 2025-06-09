export type ExportFormat = 'csv' | 'excel' | 'pdf';

export interface ExportTemplate {
  name: string;
  headers: string[];
  formatters: Record<string, (value: any) => string>;
  defaultFormat: ExportFormat;
  compression: boolean;
}

export interface ExportCache {
  data: any[];
  timestamp: number;
  hash: string;
}

export interface CompressionOptions {
  enabled: boolean;
  level?: number; // 1-9, onde 9 é a compressão máxima
  format?: 'zip' | 'gzip';
} 