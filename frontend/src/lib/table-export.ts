export type ExportColumn<T> = {
  header: string;
  value: (row: T) => string | number | null | undefined;
};

function escapeCsvCell(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function exportRowsToCsv<T>(filename: string, columns: ExportColumn<T>[], rows: T[]): void {
  if (rows.length === 0) return;

  const headerLine = columns.map((col) => escapeCsvCell(col.header)).join(",");
  const bodyLines = rows.map((row) =>
    columns.map((col) => escapeCsvCell(String(col.value(row) ?? ""))).join(","),
  );
  const content = [headerLine, ...bodyLines].join("\n");
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportRowsToPdf<T>(title: string, columns: ExportColumn<T>[], rows: T[]): void {
  if (rows.length === 0) return;

  const tableHead = columns.map((col) => `<th>${escapeHtml(col.header)}</th>`).join("");
  const tableBody = rows
    .map((row) => {
      const cells = columns.map((col) => `<td>${escapeHtml(String(col.value(row) ?? ""))}</td>`).join("");
      return `<tr>${cells}</tr>`;
    })
    .join("");

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)}</title>
  <style>
    body { font-family: system-ui, sans-serif; padding: 24px; color: #111; }
    h1 { font-size: 18px; margin: 0 0 16px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th, td { border: 1px solid #ccc; padding: 6px 8px; text-align: left; }
    th { background: #f3f4f6; }
  </style>
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  <table>
    <thead><tr>${tableHead}</tr></thead>
    <tbody>${tableBody}</tbody>
  </table>
</body>
</html>`;

  const printWindow = window.open("", "_blank", "noopener,noreferrer");
  if (!printWindow) return;
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
