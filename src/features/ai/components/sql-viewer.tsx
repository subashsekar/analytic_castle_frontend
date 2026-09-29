"use client";

import { useState } from "react";
import { Check, Clipboard, ChevronDown, ChevronUp } from "lucide-react";

type SqlViewerProps = {
  sql: string;
};

// Simple, high-quality, lightweight SQL syntax highlighter.
function highlightSql(sql: string): React.ReactNode[] {
  const keywords = new Set([
    "SELECT", "FROM", "WHERE", "JOIN", "ON", "AND", "OR", "LIMIT", "GROUP BY",
    "ORDER BY", "HAVING", "AS", "LEFT", "RIGHT", "INNER", "OUTER", "WITH",
    "UNION", "ALL", "USING", "COUNT", "SUM", "AVG", "MIN", "MAX", "COALESCE",
    "CASE", "WHEN", "THEN", "ELSE", "END", "NOT", "IN", "NULL", "IS", "LIKE", "ILIKE"
  ]);

  // Tokenize using a regular expression that extracts comments, string literals, words, numbers, and symbols.
  const regex = /(--.*)|('(?:''|[^'])*')|(\b[a-zA-Z_][a-zA-Z0-9_]*\b)|(\b\d+(?:\.\d+)?\b)|(\s+)|(.)/g;
  const nodes: React.ReactNode[] = [];
  let match;
  let key = 0;

  while ((match = regex.exec(sql)) !== null) {
    const [
      text,
      comment,
      stringLiteral,
      word,
      number,
      whitespace,
    ] = match;

    if (comment) {
      nodes.push(
        <span key={key++} className="text-text-3 italic font-normal">
          {text}
        </span>
      );
    } else if (stringLiteral) {
      nodes.push(
        <span key={key++} className="text-emerald-500 dark:text-emerald-400 font-medium">
          {text}
        </span>
      );
    } else if (word) {
      const upperWord = word.toUpperCase();
      if (keywords.has(upperWord)) {
        nodes.push(
          <span key={key++} className="text-signal dark:text-blue-400 font-bold">
            {text}
          </span>
        );
      } else {
        nodes.push(<span key={key++}>{text}</span>);
      }
    } else if (number) {
      nodes.push(
        <span key={key++} className="text-amber-500 font-medium">
          {text}
        </span>
      );
    } else if (whitespace) {
      nodes.push(text);
    } else {
      nodes.push(<span key={key++} className="text-text-2">{text}</span>);
    }
  }

  return nodes;
}

export function SqlViewer({ sql }: SqlViewerProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const cleanSql = sql.trim();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(cleanSql);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy SQL: ", err);
    }
  };

  return (
    <div className="mt-3 rounded-md border border-border bg-sunken overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-border bg-surface px-3 py-2 text-[12px] font-semibold text-text-2">
        <span className="font-mono text-text-3">Generated SQL</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="ac-focus-ring flex items-center gap-1 rounded-[4px] px-2 py-1 hover:bg-sunken text-text-3 hover:text-text-1"
            title="Copy SQL"
          >
            {copied ? (
              <>
                <Check size={13} className="text-emerald-500" />
                <span className="text-emerald-500">Copied</span>
              </>
            ) : (
              <>
                <Clipboard size={13} />
                <span>Copy</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="ac-focus-ring flex items-center gap-1 rounded-[4px] px-2 py-1 hover:bg-sunken text-text-3 hover:text-text-1"
          >
            {expanded ? (
              <>
                <ChevronUp size={13} />
                <span>Collapse</span>
              </>
            ) : (
              <>
                <ChevronDown size={13} />
                <span>Expand</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* SQL Body */}
      {expanded ? (
        <pre className="p-4 overflow-x-auto font-mono text-[12px] leading-relaxed text-text-1 select-all max-h-[350px] whitespace-pre">
          <code>{highlightSql(cleanSql)}</code>
        </pre>
      ) : (
        <div 
          onClick={() => setExpanded(true)}
          className="p-3 font-mono text-[12px] text-text-3 hover:text-text-2 cursor-pointer bg-sunken/40 flex justify-between items-center whitespace-nowrap overflow-hidden text-ellipsis"
        >
          <code className="text-ellipsis overflow-hidden">{cleanSql.split("\n")[0]}...</code>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 text-text-3 shrink-0">Click to expand</span>
        </div>
      )}
    </div>
  );
}
