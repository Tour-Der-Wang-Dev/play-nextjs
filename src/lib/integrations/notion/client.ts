import { Client } from "@notionhq/client";

export type Database = any;
export type Page = any;
export type PageWithBlocks = { page: any; blocks: any[] };

export class NotionClient {
  private client: Client;
  constructor(accessToken: string) {
    this.client = new Client({ auth: accessToken });
  }

  async listDatabases(): Promise<Database[]> {
    const res = await this.client.search({
      filter: { property: "object", value: "database" },
      sort: { direction: "ascending", timestamp: "last_edited_time" },
    });
    return res.results as Database[];
  }

  async listPages(databaseId: string): Promise<Page[]> {
    const res = await this.client.databases.query({ database_id: databaseId });
    return res.results as Page[];
  }

  async getPage(pageId: string): Promise<PageWithBlocks> {
    const page = await this.client.pages.retrieve({ page_id: pageId });
    const blocks: any[] = [];
    let cursor: string | undefined = undefined;
    do {
      const resp = await this.client.blocks.children.list({
        block_id: pageId,
        start_cursor: cursor,
      });
      blocks.push(...resp.results);
      cursor = resp.next_cursor ?? undefined;
    } while (cursor);
    return { page, blocks };
  }

  async setupWebhook(_pageId: string): Promise<void> {
    // Notion webhooks require external configuration; no-op here.
    return;
  }
}

export function getNotionAccessToken(): string {
  const token = process.env.NOTION_TOKEN;
  if (!token) throw new Error("NOTION_TOKEN is not set");
  return token as string;
}
