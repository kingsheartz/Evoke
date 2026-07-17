/** Page numbers with ellipsis gaps for catalog pagination UI. */
export function getVisiblePages(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 1) return [];
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  const pages = new Set<number>([1, total]);
  for (let page = current - 1; page <= current + 1; page += 1) {
    if (page >= 1 && page <= total) pages.add(page);
  }

  const sorted = [...pages].sort((a, b) => a - b);
  const result: (number | "ellipsis")[] = [];
  let previous = 0;

  for (const page of sorted) {
    if (previous && page - previous > 1) result.push("ellipsis");
    result.push(page);
    previous = page;
  }

  return result;
}

export function paginationRangeLabel(current: number, perPage: number, total: number): string {
  if (total === 0) return "No results";
  const start = (current - 1) * perPage + 1;
  const end = Math.min(current * perPage, total);
  return `Showing ${start.toLocaleString("en-IN")}–${end.toLocaleString("en-IN")} of ${total.toLocaleString("en-IN")}`;
}
