"use client";

import { ReactNode, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { Columns3 } from "lucide-react";
import { ColumnHeaderMenu, type SortDir } from "@/components/ui/column-header-menu";
import { ManageColumnsPanel } from "@/components/ui/manage-columns-panel";
import { TableSearch } from "@/components/ui/table-search";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  type ColumnPin,
  loadTableColumnPrefs,
  mergeStoredColumnWidths,
  saveTableColumnPrefs,
  type TableColumnPrefs,
} from "@/lib/table-column-prefs";

export type { SortDir };

export interface TableColumn<T> {
  key: string;
  header: string;
  headerRender?: () => ReactNode;
  render?: (row: T) => ReactNode;
  width?: number;
  minWidth?: number;
  sortable?: boolean;
  sortKey?: string;
  sortValue?: (row: T) => string | number | null | undefined;
  hideable?: boolean;
  pinnable?: boolean;
  defaultPin?: ColumnPin;
}

const DEFAULT_COL_WIDTH = 140;
const DEFAULT_MIN_WIDTH = 72;

function measureColumnWidths<T>(
  table: HTMLTableElement,
  columns: TableColumn<T>[],
  fallback: Record<string, number>,
): Record<string, number> {
  const headers = table.querySelectorAll("thead th");
  const widths: Record<string, number> = {};

  columns.forEach((col, index) => {
    const th = headers[index] as HTMLElement | undefined;
    widths[col.key] = Math.round(th?.getBoundingClientRect().width ?? fallback[col.key] ?? DEFAULT_COL_WIDTH);
  });

  return widths;
}

function compareValues(a: unknown, b: unknown): number {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: "base" });
}

function isColumnSortable<T>(col: TableColumn<T>): boolean {
  return col.sortable === true;
}

function isColumnHideable<T>(col: TableColumn<T>): boolean {
  if (col.hideable === false || col.key === "actions") return false;
  return true;
}

function isColumnPinnable<T>(col: TableColumn<T>): boolean {
  return col.pinnable !== false;
}

function resolvePin<T>(col: TableColumn<T>, pinned: Record<string, Exclude<ColumnPin, null>>): ColumnPin {
  return pinned[col.key] ?? col.defaultPin ?? null;
}

function orderColumns<T>(columns: TableColumn<T>[], pinned: Record<string, Exclude<ColumnPin, null>>) {
  const left: TableColumn<T>[] = [];
  const center: TableColumn<T>[] = [];
  const right: TableColumn<T>[] = [];

  for (const col of columns) {
    const pin = resolvePin(col, pinned);
    if (pin === "left") left.push(col);
    else if (pin === "right") right.push(col);
    else center.push(col);
  }

  return [...left, ...center, ...right];
}

function resolveColumnWidths<T>(
  columns: TableColumn<T>[],
  stored: Record<string, number>,
): Record<string, number> {
  const widths = { ...stored };
  for (const col of columns) {
    if (widths[col.key] == null) {
      widths[col.key] = col.width ?? DEFAULT_COL_WIDTH;
    }
  }
  return widths;
}

export function ConfigurableDataTable<T extends object>(props: {
  tableId: string;
  columns: TableColumn<T>[];
  data: T[];
  keyField: keyof T;
  emptyMessage?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  /** Custom text extractor for client-side search (nested fields). */
  searchText?: (row: T) => string;
  resizable?: boolean;
  columnManagement?: boolean;
  inset?: boolean;
  className?: string;
  rowClassName?: (row: T) => string | undefined;
}) {
  return <ConfigurableDataTableBody key={props.tableId} {...props} />;
}

function ConfigurableDataTableBody<T extends object>({
  tableId,
  columns,
  data,
  keyField,
  emptyMessage = "No matching records.",
  searchable = true,
  searchPlaceholder,
  searchText,
  resizable = true,
  columnManagement,
  inset,
  className,
  rowClassName,
}: {
  tableId: string;
  columns: TableColumn<T>[];
  data: T[];
  keyField: keyof T;
  emptyMessage?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  searchText?: (row: T) => string;
  resizable?: boolean;
  columnManagement?: boolean;
  inset?: boolean;
  className?: string;
  rowClassName?: (row: T) => string | undefined;
}) {
  const manageColumns = columnManagement ?? Boolean(tableId);
  const initialPrefs = loadTableColumnPrefs(tableId);

  const [search, setSearch] = useState("");
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() =>
    mergeStoredColumnWidths(columns, initialPrefs.widths, (col) => col.width ?? DEFAULT_COL_WIDTH),
  );
  const [layoutLocked, setLayoutLocked] = useState(
    () => Boolean(initialPrefs.widths && Object.keys(initialPrefs.widths).length > 0),
  );
  const [isResizing, setIsResizing] = useState(false);
  const [scrollableX, setScrollableX] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const [columnPrefs, setColumnPrefs] = useState<TableColumnPrefs>(() => initialPrefs);

  const tableRef = useRef<HTMLTableElement>(null);
  const tableWrapRef = useRef<HTMLDivElement>(null);
  const columnWidthsRef = useRef(columnWidths);
  const columnPrefsRef = useRef(columnPrefs);
  const layoutLockedRef = useRef(layoutLocked);
  const resizeRef = useRef<{
    key: string;
    partnerKey: string;
    startX: number;
    startWidth: number;
    startPartnerWidth: number;
    minWidth: number;
    minPartnerWidth: number;
  } | null>(null);

  const resolvedColumnWidths = useMemo(
    () => resolveColumnWidths(columns, columnWidths),
    [columns, columnWidths],
  );

  useEffect(() => {
    columnWidthsRef.current = columnWidths;
    columnPrefsRef.current = columnPrefs;
    layoutLockedRef.current = layoutLocked;
  }, [columnWidths, columnPrefs, layoutLocked]);

  useEffect(() => {
    if (!isResizing) return;

    const previousCursor = document.body.style.cursor;
    const previousUserSelect = document.body.style.userSelect;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    return () => {
      document.body.style.cursor = previousCursor;
      document.body.style.userSelect = previousUserSelect;
    };
  }, [isResizing]);

  const persistTableLayout = useCallback(
    (prefs: TableColumnPrefs, widths: Record<string, number>) => {
      saveTableColumnPrefs(tableId, { ...prefs, widths });
    },
    [tableId],
  );

  const persistPrefs = useCallback(
    (next: TableColumnPrefs) => {
      setColumnPrefs(next);
      persistTableLayout(next, columnWidthsRef.current);
    },
    [persistTableLayout],
  );

  const persistWidths = useCallback(
    (widths: Record<string, number>) => {
      columnWidthsRef.current = widths;
      persistTableLayout(columnPrefsRef.current, widths);
    },
    [persistTableLayout],
  );

  const hiddenSet = useMemo(() => new Set(columnPrefs.hidden), [columnPrefs.hidden]);

  const visibleColumns = useMemo(() => {
    const shown = columns.filter((col) => !hiddenSet.has(col.key));
    return orderColumns(shown, columnPrefs.pinned);
  }, [columns, hiddenSet, columnPrefs.pinned]);

  const filteredData = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!searchable || !q) return data;
    return data.filter((row) => {
      const haystack = searchText ? searchText(row) : JSON.stringify(row);
      return haystack.toLowerCase().includes(q);
    });
  }, [data, searchable, search, searchText]);

  const pageData = filteredData;

  const visibleColumnsRef = useRef(visibleColumns);

  useEffect(() => {
    visibleColumnsRef.current = visibleColumns;
  }, [visibleColumns]);

  const resizeListenersRef = useRef<{
    move: (event: MouseEvent) => void;
    end: () => void;
  } | null>(null);

  const onResizeMove = useCallback((event: MouseEvent) => {
    const state = resizeRef.current;
    if (!state) return;

    const delta = event.clientX - state.startX;
    let nextWidth = state.startWidth + delta;
    let partnerWidth = state.startPartnerWidth - delta;

    if (nextWidth < state.minWidth) {
      nextWidth = state.minWidth;
      partnerWidth = state.startWidth + state.startPartnerWidth - state.minWidth;
    }
    if (partnerWidth < state.minPartnerWidth) {
      partnerWidth = state.minPartnerWidth;
      nextWidth = state.startWidth + state.startPartnerWidth - state.minPartnerWidth;
    }

    setColumnWidths((prev) => {
      const next = {
        ...prev,
        [state.key]: Math.round(nextWidth),
        [state.partnerKey]: Math.round(partnerWidth),
      };
      columnWidthsRef.current = next;
      return next;
    });
  }, []);

  const endResize = useCallback(() => {
    const listeners = resizeListenersRef.current;
    if (listeners) {
      document.removeEventListener("mousemove", listeners.move);
      document.removeEventListener("mouseup", listeners.end);
      resizeListenersRef.current = null;
    }

    resizeRef.current = null;
    setIsResizing(false);

    const table = tableRef.current;
    const columnsForMeasure = visibleColumnsRef.current;

    if (layoutLockedRef.current && table) {
      const measured = measureColumnWidths(table, columnsForMeasure, columnWidthsRef.current);
      columnWidthsRef.current = measured;
      setColumnWidths(measured);
      persistWidths(measured);
      return;
    }

    persistWidths(columnWidthsRef.current);
  }, [persistWidths]);

  useEffect(() => {
    return () => {
      const listeners = resizeListenersRef.current;
      if (listeners) {
        document.removeEventListener("mousemove", listeners.move);
        document.removeEventListener("mouseup", listeners.end);
      }
    };
  }, []);

  const startResize = (key: string, index: number, event: React.MouseEvent<HTMLSpanElement>) => {
    if (!resizable) return;
    const partnerKey = visibleColumns[index + 1]?.key;
    if (!partnerKey) return;

    event.preventDefault();
    event.stopPropagation();

    const table = tableRef.current;
    if (!table) return;

    const measured = measureColumnWidths(table, visibleColumns, columnWidthsRef.current);

    if (!layoutLockedRef.current) {
      flushSync(() => {
        setColumnWidths(measured);
        setLayoutLocked(true);
      });
      layoutLockedRef.current = true;
      columnWidthsRef.current = measured;
    } else {
      setColumnWidths(measured);
      columnWidthsRef.current = measured;
    }

    const col = visibleColumns[index];
    const partnerCol = visibleColumns[index + 1];

    resizeRef.current = {
      key,
      partnerKey,
      startX: event.clientX,
      startWidth: measured[key],
      startPartnerWidth: measured[partnerKey],
      minWidth: col.minWidth ?? DEFAULT_MIN_WIDTH,
      minPartnerWidth: partnerCol?.minWidth ?? DEFAULT_MIN_WIDTH,
    };

    setIsResizing(true);
    const listeners = { move: onResizeMove, end: endResize };
    resizeListenersRef.current = listeners;
    document.addEventListener("mousemove", listeners.move);
    document.addEventListener("mouseup", listeners.end);
  };

  const handlePin = (col: TableColumn<T>, pin: ColumnPin) => {
    const nextPinned = { ...columnPrefs.pinned };
    if (pin) nextPinned[col.key] = pin;
    else delete nextPinned[col.key];
    persistPrefs({ ...columnPrefs, pinned: nextPinned });
  };

  const handleHide = (key: string) => {
    if (hiddenSet.has(key)) return;
    persistPrefs({ ...columnPrefs, hidden: [...columnPrefs.hidden, key] });
  };

  const handleToggleColumn = (key: string, visible: boolean) => {
    if (visible) {
      persistPrefs({ ...columnPrefs, hidden: columnPrefs.hidden.filter((k) => k !== key) });
    } else {
      handleHide(key);
    }
  };

  const tableStyle = layoutLocked ? { width: "100%", tableLayout: "fixed" as const } : undefined;

  const lockedColumnPercents = useMemo(() => {
    if (!layoutLocked) return null;
    const total = visibleColumns.reduce(
      (sum, col) => sum + (resolvedColumnWidths[col.key] ?? DEFAULT_COL_WIDTH),
      0,
    );
    if (total <= 0) return null;

    const percents: Record<string, string> = {};
    for (const col of visibleColumns) {
      const width = resolvedColumnWidths[col.key] ?? DEFAULT_COL_WIDTH;
      percents[col.key] = `${(width / total) * 100}%`;
    }
    return percents;
  }, [layoutLocked, visibleColumns, resolvedColumnWidths]);

  useLayoutEffect(() => {
    const wrap = tableWrapRef.current;
    const table = tableRef.current;
    if (!wrap || !table || pageData.length === 0) return;

    const observer = new ResizeObserver(() => {
      setScrollableX(table.scrollWidth > wrap.clientWidth + 1);
    });
    observer.observe(wrap);
    observer.observe(table);
    return () => observer.disconnect();
  }, [pageData.length, visibleColumns, resolvedColumnWidths, layoutLocked, lockedColumnPercents, isResizing]);

  const leftPinnedKeys = visibleColumns
    .filter((c) => resolvePin(c, columnPrefs.pinned) === "left")
    .map((c) => c.key);
  const rightPinnedKeys = visibleColumns
    .filter((c) => resolvePin(c, columnPrefs.pinned) === "right")
    .map((c) => c.key);

  const showToolbar = searchable || manageColumns;

  return (
    <div className={cn("configurable-data-table", className)}>
      {showToolbar && (
        <div className="data-table-toolbar">
          {searchable && (
            <TableSearch
              value={search}
              onChange={setSearch}
              placeholder={searchPlaceholder ?? "Search records…"}
            />
          )}
          {manageColumns && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="data-table-manage-cols shrink-0"
              onClick={() => setManageOpen(true)}
            >
              <Columns3 size={14} />
              Manage columns
            </Button>
          )}
        </div>
      )}

      {pageData.length === 0 ? (
        <p className="px-6 py-12 text-center text-sm text-app-muted">{emptyMessage}</p>
      ) : (
        <div
          ref={tableWrapRef}
          data-inset={inset ? "true" : undefined}
          className={cn(
            "table-wrap",
            inset
              ? "rounded-none border-0 border-t border-app-border bg-transparent"
              : "rounded-xl border border-app-border bg-app-surface/40",
            (scrollableX || isResizing) && "table-wrap--scrollable",
            isResizing && "table-wrap--resizing",
          )}
        >
          <table
            ref={tableRef}
            className={cn(
              "data-table w-full text-left text-sm",
              inset && "table-inset",
              layoutLocked && "data-table--locked",
              (leftPinnedKeys.length > 0 || rightPinnedKeys.length > 0) && "data-table--pinned",
            )}
            style={tableStyle}
          >
            <colgroup>
              {visibleColumns.map((col) => (
                <col
                  key={col.key}
                  style={
                    lockedColumnPercents
                      ? { width: lockedColumnPercents[col.key] }
                      : {
                          width: resolvedColumnWidths[col.key] ?? DEFAULT_COL_WIDTH,
                          minWidth: col.minWidth ?? DEFAULT_MIN_WIDTH,
                        }
                  }
                />
              ))}
            </colgroup>
            <thead>
              <tr>
                {visibleColumns.map((col, index) => {
                  const pin = resolvePin(col, columnPrefs.pinned);
                  const pinClass =
                    pin === "left" && col.key === leftPinnedKeys[leftPinnedKeys.length - 1]
                      ? "data-table-th--pin-left-edge"
                      : pin === "right" && col.key === rightPinnedKeys[0]
                        ? "data-table-th--pin-right-edge"
                        : pin === "left"
                          ? "data-table-th--pin-left"
                          : pin === "right"
                            ? "data-table-th--pin-right"
                            : undefined;

                  return (
                    <th
                      key={col.key}
                      style={
                        lockedColumnPercents
                          ? { width: lockedColumnPercents[col.key] }
                          : layoutLocked
                            ? {
                                width: resolvedColumnWidths[col.key] ?? DEFAULT_COL_WIDTH,
                                minWidth: col.minWidth ?? DEFAULT_MIN_WIDTH,
                              }
                            : undefined
                      }
                      className={cn(
                        resizable && "data-table-th--resizable",
                        manageColumns && "data-table-th--managed",
                        pinClass,
                      )}
                    >
                      {col.headerRender ? (
                        col.headerRender()
                      ) : manageColumns ? (
                        <ColumnHeaderMenu
                          label={col.header}
                          sortable={false}
                          pinnable={isColumnPinnable(col)}
                          hideable={isColumnHideable(col)}
                          pin={pin}
                          activeSortDir={null}
                          onSort={() => {}}
                          onUnsort={() => {}}
                          onPin={(nextPin) => handlePin(col, nextPin)}
                          onHide={() => handleHide(col.key)}
                          onManageColumns={() => setManageOpen(true)}
                        />
                      ) : (
                        <span className="data-table-th-label">{col.header}</span>
                      )}
                      {resizable && index < visibleColumns.length - 1 && (
                        <span
                          className="data-table-col-resize"
                          role="separator"
                          aria-orientation="vertical"
                          aria-label={`Resize ${col.header} column`}
                          onMouseDown={(event) => startResize(col.key, index, event)}
                        />
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {pageData.map((row) => (
                <tr key={String((row as Record<string, unknown>)[keyField as string])} className={rowClassName?.(row)}>
                  {visibleColumns.map((col) => {
                    const pin = resolvePin(col, columnPrefs.pinned);
                    const tdPinClass =
                      pin === "left" && col.key === leftPinnedKeys[leftPinnedKeys.length - 1]
                        ? "data-table-td--pin-left-edge"
                        : pin === "right" && col.key === rightPinnedKeys[0]
                          ? "data-table-td--pin-right-edge"
                          : pin === "left"
                            ? "data-table-td--pin-left"
                            : pin === "right"
                              ? "data-table-td--pin-right"
                              : undefined;

                    return (
                      <td key={col.key} className={tdPinClass}>
                        {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? "")}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {manageColumns && (
        <ManageColumnsPanel
          open={manageOpen}
          columns={columns.map((col) => ({
            key: col.key,
            header: col.header,
            hideable: isColumnHideable(col),
          }))}
          hiddenKeys={hiddenSet}
          onToggle={handleToggleColumn}
          onShowAll={() => persistPrefs({ ...columnPrefs, hidden: [] })}
          onHideAll={() =>
            persistPrefs({
              ...columnPrefs,
              hidden: columns.filter(isColumnHideable).map((col) => col.key),
            })
          }
          onClose={() => setManageOpen(false)}
        />
      )}
    </div>
  );
}

// Sort helpers kept for future opt-in column sorting.
export function compareTableValues(a: unknown, b: unknown): number {
  return compareValues(a, b);
}

export function isTableColumnSortable<T>(col: TableColumn<T>): boolean {
  return isColumnSortable(col);
}
