"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import CopyButton from "./CopyButton";

type GeneralizedLiquidation = {
  id: string;
  chainId: number;
  timestamp: string;
  protocol: string;
  borrower: string;
  liquidator: string;
  txHash: string;
  collateralAsset?: string | null;
  debtAsset?: string | null;
  repaidAssets?: string | null;
  seizedAssets?: string | null;
};

type Props = {
  initialItems: GeneralizedLiquidation[];
  limit: number;
  pollMs?: number;
};

// Client calls internal proxy route so the upstream INDEXER_URL is never exposed
const GRAPHQL_ENDPOINT = "/api/graphql";

function formatAddress(addr?: string | null, size: number = 6) {
  if (!addr) return "-";
  return `${addr.slice(0, 2 + size)}…${addr.slice(-size)}`;
}

function formatTime(ts: string) {
  const n = Number(ts);
  if (!Number.isFinite(n)) return ts;
  return new Date(n * 1000).toLocaleString();
}

export default function RecentLiquidations({
  initialItems,
  limit,
  pollMs = 5000,
}: Props) {
  const [items, setItems] = useState<GeneralizedLiquidation[]>(initialItems);
  const isFetchingRef = useRef(false);

  const query = useMemo(
    () => `
    query RecentLiquidations($limit: Int!) {
      GeneralizedLiquidation(limit: $limit, order_by: { timestamp: desc }) {
        id
        chainId
        timestamp
        protocol
        borrower
        liquidator
        txHash
        collateralAsset
        debtAsset
        repaidAssets
        seizedAssets
      }
    }
  `,
    []
  );

  useEffect(() => {
    let aborted = false;

    async function poll() {
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;
      try {
        const res = await fetch(GRAPHQL_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query, variables: { limit } }),
          cache: "no-store",
        });
        if (!res.ok) return;
        const json = await res.json();
        const latest: GeneralizedLiquidation[] =
          json.data?.GeneralizedLiquidation ?? [];

        if (aborted) return;
        // Update if anything changed (compare first id/length)
        const hasChange =
          latest.length !== items.length ||
          (latest[0]?.id && latest[0]?.id !== items[0]?.id);
        if (hasChange) setItems(latest);
      } catch {
        // ignore
      } finally {
        isFetchingRef.current = false;
      }
    }

    // Kick off immediately, then poll
    poll();
    const id = window.setInterval(poll, pollMs);

    return () => {
      aborted = true;
      window.clearInterval(id);
    };
  }, [limit, pollMs, query, items]);

  return (
    <div className="overflow-x-auto">
      <div className="w-full">
        <div className="grid grid-cols-7 gap-1 px-4 py-2 text-[11px] font-medium text-muted-foreground">
          <div className="w-[160px]">Date</div>
          <div className="w-[72px]">Protocol</div>
          <div>Borrower</div>
          <div>Liquidator</div>
          <div>Tx</div>
          <div>Collateral</div>
          <div className="w-[64px] text-right">Chain</div>
        </div>
        <div className="divide-y">
          {items.length === 0 ? (
            <div className="p-6 text-sm text-muted-foreground">No data</div>
          ) : (
            items.map((x) => (
              <div
                key={x.id}
                className="grid grid-cols-7 gap-1 p-4 hover:bg-muted/50 items-center"
              >
                <div className="text-xs text-muted-foreground whitespace-nowrap w-[160px]">
                  {formatTime(x.timestamp)}
                </div>
                <div className="text-sm font-medium w-[72px] whitespace-nowrap">
                  {x.protocol}
                </div>
                <div className="text-xs flex items-center gap-2 min-w-0">
                  <span className="font-mono whitespace-nowrap overflow-hidden max-w-[200px]">
                    {formatAddress(x.borrower, 4)}
                  </span>
                  <CopyButton text={x.borrower} ariaLabel="Copy borrower" />
                </div>
                <div className="text-xs flex items-center gap-2 min-w-0">
                  <span className="font-mono whitespace-nowrap overflow-hidden max-w-[200px]">
                    {formatAddress(x.liquidator, 4)}
                  </span>
                  <CopyButton text={x.liquidator} ariaLabel="Copy liquidator" />
                </div>
                <div className="text-xs flex items-center gap-2 min-w-0">
                  <span className="font-mono whitespace-nowrap overflow-hidden max-w-[280px]">
                    {formatAddress(x.txHash, 4)}
                  </span>
                  <CopyButton
                    text={x.txHash}
                    ariaLabel="Copy transaction hash"
                  />
                </div>
                <div className="text-xs flex items-center gap-2 min-w-0">
                  {x.collateralAsset ? (
                    <>
                      <span className="font-mono whitespace-nowrap overflow-hidden max-w-[200px]">
                        {formatAddress(x.collateralAsset, 4)}
                      </span>
                      <CopyButton
                        text={x.collateralAsset}
                        ariaLabel="Copy collateral"
                      />
                    </>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </div>
                <div className="text-xs text-right w-[64px] whitespace-nowrap">
                  {x.chainId}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
