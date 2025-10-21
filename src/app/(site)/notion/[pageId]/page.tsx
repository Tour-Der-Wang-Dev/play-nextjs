import NotionBlockRenderer from "@/components/content/notion-block-renderer";
import { NotionClient, getNotionAccessToken } from "@/lib/integrations/notion/client";
import { NotionBlockTransformer } from "@/lib/integrations/notion/transformer";

export const dynamic = "force-dynamic";

export default async function NotionPage({ params }: { params: { pageId: string } }) {
  const token = getNotionAccessToken();
  const notion = new NotionClient(token);
  const transformer = new NotionBlockTransformer();
  const { page, blocks } = await notion.getPage(params.pageId);
  const body = transformer.transform(blocks);
  const title = transformer.extractTitle(page);

  return (
    <main className="container mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-6 text-3xl font-semibold text-slate-800 dark:text-white">{title}</h1>
      <NotionBlockRenderer body={body} />
    </main>
  );
}
