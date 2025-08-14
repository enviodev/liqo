import Link from "next/link";
import RecentLiquidations from "./components/RecentLiquidations";
import DownloadCsv from "./components/DownloadCsv";

export const dynamic = "force-dynamic";

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

type LiquidationStats = {
  id: string;
  chainId?: number | null;
  aaveCount: string;
  eulerCount: string;
  morphoCount: string;
  totalCount: string;
};

// Server uses upstream directly (hidden from clients); client polls via /api/graphql
const GRAPHQL_ENDPOINT =
  process.env.INDEXER_URL ||
  process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT ||
  "http://localhost:8080/v1/graphql";

async function fetchRecentLiquidations(
  limit: number
): Promise<GeneralizedLiquidation[]> {
  const query = `
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
    return json.data?.GeneralizedLiquidation ?? [];
  } catch {
    return [];
  }
}

async function fetchStats(): Promise<LiquidationStats | null> {
  const query = `
    query Stats {
      LiquidationStats(limit: 1, order_by: { id: desc }) {
        id
        chainId
        aaveCount
        eulerCount
        morphoCount
        totalCount
      }
    }
  `;

  try {
    const res = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    return (json.data?.LiquidationStats?.[0] as LiquidationStats) ?? null;
  } catch {
    return null;
  }
}

// formatting helpers moved into the client component

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = (await searchParams) ?? {};
  const rawLimit = Array.isArray(sp.limit) ? sp.limit[0] : sp.limit;
  const limit = Math.max(1, Math.min(100, Number(rawLimit ?? 10))) || 10;

  const [items, stats] = await Promise.all([
    fetchRecentLiquidations(limit),
    fetchStats(),
  ]);

  return (
    <div className="font-sans p-6 sm:p-10 flex flex-col gap-y-12 mt-6">
      <header className="mb-8">
        <div className="flex flex-col items-center  gap-1 max-w-2xl text-center mx-auto">
          <h1 className="text-balance text-4xl font-medium md:text-5xl">
            Hub for all onchain liquidations
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty font-mono text-muted-foreground">
            Track liquidations across chains
          </p>
        </div>
      </header>

      <section className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 max-w-5xl mx-auto w-full">
        <div className="rounded-lg border p-4">
          <div className="text-xs text-muted-foreground uppercase">Total</div>
          <div className="text-2xl font-mono  font-medium">
            {stats?.totalCount ?? "—"}
          </div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-xs text-muted-foreground uppercase">Aave</div>
          <div className="text-2xl font-mono font-medium">
            {stats?.aaveCount ?? "—"}
          </div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-xs text-muted-foreground uppercase">Euler</div>
          <div className="text-2xl font-mono font-medium">
            {stats?.eulerCount ?? "—"}
          </div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-xs text-muted-foreground uppercase">Morpho</div>
          <div className="text-2xl font-mono font-medium">
            {stats?.morphoCount ?? "—"}
          </div>
        </div>
      </section>

      <section className=" max-w-5xl mx-auto space-y-4">
        <h2 className="text-lg font-medium">Recent liquidations</h2>
        <RecentLiquidations initialItems={items} limit={limit} pollMs={5000} />
      </section>
    </div>
  );
}
