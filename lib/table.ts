import { GeneralizedLiquidation } from "@/types";
import { FilterFn } from "@tanstack/react-table";

// Custom filter functions
export const multiColumnFilterFn: FilterFn<GeneralizedLiquidation> = (
  row,
  columnId,
  filterValue
) => {
  const searchableRowContent = `
    ${row.original.borrower}
    ${row.original.liquidator}
    ${row.original.protocol}
    ${row.original.txHash}
    ${row.original.collateralAsset || ''}
    ${row.original.debtAsset || ''}
  `.toLowerCase();
  const searchTerm = (filterValue ?? "").toLowerCase();
  return searchableRowContent.includes(searchTerm);
};

export const protocolFilterFn: FilterFn<GeneralizedLiquidation> = (
  row,
  columnId,
  filterValue: string[]
) => {
  if (!filterValue?.length) return true;
  const protocol = row.getValue(columnId) as string;
  return filterValue.includes(protocol);
};

export const chainFilterFn: FilterFn<GeneralizedLiquidation> = (
  row,
  columnId,
  filterValue: number[]
) => {
  if (!filterValue?.length) return true;
  const chainId = row.getValue(columnId) as number;
  return filterValue.includes(chainId);
};
