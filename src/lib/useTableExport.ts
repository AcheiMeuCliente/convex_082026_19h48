import { useState } from "react";
import { exportToCsv } from "./exportToCsv";

interface UseTableExportProps {
  headers: string[];
  data: { [key: string]: any }[];
  filename: string;
  formatters?: Record<string, (value: any) => string>;
  onExportAll?: () => Promise<any[]>;
}

export function useTableExport({ headers, data, filename, formatters, onExportAll }: UseTableExportProps) {
  const [loading, setLoading] = useState(false);

  const handleExport = async (all: boolean) => {
    setLoading(true);
    try {
      if (all && onExportAll) {
        await onExportAll();
      }
      void exportToCsv(data, headers, formatters, filename);
    } catch (error) {
      console.error("Error exporting data:", error);
    } finally {
      setLoading(false);
    }
  };

  return {
    headers,
    data,
    filename,
    formatters,
    onExportAll,
    loading,
    handleExport,
  };
} 