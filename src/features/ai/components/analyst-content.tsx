"use client";

import type { ReactNode } from "react";
import { SqlViewer } from "@/features/ai/components/sql-viewer";
import { QueryResult } from "@/features/ai/components/query-result";

/** Lightweight formatting for analyst responses — no markdown framework. */
export function AnalystContent({ text, dataSourceId, isNewMessage = false }: { text: string; dataSourceId?: string | null; isNewMessage?: boolean }) {
  const blocks = splitBlocks(text);
  return (
    <div className="space-y-3 text-[13.5px] leading-relaxed text-text-1">
      {blocks.map((block, index) => (
        <Block key={`${block.kind}-${index}`} block={block} dataSourceId={dataSourceId} isNewMessage={isNewMessage} />
      ))}
    </div>
  );
}

type ContentBlock =
  | { kind: "paragraph"; text: string }
  | { kind: "code"; text: string; lang?: string }
  | { kind: "list"; ordered: boolean; items: string[] }
  | { kind: "heading"; text: string };

function splitBlocks(text: string): ContentBlock[] {
  const normalized = text.replace(/\r\n/g, "\n").trim();
  if (!normalized) {
    return [];
  }

  const blocks: ContentBlock[] = [];
  const parts = normalized.split(/(```[\s\S]*?```)/g);

  for (const part of parts) {
    if (!part) {
      continue;
    }
    if (part.startsWith("```") && part.endsWith("```")) {
      const langMatch = part.slice(3, 15).match(/^(\w+)\n/);
      const lang = langMatch ? langMatch[1] : undefined;
      const inner = part.slice(3, -3).replace(/^\w*\n/, "");
      blocks.push({ kind: "code", text: inner.trimEnd(), lang });
      continue;
    }

    const lines = part.split("\n");
    let buffer: string[] = [];
    let listItems: string[] | null = null;
    let ordered = false;

    function flushParagraph() {
      const joined = buffer.join("\n").trim();
      buffer = [];
      if (!joined) {
        return;
      }
      if (/^#{1,3}\s+\S/.test(joined) && !joined.includes("\n")) {
        blocks.push({
          kind: "heading",
          text: joined.replace(/^#{1,3}\s+/, ""),
        });
        return;
      }
      blocks.push({ kind: "paragraph", text: joined });
    }

    function flushList() {
      if (listItems && listItems.length > 0) {
        blocks.push({ kind: "list", ordered, items: listItems });
      }
      listItems = null;
    }

    for (const line of lines) {
      const bullet = line.match(/^\s*[-*]\s+(.+)$/);
      const number = line.match(/^\s*\d+[.)]\s+(.+)$/);
      if (bullet) {
        flushParagraph();
        if (!listItems || ordered) {
          flushList();
          listItems = [];
          ordered = false;
        }
        listItems.push(bullet[1] ?? "");
        continue;
      }
      if (number) {
        flushParagraph();
        if (!listItems || !ordered) {
          flushList();
          listItems = [];
          ordered = true;
        }
        listItems.push(number[1] ?? "");
        continue;
      }
      if (line.trim() === "") {
        flushList();
        flushParagraph();
        continue;
      }
      flushList();
      buffer.push(line);
    }
    flushList();
    flushParagraph();
  }

  return blocks;
}

function Block({
  block,
  dataSourceId,
  isNewMessage,
}: {
  block: ContentBlock;
  dataSourceId?: string | null;
  isNewMessage?: boolean;
}) {
  if (block.kind === "heading") {
    return <h5 className="text-[14px] font-bold text-text-1">{block.text}</h5>;
  }
  if (block.kind === "code") {
    if (block.lang?.toLowerCase() === "sql" || block.text.trim().toUpperCase().startsWith("SELECT")) {
      return (
        <div className="my-4 space-y-3">
          <SqlViewer sql={block.text} />
          <QueryResult
            sql={block.text}
            dataSourceId={dataSourceId ?? null}
            isNewMessage={isNewMessage}
          />
        </div>
      );
    }
    return (
      <pre className="overflow-x-auto rounded-sm border border-border bg-sunken p-3 font-mono text-[12px] leading-relaxed text-text-1">
        <code>{block.text}</code>
      </pre>
    );
  }
  if (block.kind === "list") {
    const Tag = block.ordered ? "ol" : "ul";
    return (
      <Tag
        className={`space-y-1 pl-5 text-text-1 ${
          block.ordered ? "list-decimal" : "list-disc"
        }`}
      >
        {block.items.map((item, index) => (
          <li key={`${item}-${index}`}>{renderInline(item)}</li>
        ))}
      </Tag>
    );
  }
  return <p className="whitespace-pre-wrap">{renderInline(block.text)}</p>;
}

function renderInline(text: string): ReactNode {
  const nodes: ReactNode[] = [];
  const pattern = /(`[^`]+`|\*\*[^*]+\*\*)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) {
      nodes.push(text.slice(last, match.index));
    }
    const token = match[0];
    if (token.startsWith("`")) {
      nodes.push(
        <code
          key={`c-${key++}`}
          className="rounded-[4px] bg-sunken px-1 py-0.5 font-mono text-[12px]"
        >
          {token.slice(1, -1)}
        </code>,
      );
    } else {
      nodes.push(
        <strong key={`b-${key++}`} className="font-semibold">
          {token.slice(2, -2)}
        </strong>,
      );
    }
    last = match.index + token.length;
  }
  if (last < text.length) {
    nodes.push(text.slice(last));
  }
  return nodes.length > 0 ? nodes : text;
}
