"use client";

import { useId, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  CircleXIcon,
  FilterIcon,
  ListFilterIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { getChainName } from "@/lib/network";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { GeneralizedLiquidation } from "@/types";
import { useLiquidationsData } from "@/hooks/useLiquidationsData";
import DownloadCsv from "./DownloadCsv";
import { columns } from "./Columns";

type Props = {
  initialItems: GeneralizedLiquidation[];
  limit: number;
  pollMs?: number;
};

export default function RecentLiquidations({
  initialItems,
  limit,
  pollMs = 5000,
}: Props) {
  const id = useId();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data } = useLiquidationsData({
    initialItems,
    limit,
    pollMs,
  });

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [pageSize, setPageSize] = useState(limit);
  const inputRef = useRef<HTMLInputElement>(null);

  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "timestamp",
      desc: true,
    },
  ]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    enableSortingRemoval: false,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  });

  // Get unique protocol values
  const uniqueProtocolValues = useMemo(() => {
    const protocolColumn = table.getColumn("protocol");
    if (!protocolColumn) return [];
    const values = Array.from(protocolColumn.getFacetedUniqueValues().keys());
    return values.sort();
  }, [table]);

  // Get counts for each protocol
  const protocolCounts = useMemo(() => {
    const protocolColumn = table.getColumn("protocol");
    if (!protocolColumn) return new Map();
    return protocolColumn.getFacetedUniqueValues();
  }, [table]);

  // Get unique chain values
  const uniqueChainValues = useMemo(() => {
    const chainColumn = table.getColumn("chainId");
    if (!chainColumn) return [];
    const values = Array.from(chainColumn.getFacetedUniqueValues().keys());
    return values.sort((a, b) => Number(a) - Number(b));
  }, [table]);

  // Get counts for each chain
  const chainCounts = useMemo(() => {
    const chainColumn = table.getColumn("chainId");
    if (!chainColumn) return new Map();
    return chainColumn.getFacetedUniqueValues();
  }, [table]);

  // These don't need useMemo since they're just getters that return current state
  const selectedProtocols =
    (table.getColumn("protocol")?.getFilterValue() as string[]) ?? [];

  const selectedChains =
    (table.getColumn("chainId")?.getFilterValue() as number[]) ?? [];

  const handleProtocolChange = (checked: boolean, value: string) => {
    const filterValue = table
      .getColumn("protocol")
      ?.getFilterValue() as string[];
    const newFilterValue = filterValue ? [...filterValue] : [];

    if (checked) {
      newFilterValue.push(value);
    } else {
      const index = newFilterValue.indexOf(value);
      if (index > -1) {
        newFilterValue.splice(index, 1);
      }
    }

    table
      .getColumn("protocol")
      ?.setFilterValue(newFilterValue.length ? newFilterValue : undefined);
  };

  const handleChainChange = (checked: boolean, value: number) => {
    const filterValue = table
      .getColumn("chainId")
      ?.getFilterValue() as number[];
    const newFilterValue = filterValue ? [...filterValue] : [];

    if (checked) {
      newFilterValue.push(value);
    } else {
      const index = newFilterValue.indexOf(value);
      if (index > -1) {
        newFilterValue.splice(index, 1);
      }
    }

    table
      .getColumn("chainId")
      ?.setFilterValue(newFilterValue.length ? newFilterValue : undefined);
  };

  const updateUrlLimit = (newLimit: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("limit", newLimit.toString());
    router.push(`?${params.toString()}`);
  };

  return (
    <div className=" space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex justify-between w-full">
          {/* Filter by address, protocol, or tx hash */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Input
                id={`${id}-input`}
                ref={inputRef}
                className={cn(
                  "peer min-w-60 ps-9",
                  Boolean(table.getColumn("borrower")?.getFilterValue()) &&
                    "pe-9"
                )}
                value={
                  (table.getColumn("borrower")?.getFilterValue() ??
                    "") as string
                }
                onChange={(e) =>
                  table.getColumn("borrower")?.setFilterValue(e.target.value)
                }
                placeholder="Filter by address, protocol, or tx hash..."
                type="text"
                aria-label="Filter liquidations"
              />
              <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
                <ListFilterIcon size={16} aria-hidden="true" />
              </div>
              {Boolean(table.getColumn("borrower")?.getFilterValue()) && (
                <button
                  className="text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e transition-[color,box-shadow] outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Clear filter"
                  onClick={() => {
                    table.getColumn("borrower")?.setFilterValue("");
                    if (inputRef.current) {
                      inputRef.current.focus();
                    }
                  }}
                >
                  <CircleXIcon size={16} aria-hidden="true" />
                </button>
              )}
            </div>

            {/* Filter by protocol */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <FilterIcon
                    className="-ms-1 opacity-60"
                    size={16}
                    aria-hidden="true"
                  />
                  Protocol
                  {selectedProtocols.length > 0 && (
                    <span className="bg-background text-muted-foreground/70 -me-1 inline-flex h-5 max-h-full items-center rounded border px-1 font-[inherit] text-[0.625rem] font-medium">
                      {selectedProtocols.length}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto min-w-36 p-3" align="start">
                <div className="space-y-3">
                  <div className="text-muted-foreground text-xs font-medium">
                    Filter by Protocol
                  </div>
                  <div className="space-y-3">
                    {uniqueProtocolValues.map((value, i) => (
                      <div key={value} className="flex items-center gap-2">
                        <Checkbox
                          id={`${id}-protocol-${i}`}
                          checked={selectedProtocols.includes(value)}
                          onCheckedChange={(checked: boolean) =>
                            handleProtocolChange(checked, value)
                          }
                        />
                        <Label
                          htmlFor={`${id}-protocol-${i}`}
                          className="flex grow justify-between gap-2 font-normal"
                        >
                          {value}{" "}
                          <span className="text-muted-foreground ms-2 text-xs">
                            {protocolCounts.get(value)}
                          </span>
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Filter by chain */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <FilterIcon
                    className="-ms-1 opacity-60"
                    size={16}
                    aria-hidden="true"
                  />
                  Chain
                  {selectedChains.length > 0 && (
                    <span className="bg-background text-muted-foreground/70 -me-1 inline-flex h-5 max-h-full items-center rounded border px-1 font-[inherit] text-[0.625rem] font-medium">
                      {selectedChains.length}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto min-w-36 p-3" align="start">
                <div className="space-y-3">
                  <div className="text-muted-foreground text-xs font-medium">
                    Filter by Chain
                  </div>
                  <div className="space-y-3">
                    {uniqueChainValues.map((value, i) => (
                      <div key={value} className="flex items-center gap-2">
                        <Checkbox
                          id={`${id}-chain-${i}`}
                          checked={selectedChains.includes(Number(value))}
                          onCheckedChange={(checked: boolean) =>
                            handleChainChange(checked, Number(value))
                          }
                        />
                        <Label
                          htmlFor={`${id}-chain-${i}`}
                          className="flex grow justify-between gap-2 font-normal"
                        >
                          {getChainName(Number(value))}{" "}
                          <span className="text-muted-foreground ms-2 text-xs">
                            {chainCounts.get(value)}
                          </span>
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex items-center gap-4">
            {/* Results per page */}
            <div className="flex items-center gap-3">
              <Label htmlFor={id} className="max-sm:sr-only">
                Results per page
              </Label>
              <Select
                value={pageSize.toString()}
                onValueChange={(value) => {
                  const newPageSize = Number(value);
                  setPageSize(newPageSize);
                  updateUrlLimit(newPageSize);
                }}
              >
                <SelectTrigger id={id} className="w-fit whitespace-nowrap">
                  <SelectValue placeholder="Select number of results" />
                </SelectTrigger>
                <SelectContent className="[&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2">
                  {[5, 10, 25, 50, 100].map((pageSizeOption) => (
                    <SelectItem
                      key={pageSizeOption}
                      value={pageSizeOption.toString()}
                    >
                      {pageSizeOption}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Total results count */}
            <div className="text-muted-foreground text-sm whitespace-nowrap">
              <p
                className="text-muted-foreground text-sm whitespace-nowrap"
                aria-live="polite"
              >
                Showing{" "}
                <span className="text-foreground">
                  {table.getRowCount().toString()}
                </span>{" "}
                results
              </p>
            </div>
            <DownloadCsv defaultLimit={1000} />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className=" overflow-hidden  border rounded">
        <Table className="table-fixed p-1">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="hover:bg-transparent bg-muted/50"
              >
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      style={{ width: `${header.getSize()}px` }}
                      className="h-12 px-3  uppercase font-mono font-normal"
                    >
                      {header.isPlaceholder ? null : header.column.getCanSort() ? (
                        <div
                          className={cn(
                            header.column.getCanSort() &&
                              "flex h-full cursor-pointer items-center justify-between gap-2 select-none"
                          )}
                          onClick={header.column.getToggleSortingHandler()}
                          onKeyDown={(e) => {
                            if (
                              header.column.getCanSort() &&
                              (e.key === "Enter" || e.key === " ")
                            ) {
                              e.preventDefault();
                              header.column.getToggleSortingHandler()?.(e);
                            }
                          }}
                          tabIndex={header.column.getCanSort() ? 0 : undefined}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {{
                            asc: (
                              <ChevronUpIcon
                                className="shrink-0 opacity-60"
                                size={16}
                                aria-hidden="true"
                              />
                            ),
                            desc: (
                              <ChevronDownIcon
                                className="shrink-0 opacity-60"
                                size={16}
                                aria-hidden="true"
                              />
                            ),
                          }[header.column.getIsSorted() as string] ?? null}
                        </div>
                      ) : (
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="last:py-0 p-3 h-12">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No liquidations found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
