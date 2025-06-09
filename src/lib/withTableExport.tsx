import { ComponentType } from "react";
import { TableExportButton } from "@/components/TableExportButton";
import { ExportTemplate, CompressionOptions } from "./types";
import { getCachedData, setCachedData } from "./exportCache";
import { compressAndExport } from "./compression";

export interface WithTableExportProps {
  data: any[];
  headers: string[];
  formatters?: Record<string, (value: any) => string>;
  onExportAll?: () => Promise<any[]>;
  template?: ExportTemplate;
  useCache?: boolean;
  compression?: CompressionOptions;
}

export function withTableExport<P extends WithTableExportProps>(
  WrappedComponent: ComponentType<P>
) {
  return function WithTableExportComponent(props: P) {
    const {
      data,
      headers,
      formatters,
      onExportAll,
      template,
      useCache = true,
      compression,
      ...rest
    } = props;

    const handleExport = async (exportAll: boolean) => {
      try {
        // Verificar cache se habilitado
        if (useCache) {
          const cachedData = getCachedData(template?.name || "default");
          if (cachedData) {
            if (compression?.enabled) {
              void compressAndExport(
                cachedData,
                template?.name || "export",
                template?.defaultFormat || "csv",
                compression
              );
            }
            return cachedData;
          }
        }

        // Buscar dados
        const exportData = exportAll && onExportAll
          ? await onExportAll()
          : data;

        // Salvar no cache se habilitado
        if (useCache) {
          setCachedData(template?.name || "default", exportData);
        }

        // Comprimir se habilitado
        if (compression?.enabled) {
          void compressAndExport(
            exportData,
            template?.name || "export",
            template?.defaultFormat || "csv",
            compression
          );
        }

        return exportData;
      } catch (error) {
        console.error("Erro ao exportar:", error);
        throw error;
      }
    };

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">
            {template?.name || "Dados"}
          </h2>
          <TableExportButton
            data={data}
            headers={headers}
            formatters={formatters}
            onExportAll={onExportAll}
            template={template}
          />
        </div>
        <WrappedComponent
          {...(rest as P)}
          data={data}
          headers={headers}
          formatters={formatters}
        />
      </div>
    );
  };
} 