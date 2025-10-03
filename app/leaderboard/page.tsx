export const dynamic = "force-dynamic";

import { Badge } from "@/components/ui/badge";
import CopyButton from "@/app/components/CopyButton";
import { ArrowUpRightIcon, CalendarIcon } from "lucide-react";
import { cn, formatAddress, formatTime } from "@/lib/utils";
import {
  getAddressUrl,
  getChainColor,
  getChainName,
  getNetworkIcon,
} from "@/lib/network";

type LiquidatorRow = {
  id: string;
  liquidator: string;
  chainId?: number | null;
  aaveLiquidations: string;
  eulerLiquidations: string;
  morphoLiquidations: string;
  totalLiquidations: string;
  firstLiquidationTimestamp?: string | null;
  lastLiquidationTimestamp?: string | null;
};

const GRAPHQL_ENDPOINT =
  process.env.INDEXER_URL ||
  process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT ||
  "http://localhost:8080/v1/graphql";

async function fetchLeaderboard(limit: number): Promise<LiquidatorRow[]> {
  const query = `
    query Leaderboard($limit: Int!) {
      Liquidator(order_by: { totalLiquidations: desc }, limit: $limit) {
        id
        liquidator
        chainId
        aaveLiquidations
        eulerLiquidations
        morphoLiquidations
        totalLiquidations
        firstLiquidationTimestamp
        lastLiquidationTimestamp
      }
    }
  `;
  try {
    const res = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables: { limit } }),
      cache: "no-store",
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data?.Liquidator ?? [];
  } catch {
    return [];
  }
}

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = (await searchParams) ?? {};
  const rawLimit = Array.isArray(sp.limit) ? sp.limit[0] : sp.limit;
  const limit = Math.max(1, Math.min(100, Number(rawLimit ?? 50))) || 50;

  const rows = await fetchLeaderboard(limit);

  return (
    <div className="font-sans p-6 sm:p-10 flex flex-col gap-y-8 mt-6">
      <header className="mb-4">
        <div className="flex flex-col items-center gap-1 max-w-2xl text-center mx-auto">
          <h1 className="text-balance text-3xl font-medium md:text-4xl inline-flex items-center gap-3">
            Liquidation Leaderboard
            <span>
              <Badge variant="secondary" className="uppercase text-[10px]">
                New
              </Badge>
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-pretty font-mono text-muted-foreground">
            Top liquidators ranked by total liquidations.
          </p>
        </div>
      </header>

      <section className="max-w-5xl mx-auto w-full space-y-4">
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-3 py-3 font-mono uppercase">#</th>
                <th className="text-left px-3 py-3 font-mono uppercase">
                  Liquidator
                </th>
                <th className="text-left px-3 py-3 font-mono uppercase">
                  Chain
                </th>
                <th className="text-right px-3 py-3 font-mono uppercase">
                  Total
                </th>
                <th className="text-right px-3 py-3 font-mono uppercase">
                  Aave
                </th>
                <th className="text-right px-3 py-3 font-mono uppercase">
                  Euler
                </th>
                <th className="text-right px-3 py-3 font-mono uppercase">
                  Morpho
                </th>
                <th className="text-left px-3 py-3 font-mono uppercase">
                  First
                </th>
                <th className="text-left px-3 py-3 font-mono uppercase">
                  Last
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td className="px-3 py-6 text-center" colSpan={9}>
                    No leaderboard data.
                  </td>
                </tr>
              ) : (
                rows.map((r, idx) => (
                  <tr key={r.id} className="border-t">
                    <td className="px-3 py-3 align-middle">{idx + 1}</td>
                    <td className="px-3 py-3 align-middle">
                      <div className="flex items-center gap-2 min-w-0">
                        <a
                          href={getAddressUrl(
                            Number(r.chainId ?? 1),
                            r.liquidator
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono group text-xs whitespace-nowrap  hover:underline"
                        >
                          {formatAddress(r.liquidator, 4)}
                          <ArrowUpRightIcon
                            aria-hidden="true"
                            className="group-hover:-translate-y-1 group-focus-visible:-translate-y-1 inline-block h-4 w-4 shrink-0 translate-y-px transition-transform group-hover:translate-x-1 group-focus-visible:translate-x-1 motion-reduce:transition-none"
                          />
                        </a>
                        <CopyButton
                          text={r.liquidator}
                          ariaLabel="Copy liquidator"
                        />
                      </div>
                    </td>
                    <td className="px-3 py-3 align-middle">
                      {r.chainId ? (
                        <Badge
                          className={cn(
                            "text-xs flex items-center gap-2",
                            getChainColor(r.chainId)
                          )}
                        >
                          {getNetworkIcon({ chainId: r.chainId, size: 16 })}
                          {getChainName(r.chainId)}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs">-</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-right align-middle font-mono font-medium">
                      {r.totalLiquidations}
                    </td>
                    <td className="px-3 py-3 text-right align-middle">
                      {r.aaveLiquidations}
                    </td>
                    <td className="px-3 py-3 text-right align-middle">
                      {r.eulerLiquidations}
                    </td>
                    <td className="px-3 py-3 text-right align-middle">
                      {r.morphoLiquidations}
                    </td>
                    <td className="px-3 py-3 align-middle whitespace-nowrap">
                      <div className="text-xs gap-1 inline-flex items-center font-mono text-muted-foreground whitespace-nowrap">
                        <CalendarIcon className="size-4" />
                        {r.firstLiquidationTimestamp
                          ? formatTime(r.firstLiquidationTimestamp)
                          : "-"}
                      </div>
                    </td>
                    <td className="px-3 py-3 align-middle whitespace-nowrap">
                      <div className="text-xs gap-1 inline-flex items-center font-mono text-muted-foreground whitespace-nowrap">
                        <CalendarIcon className="size-4" />
                        {r.lastLiquidationTimestamp
                          ? formatTime(r.lastLiquidationTimestamp)
                          : "-"}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
