import { NextResponse } from "next/server";
import { NotionClient, getNotionAccessToken } from "@/lib/integrations/notion/client";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const token = getNotionAccessToken();
    const notion = new NotionClient(token);
    const results = await notion.listDatabases();
    return NextResponse.json({ results });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Unknown error" }, { status: 500 });
  }
}
