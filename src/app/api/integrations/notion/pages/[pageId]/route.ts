import { NextRequest, NextResponse } from "next/server";
import { NotionClient, getNotionAccessToken } from "@/lib/integrations/notion/client";
import { NotionBlockTransformer } from "@/lib/integrations/notion/transformer";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: { pageId: string } }) {
  try {
    const token = getNotionAccessToken();
    const notion = new NotionClient(token);
    const { page, blocks } = await notion.getPage(params.pageId);
    const transformer = new NotionBlockTransformer();
    const body = transformer.transform(blocks);
    const title = transformer.extractTitle(page);
    const metadata = transformer.extractMetadata(page);
    return NextResponse.json({ id: params.pageId, title, metadata, body });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Unknown error" }, { status: 500 });
  }
}
