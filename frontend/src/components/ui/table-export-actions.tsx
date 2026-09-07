"use client";

import { FileDown, FileText } from "lucide-react";
import { ActionButton } from "@/components/ui/action-button";
import { exportRowsToCsv, exportRowsToPdf, type ExportColumn } from "@/lib/table-export";

export function TableExportActions<T>({
  filename,
  title,
  columns,
  rows,
  disabled,
}: {
  filename: string;
  title: string;
  columns: ExportColumn<T>[];
  rows: T[];
  disabled?: boolean;
}) {
  const empty = rows.length === 0;

  return (
    <div className="flex flex-wrap gap-2">
      <ActionButton
        variant="outline"
        size="sm"
        icon={FileDown}
        disabled={disabled || empty}
        onClick={() => exportRowsToCsv(filename, columns, rows)}
      >
        CSV
      </ActionButton>
      <ActionButton
        variant="outline"
        size="sm"
        icon={FileText}
        disabled={disabled || empty}
        onClick={() => exportRowsToPdf(title, columns, rows)}
      >
        PDF
      </ActionButton>
    </div>
  );
}
