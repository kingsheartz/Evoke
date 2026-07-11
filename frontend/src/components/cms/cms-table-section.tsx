import type { TableContent } from "@/lib/cms-sections";
import { FormattedBody, FormattedHeading } from "@/components/ui/formatted-text";
import { cn } from "@/lib/utils";

export function CmsTableSection({ content }: { content: TableContent }) {
  const heading = content.heading?.trim();
  const body = content.body?.trim();
  const columns = (content.columns ?? []).map((col) => col.trim()).filter(Boolean);
  const rows = (content.rows ?? []).filter((row) => row.some((cell) => cell.trim()));
  const striped = content.striped !== false;
  const highlightHeader = content.highlight_header !== false;

  if (columns.length === 0 && rows.length === 0 && !heading && !body) return null;

  const colCount = Math.max(columns.length, ...rows.map((row) => row.length), 1);

  return (
    <section className="rounded-2xl border border-app-border bg-app-surface/80 p-6 ring-1 ring-app-border md:p-8">
      <FormattedHeading
        text={heading}
        format={content.heading_format}
        className="font-display text-2xl font-semibold tracking-tight text-app-text md:text-3xl"
      />
      <FormattedBody text={body} format={content.body_format} className="text-app-muted" />
      <div className={cn("table-wrap", (heading || body) && "mt-6")}>
        <table className="w-full min-w-[480px] border-collapse text-left text-sm">
          {columns.length > 0 ? (
            <thead>
              <tr
                className={cn(
                  highlightHeader && "border-b border-app-border bg-app-surface-muted/60 text-app-text",
                )}
              >
                {Array.from({ length: colCount }).map((_, index) => (
                  <th key={index} className="px-4 py-3 font-semibold">
                    {columns[index] ?? ""}
                  </th>
                ))}
              </tr>
            </thead>
          ) : null}
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={cn(
                  "border-b border-app-border/70 text-app-muted last:border-b-0",
                  striped && rowIndex % 2 === 1 && "bg-app-surface-muted/30",
                )}
              >
                {Array.from({ length: colCount }).map((_, colIndex) => (
                  <td key={colIndex} className="px-4 py-3 align-top text-app-text">
                    {row[colIndex] ?? ""}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
