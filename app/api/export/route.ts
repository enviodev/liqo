import { NextResponse, type NextRequest } from "next/server";
export const dynamic = "force-dynamic";

const INDEXER_URL =
  process.env.INDEXER_URL ||
  process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT ||
  "http://localhost:8080/v1/graphql";

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
  repaidAssetsUSD?: number | null;
  seizedAssetsUSD?: number | null;
};

function csvEscape(value: unknown): string {
  const s = value == null ? "" : String(value);
  if (/[",\n]/.test(s)) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

function toCsv(rows: GeneralizedLiquidation[]): string {
  const header = [
    "timestamp",
    "protocol",
    "borrower",
    "liquidator",
    "txHash",
    "collateralAsset",
    "debtAsset",
    "repaidAssets",
    "repaidAssetsUSD",
    "seizedAssets",
    "seizedAssetsUSD",
    "chainId",
  ].join(",");

  const lines = rows.map((x) =>
    [
      x.timestamp,
      x.protocol,
      x.borrower,
      x.liquidator,
      x.txHash,
      x.collateralAsset ?? "",
      x.debtAsset ?? "",
      x.repaidAssets ?? "",
      x.repaidAssetsUSD ?? "",
      x.seizedAssets ?? "",
      x.seizedAssetsUSD ?? "",
      x.chainId,
    ]
      .map(csvEscape)
      .join(",")
  );

  // Prepend BOM for better compatibility with Excel
  const bom = "\uFEFF";
  return bom + header + "\n" + lines.join("\n");
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const requestedLimit = Number(searchParams.get("limit") ?? 1000);
    const limit = Math.max(
      1,
      Math.min(10000, Number.isFinite(requestedLimit) ? requestedLimit : 1000)
    );

    const query = `
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
    `;

    const upstream = await fetch(INDEXER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables: { limit } }),
      cache: "no-store",
    });

    if (!upstream.ok) {
      return NextResponse.json(
        { error: "Upstream request failed" },
        { status: 502 }
      );
    }

    const json = await upstream.json();
    const raw = (json.data?.GeneralizedLiquidation ?? []) as unknown[];
    const rows: GeneralizedLiquidation[] = raw.map((x: unknown) => {
      const item = x as Record<string, unknown>;
      return {
        id: item.id as string,
        chainId: item.chainId as number,
        timestamp: String(item.timestamp),
        protocol: item.protocol as string,
        borrower:
          ((item?.borrower as Record<string, unknown>)?.borrower as string) ??
          "",
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
    const csv = toCsv(rows);

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="liqo_recent_${limit}.csv"`,
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to generate CSV" },
      { status: 500 }
    );
  }
}
