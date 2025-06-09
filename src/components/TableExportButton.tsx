import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { exportToCsv } from "@/lib/exportToCsv";
import { ExportTemplate } from "@/lib/types";

// Padrão sugerido para props de componentes de tabela:
// interface TableComponentProps {
//   headers: string[];
//   data: { [key: string]: any }[];
//   filename: string;
//   formatters?: Record<string, (value: any) => string>;
//   onExportAll?: () => Promise<any[]>;
// }
// Isso garante integração plug-and-play com TableExportButton e exportação universal.

export interface TableExportButtonProps {
  data: any[];
  headers: string[];
  formatters?: Record<string, (value: any) => string>;
  onExportAll?: () => Promise<any[]>;
  template?: ExportTemplate;
}

/**
 * Botão reutilizável para exportação CSV dinâmica de qualquer tabela.
 *
 * @param headers Array de nomes das colunas visíveis
 * @param data Array de objetos de dados (linhas)
 * @param formatters (opcional) Objeto { [col]: (value) => string } para formatação customizada
 * @param onExportAll (opcional) Função que retorna todos os dados para exportação total
 * @param template (opcional) Template para exportação
 *
 * @example
 * <TableExportButton
 *   headers={["estado", "municipio", "empresas"]}
 *   data={data}
 *   formatters={{ empresas: v => v.toLocaleString("pt-BR") }}
 *   onExportAll={async () => await fetchAllData()}
 *   template={template}
 * />
 */
export function TableExportButton({
  data,
  headers,
  formatters,
  onExportAll,
  template
}: TableExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingAll, setIsExportingAll] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await exportToCsv(data, headers, formatters, template?.name || "export");
      toast.success("Exportação concluída com sucesso!");
    } catch (error) {
      console.error("Erro ao exportar:", error);
      toast.error("Erro ao exportar dados");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportAll = async () => {
    if (!onExportAll) return;

    try {
      setIsExportingAll(true);
      const allData = await onExportAll();
      await exportToCsv(allData, headers, formatters, template?.name || "export");
      toast.success("Exportação completa concluída com sucesso!");
    } catch (error) {
      console.error("Erro ao exportar todos:", error);
      toast.error("Erro ao exportar todos os dados");
    } finally {
      setIsExportingAll(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => { void handleExport(); }}
        disabled={isExporting || data.length === 0}
      >
        {isExporting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        <span className="ml-2">
          Exportar {data.length} {data.length === 1 ? "registro" : "registros"}
        </span>
      </Button>

      {onExportAll && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => { void handleExportAll(); }}
          disabled={isExportingAll}
        >
          {isExportingAll ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          <span className="ml-2">Exportar Todos</span>
        </Button>
      )}
    </div>
  );
} 