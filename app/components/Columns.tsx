"use client";

import { Badge } from "@/components/ui/badge";
import {
  getAddressUrl,
  getChainColor,
  getChainName,
  getNetworkIcon,
  getTxUrl,
} from "@/lib/network";
import {
  chainFilterFn,
  multiColumnFilterFn,
  protocolFilterFn,
} from "@/lib/table";
import { GeneralizedLiquidation } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpRightIcon } from "lucide-react";
import CopyButton from "./CopyButton";
import {
  cn,
  formatAddress,
  formatTimeCompact,
  formatToken,
  formatUSD,
} from "@/lib/utils";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Payment = {
  id: string;
  amount: number;
  status: "pending" | "processing" | "success" | "failed";
  email: string;
};

export const columns: ColumnDef<GeneralizedLiquidation>[] = [
  {
    header: "Date",
    accessorKey: "timestamp",
    cell: ({ row }) => (
      <div className="text-xs font-mono text-muted-foreground whitespace-nowrap">
        {formatTimeCompact(row.getValue("timestamp"))}
      </div>
    ),
    size: 85,
    enableHiding: false,
  },
  {
    header: "Chain",
    accessorKey: "chainId",
    cell: ({ row }) => {
      const chainId = row.getValue("chainId") as number;
      const networkIcon = getNetworkIcon({ chainId, size: 16 });
      return (
        <Badge
          className={cn(
            "text-xs flex items-center gap-2",
            getChainColor(chainId)
          )}
        >
          {networkIcon}
          {getChainName(chainId)}
        </Badge>
      );
    },
    size: 90,
    filterFn: chainFilterFn,
  },
  {
    header: "Protocol",
    accessorKey: "protocol",
    cell: ({ row }) => {
      return (
        <Badge
          variant="secondary"
          className="font-medium flex items-center gap-2"
        >
          {row.getValue("protocol")}
        </Badge>
      );
    },
    size: 85,
    filterFn: protocolFilterFn,
  },
  {
    header: "Borrower",
    accessorKey: "borrower",
    cell: ({ row }) => (
      <div className="flex items-center gap-2 min-w-0">
        <a
          href={getAddressUrl(
            row.getValue("chainId"),
            row.getValue("borrower")
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono group text-xs whitespace-nowrap  hover:underline"
        >
          {formatAddress(row.getValue("borrower"), 3)}
          <ArrowUpRightIcon
            aria-hidden="true"
            className="group-hover:-translate-y-1 group-focus-visible:-translate-y-1 inline-block h-4 w-4 shrink-0 translate-y-px transition-transform group-hover:translate-x-1 group-focus-visible:translate-x-1 motion-reduce:transition-none"
          />
        </a>

        <CopyButton text={row.getValue("borrower")} ariaLabel="Copy borrower" />
      </div>
    ),
    size: 120,
    filterFn: multiColumnFilterFn,
  },
  {
    header: "Liquidator",
    accessorKey: "liquidator",
    cell: ({ row }) => (
      <div className="flex items-center gap-2 min-w-0">
        <a
          href={getAddressUrl(
            row.getValue("chainId"),
            row.getValue("liquidator")
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono group text-xs whitespace-nowrap  hover:underline"
        >
          {formatAddress(row.getValue("liquidator"), 3)}
          <ArrowUpRightIcon
            aria-hidden="true"
            className="group-hover:-translate-y-1 group-focus-visible:-translate-y-1 inline-block h-4 w-4 shrink-0 translate-y-px transition-transform group-hover:translate-x-1 group-focus-visible:translate-x-1 motion-reduce:transition-none"
          />
        </a>
        <CopyButton
          text={row.getValue("liquidator")}
          ariaLabel="Copy liquidator"
        />
      </div>
    ),
    size: 120,
  },
  {
    header: "Transaction",
    accessorKey: "txHash",
    cell: ({ row }) => (
      <div className="flex items-center gap-2 min-w-0">
        <a
          href={getTxUrl(row.getValue("chainId"), row.getValue("txHash"))}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono group text-xs whitespace-nowrap  hover:underline"
        >
          {formatAddress(row.getValue("txHash"), 3)}
          <ArrowUpRightIcon
            aria-hidden="true"
            className="group-hover:-translate-y-1 group-focus-visible:-translate-y-1 inline-block h-4 w-4 shrink-0 translate-y-px transition-transform group-hover:translate-x-1 group-focus-visible:translate-x-1 motion-reduce:transition-none"
          />
        </a>
        <CopyButton
          text={row.getValue("txHash")}
          ariaLabel="Copy transaction hash"
        />
      </div>
    ),
    size: 120,
  },
  {
    header: "Collateral",
    accessorKey: "collateralAsset",
    cell: ({ row }) => {
      const collateral = row.getValue("collateralAsset") as string | null;
      const usd = row.original.seizedAssetsUSD;
      return collateral ? (
        <div className="flex items-center gap-2 min-w-0">
          {formatToken(collateral, 6)}
          <span className="text-muted-foreground text-xs">
            ({formatUSD(usd, 2)})
          </span>
        </div>
      ) : (
        <span className="text-muted-foreground text-xs">-</span>
      );
    },
    size: 130,
  },
  {
    header: "Debt",
    accessorKey: "debtAsset",
    cell: ({ row }) => {
      const debt = row.getValue("debtAsset") as string | null;
      const usd = row.original.repaidAssetsUSD;
      return debt ? (
        <div className="flex items-center gap-2 min-w-0">
          {formatToken(debt, 6)}
          <span className="text-muted-foreground text-xs">
            ({formatUSD(usd, 2)})
          </span>
        </div>
      ) : (
        <span className="text-muted-foreground text-xs">-</span>
      );
    },
    size: 130,
  },
];
