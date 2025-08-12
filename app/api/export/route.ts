import { NextResponse, type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

const INDEXER_URL =
  process.env.INDEXER_URL ||
  process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT ||
  "http://localhost:8080/v1/graphql";

function isValidEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  // Simple but practical email validation
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

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
    "seizedAssets",
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
      x.seizedAssets ?? "",
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
    const email = searchParams.get("email");
    const requestedLimit = Number(searchParams.get("limit") ?? 1000);
    const limit = Math.max(
      1,
      Math.min(10000, Number.isFinite(requestedLimit) ? requestedLimit : 1000)
    );

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 }
      );
    }

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
    const rows: GeneralizedLiquidation[] =
      json.data?.GeneralizedLiquidation ?? [];
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
