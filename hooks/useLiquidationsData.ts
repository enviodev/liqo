"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { GeneralizedLiquidation } from "@/types";

type Props = {
  initialItems: GeneralizedLiquidation[];
  limit: number;
  pollMs?: number;
};

export function useLiquidationsData({
  initialItems,
  limit,
  pollMs = 5000,
}: Props) {
  const [data, setData] = useState<GeneralizedLiquidation[]>(initialItems);
  const isFetchingRef = useRef(false);

  // GraphQL query for fetching data
  const query = useMemo(
    () => `
    query RecentLiquidations($limit: Int!) {
      GeneralizedLiquidation(limit: $limit, order_by: { timestamp: desc }) {
        id
        chainId
        timestamp
        protocol
        borrower { borrower }
        liquidator { liquidator }
        txHash
        collateralAsset
        debtAsset
        repaidAssets
        repaidAssetsUSD
        seizedAssets
        seizedAssetsUSD
      }
    }
  `,
    []
  );

  // Polling effect
  useEffect(() => {
    let aborted = false;

    async function poll() {
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;
      try {
        const res = await fetch("/api/graphql", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query, variables: { limit } }),
          cache: "no-store",
        });
        if (!res.ok) return;
        const json = await res.json();
        const raw = (json.data?.GeneralizedLiquidation ?? []) as unknown[];
        const latest: GeneralizedLiquidation[] = raw.map((x: unknown) => {
          const item = x as Record<string, unknown>;
          return {
            id: item.id as string,
            chainId: item.chainId as number,
            timestamp: String(item.timestamp),
            protocol: item.protocol as string,
            borrower:
              ((item?.borrower as Record<string, unknown>)
                ?.borrower as string) ?? "",
            liquidator:
              ((item?.liquidator as Record<string, unknown>)
                ?.liquidator as string) ?? "",
            txHash: item.txHash as string,
            collateralAsset: (item.collateralAsset as string) ?? null,
            debtAsset: (item.debtAsset as string) ?? null,
            repaidAssets: (item.repaidAssets as string) ?? null,
            repaidAssetsUSD: item.repaidAssetsUSD
              ? parseFloat(item.repaidAssetsUSD as string)
              : null,
            seizedAssets: (item.seizedAssets as string) ?? null,
            seizedAssetsUSD: item.seizedAssetsUSD
              ? parseFloat(item.seizedAssetsUSD as string)
              : null,
          };
        });

        if (aborted) return;
        // Update if anything changed (compare first id/length)
        const hasChange =
          latest.length !== data.length ||
          (latest[0]?.id && latest[0]?.id !== data[0]?.id);
        if (hasChange) setData(latest);
      } catch {
        // ignore
      } finally {
        isFetchingRef.current = false;
      }
    }

    // Kick off immediately, then poll
    poll();
    const intervalId = setInterval(poll, pollMs);

    return () => {
      aborted = true;
      clearInterval(intervalId);
    };
  }, [limit, pollMs, query]);

  return { data };
}
