export type RichText = { type: 'text'; text: string; bold?: boolean; italic?: boolean; code?: boolean; underline?: boolean; strikethrough?: boolean; href?: string | null };

export type ContentBlock = {
  type: 'paragraph' | 'heading_1' | 'heading_2' | 'heading_3' | 'list' | 'code' | 'image' | 'divider' | 'quote' | 'callout';
  content: string | RichText[];
  metadata?: {
    level?: number;
    language?: string;
    url?: string;
    alt?: string;
    ordered?: boolean;
  };
};

export type ContentBody = { blocks: ContentBlock[] };

function extractRichText(rt: any[] | undefined): RichText[] {
  if (!Array.isArray(rt)) return [];
  return rt.map((r) => ({
    type: 'text',
    text: r?.plain_text ?? '',
    bold: r?.annotations?.bold ?? false,
    italic: r?.annotations?.italic ?? false,
    code: r?.annotations?.code ?? false,
    underline: r?.annotations?.underline ?? false,
    strikethrough: r?.annotations?.strikethrough ?? false,
    href: r?.href ?? null,
  }));
}

export class NotionBlockTransformer {
  transform(blocks: any[]): ContentBody {
    const out: ContentBlock[] = [];
    for (const b of blocks) {
      const t = b.type;
      if (t === 'paragraph') {
        out.push({ type: 'paragraph', content: extractRichText(b.paragraph?.rich_text) });
      } else if (t === 'heading_1' || t === 'heading_2' || t === 'heading_3') {
        const level = t === 'heading_1' ? 1 : t === 'heading_2' ? 2 : 3;
        out.push({ type: t, content: extractRichText(b[t]?.rich_text), metadata: { level } });
      } else if (t === 'bulleted_list_item' || t === 'numbered_list_item') {
        out.push({ type: 'list', content: extractRichText(b[t]?.rich_text), metadata: { ordered: t === 'numbered_list_item' } });
      } else if (t === 'code') {
        out.push({ type: 'code', content: b.code?.rich_text?.map((r: any) => r.plain_text).join('') ?? '', metadata: { language: b.code?.language } });
      } else if (t === 'image') {
        const url = b.image?.type === 'file' ? b.image?.file?.url : b.image?.external?.url;
        const alt = (b.image?.caption?.[0]?.plain_text as string) || '';
        out.push({ type: 'image', content: '', metadata: { url, alt } });
      } else if (t === 'divider') {
        out.push({ type: 'divider', content: '' });
      } else if (t === 'quote') {
        out.push({ type: 'quote', content: extractRichText(b.quote?.rich_text) });
      } else if (t === 'callout') {
        out.push({ type: 'callout', content: extractRichText(b.callout?.rich_text) });
      }
    }
    return { blocks: out };
  }

  extractTitle(page: any): string {
    const t = page?.properties?.Name || page?.properties?.title;
    if (t && Array.isArray(t?.title)) return t.title.map((x: any) => x.plain_text).join('');
    return page?.object === 'page' ? (page?.id as string) : 'Untitled';
  }

  extractMetadata(page: any): Record<string, any> {
    const props = page?.properties ?? {};
    const meta: Record<string, any> = {};
    for (const [k, v] of Object.entries(props)) {
      const val: any = v as any;
      if (val.type === 'select') meta[k] = val.select?.name ?? null;
      else if (val.type === 'multi_select') meta[k] = (val.multi_select ?? []).map((o: any) => o.name);
      else if (val.type === 'rich_text') meta[k] = (val.rich_text ?? []).map((r: any) => r.plain_text).join('');
      else if (val.type === 'title') meta[k] = (val.title ?? []).map((r: any) => r.plain_text).join('');
      else if (val.type === 'date') meta[k] = val.date?.start ?? null;
      else if (val.type === 'url') meta[k] = val.url ?? null;
      else if (val.type === 'checkbox') meta[k] = !!val.checkbox;
      else if (val.type === 'people') meta[k] = (val.people ?? []).map((p: any) => p.name ?? p.id);
      else if (val.type === 'files') meta[k] = (val.files ?? []).map((f: any) => f.name ?? f.file?.url ?? f.external?.url);
    }
    return meta;
  }

  toPlainText(body: ContentBody): string {
    return body.blocks
      .map((b) => (Array.isArray(b.content) ? b.content.map((r) => r.text).join('') : b.content))
      .join('\n');
  }

  toHTML(body: ContentBody): string {
    const esc = (s: string) => s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c] as string));
    const rt = (arr: RichText[]) => arr.map((r) => {
      let t = esc(r.text);
      if (r.bold) t = `<strong>${t}</strong>`;
      if (r.italic) t = `<em>${t}</em>`;
      if (r.code) t = `<code>${t}</code>`;
      if (r.underline) t = `<u>${t}</u>`;
      if (r.strikethrough) t = `<s>${t}</s>`;
      if (r.href) t = `<a href="${r.href}">${t}</a>`;
      return t;
    }).join('');

    const parts: string[] = [];
    for (const b of body.blocks) {
      if (b.type === 'paragraph') parts.push(`<p>${rt(b.content as RichText[])}</p>`);
      else if (b.type === 'heading_1') parts.push(`<h1>${rt(b.content as RichText[])}</h1>`);
      else if (b.type === 'heading_2') parts.push(`<h2>${rt(b.content as RichText[])}</h2>`);
      else if (b.type === 'heading_3') parts.push(`<h3>${rt(b.content as RichText[])}</h3>`);
      else if (b.type === 'list') parts.push(`<li>${rt(b.content as RichText[])}</li>`);
      else if (b.type === 'code') parts.push(`<pre><code>${esc(String(b.content))}</code></pre>`);
      else if (b.type === 'image') parts.push(`<img src="${b.metadata?.url ?? ''}" alt="${esc(b.metadata?.alt ?? '')}" />`);
      else if (b.type === 'divider') parts.push(`<hr />`);
      else if (b.type === 'quote') parts.push(`<blockquote>${rt(b.content as RichText[])}</blockquote>`);
      else if (b.type === 'callout') parts.push(`<div class="callout">${rt(b.content as RichText[])}</div>`);
    }
    // Wrap list items
    const html = parts.join('\n');
    const wrapped = html.replace(/(?:^(<li>[\s\S]*?<\/li>)(?:\n|$))+?/gm, (m) => `<ul>\n${m}\n</ul>`);
    return wrapped;
  }
}
