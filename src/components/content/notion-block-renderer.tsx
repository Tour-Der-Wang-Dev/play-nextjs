"use client";

import React from "react";
import type { ContentBody, RichText } from "@/lib/integrations/notion/transformer";

function renderRichText(r: RichText[]) {
  return r.map((t, i) => {
    let el: React.ReactNode = t.text;
    if (t.bold) el = <strong key={i}>{el}</strong>;
    if (t.italic) el = <em key={i}>{el}</em>;
    if (t.code) el = <code key={i}>{el}</code>;
    if (t.underline) el = <u key={i}>{el}</u>;
    if (t.strikethrough) el = <s key={i}>{el}</s>;
    if (t.href) el = (
      <a key={i} href={t.href} className="text-primary underline" target="_blank" rel="noreferrer">
        {el}
      </a>
    );
    return <React.Fragment key={i}>{el}</React.Fragment>;
  });
}

export default function NotionBlockRenderer({ body }: { body: ContentBody }) {
  return (
    <div className="prose prose-slate max-w-none dark:prose-invert">
      {body.blocks.map((b, idx) => {
        if (b.type === "paragraph") return <p key={idx}>{renderRichText(b.content as RichText[])}</p>;
        if (b.type === "heading_1") return <h1 key={idx}>{renderRichText(b.content as RichText[])}</h1>;
        if (b.type === "heading_2") return <h2 key={idx}>{renderRichText(b.content as RichText[])}</h2>;
        if (b.type === "heading_3") return <h3 key={idx}>{renderRichText(b.content as RichText[])}</h3>;
        if (b.type === "list") return <li key={idx}>{renderRichText(b.content as RichText[])}</li>;
        if (b.type === "code") return (
          <pre key={idx} className="rounded bg-slate-900 p-3 text-white">
            <code>{String(b.content)}</code>
          </pre>
        );
        if (b.type === "image") return <img key={idx} src={b.metadata?.url} alt={b.metadata?.alt || ""} className="rounded" />;
        if (b.type === "divider") return <hr key={idx} />;
        if (b.type === "quote") return <blockquote key={idx}>{renderRichText(b.content as RichText[])}</blockquote>;
        if (b.type === "callout") return <div key={idx} className="rounded border-l-4 border-primary/60 bg-primary/5 p-3">{renderRichText(b.content as RichText[])}</div>;
        return null;
      })}
    </div>
  );
}
