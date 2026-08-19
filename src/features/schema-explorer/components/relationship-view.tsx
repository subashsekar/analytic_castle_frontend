"use client";

import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { metadataErrorMessage } from "@/features/schema-explorer/errors";
import {
  qualifyName,
  relationshipTypeLabel,
} from "@/features/schema-explorer/labels";
import type { MetadataRelationship } from "@/features/schema-explorer/types";

export function RelationshipView({
  relationships,
  tableId,
  loading,
  error,
  hasNextPage,
  fetchingNextPage,
  onLoadMore,
}: {
  relationships: MetadataRelationship[];
  tableId: string;
  loading: boolean;
  error: unknown;
  hasNextPage: boolean;
  fetchingNextPage: boolean;
  onLoadMore: () => void;
}) {
  const related = relationships.filter(
    (relationship) =>
      relationship.source_table_id === tableId ||
      relationship.target_table_id === tableId,
  );
  const groups = groupByConstraint(related);

  if (loading && relationships.length === 0) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-12 w-full" />
        <Spinner label="Loading relationships" />
      </div>
    );
  }

  if (error) {
    return <Alert>{metadataErrorMessage(error)}</Alert>;
  }

  if (related.length === 0) {
    return (
      <p className="py-8 text-center text-[13.5px] font-semibold text-text-1">
        No relationships found.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <ul className="space-y-4" aria-label="Relationships">
        {groups.map((group) => (
          <li key={group.key} className="rounded-sm border border-border p-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge>
                {relationshipTypeLabel(group.items[0]?.relationship_type ?? "")}
              </Badge>
              {group.items[0]?.source_table_id === tableId ? (
                <Badge tone="processing">Outgoing</Badge>
              ) : (
                <Badge>Incoming</Badge>
              )}
            </div>
            {group.constraintName ? (
              <p className="mt-2 text-[12px] font-semibold text-text-2">
                Constraint {group.constraintName}
              </p>
            ) : null}
            <ul className="mt-2 space-y-1.5">
              {group.items.map((relationship) => (
                <li
                  key={relationship.id}
                  className="font-mono text-[13px] text-text-1"
                >
                  {qualifyName(
                    relationship.source_schema_name,
                    relationship.source_table_name,
                    relationship.source_column_name,
                  )}
                  <span className="mx-2 text-text-3" aria-hidden>
                    →
                  </span>
                  <span className="sr-only">references</span>
                  {qualifyName(
                    relationship.target_schema_name,
                    relationship.target_table_name,
                    relationship.target_column_name,
                  )}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
      {hasNextPage ? (
        <Button
          variant="outline"
          size="sm"
          onClick={onLoadMore}
          loading={fetchingNextPage}
          disabled={fetchingNextPage}
        >
          {fetchingNextPage ? "Loading…" : "Load more"}
        </Button>
      ) : null}
    </div>
  );
}

function groupByConstraint(items: MetadataRelationship[]): Array<{
  key: string;
  constraintName: string | null;
  items: MetadataRelationship[];
}> {
  const groups = new Map<
    string,
    { constraintName: string | null; items: MetadataRelationship[] }
  >();

  for (const item of items) {
    const key = item.constraint_name || item.id;
    const existing = groups.get(key);
    if (existing) {
      existing.items.push(item);
    } else {
      groups.set(key, {
        constraintName: item.constraint_name,
        items: [item],
      });
    }
  }

  return [...groups.entries()].map(([key, group]) => ({ key, ...group }));
}
