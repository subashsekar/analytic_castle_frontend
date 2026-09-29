"use client";

import { useState } from "react";
import { useQueryHistory } from "@/features/ai/hooks/use-query-history";
import { SqlViewer } from "@/features/ai/components/sql-viewer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { Alert } from "@/components/ui/alert";
import { Clock, Calendar, CheckCircle2, XCircle, AlertTriangle, RefreshCw, ChevronLeft, ChevronRight, CornerDownRight } from "lucide-react";
import type { QueryHistorySummary } from "@/features/ai/types";

type QueryHistoryProps = {
  workspaceId: string | null;
  dataSourceId: string | null;
};

export function QueryHistory({ workspaceId, dataSourceId }: QueryHistoryProps) {
  const [page, setPage] = useState(1);
  const [selectedQuery, setSelectedQuery] = useState<QueryHistorySummary | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");

  const { data, isLoading, isError, refetch } = useQueryHistory(workspaceId, {
    page,
    pageSize: 10,
    ...(statusFilter ? { status: statusFilter } : {}),
    ...(dataSourceId ? { dataSourceId } : {}),
  });

  const handleSelectQuery = (query: QueryHistorySummary) => {
    setSelectedQuery(query);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SUCCEEDED":
        return <Badge tone="ready">Succeeded</Badge>;
      case "FAILED":
        return <Badge tone="failed">Failed</Badge>;
      case "REJECTED":
        return <Badge tone="neutral">Rejected</Badge>;
      case "CORRECTED":
        return <Badge tone="processing">Corrected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "SUCCEEDED":
        return <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />;
      case "FAILED":
        return <XCircle size={16} className="text-rose-500 shrink-0" />;
      case "REJECTED":
        return <AlertTriangle size={16} className="text-amber-500 shrink-0" />;
      case "CORRECTED":
        return <RefreshCw size={16} className="text-blue-500 shrink-0" />;
      default:
        return null;
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString() + " " + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return isoString;
    }
  };

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / 10);

  return (
    <div className="flex flex-col h-full">
      {/* Filters bar */}
      <div className="flex items-center justify-between gap-2 px-4 py-2 border-b border-border bg-sunken/10">
        <span className="text-[12px] font-semibold text-text-3 uppercase tracking-wider">Query Logs</span>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="ac-focus-ring bg-surface border border-border rounded-[4px] px-2 py-0.5 text-[11px] font-medium text-text-2 cursor-pointer"
        >
          <option value="">All Statuses</option>
          <option value="SUCCEEDED">Succeeded</option>
          <option value="FAILED">Failed</option>
          <option value="REJECTED">Rejected</option>
          <option value="CORRECTED">Corrected</option>
        </select>
      </div>

      {/* Query logs list */}
      <div className="flex-1 overflow-y-auto divide-y divide-border">
        {isLoading ? (
          <div className="p-8 flex flex-col items-center justify-center">
            <Spinner label="Loading query history" />
          </div>
        ) : isError ? (
          <div className="p-4">
            <Alert tone="error">We couldn&apos;t load query history.</Alert>
            <Button size="sm" onClick={() => void refetch()} className="mt-2 w-full">Retry</Button>
          </div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-text-3 text-[13px]">
            No queries logged yet in this workspace.
          </div>
        ) : (
          items.map((query) => (
            <div
              key={query.id}
              onClick={() => handleSelectQuery(query)}
              className="p-3 text-[12.5px] hover:bg-sunken/45 cursor-pointer flex flex-col gap-1.5 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-mono text-text-1 font-medium overflow-hidden text-ellipsis whitespace-nowrap">
                  {query.generated_sql.trim().split("\n")[0]}
                </span>
                {getStatusIcon(query.status)}
              </div>
              <div className="flex items-center justify-between text-text-3 font-mono text-[11px]">
                <span>{query.duration_ms >= 1000 ? `${(query.duration_ms / 1000).toFixed(1)}s` : `${Math.round(query.duration_ms)}ms`}</span>
                <span>{formatTime(query.created_at)}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && !isLoading && !isError && (
        <div className="flex items-center justify-between px-3 py-2 border-t border-border bg-sunken/10 text-[11.5px] text-text-2 shrink-0">
          <span>{total} total queries</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="ac-focus-ring size-5 flex items-center justify-center rounded hover:bg-sunken disabled:opacity-40 disabled:hover:bg-transparent"
            >
              <ChevronLeft size={13} />
            </button>
            <span className="font-semibold">{page} / {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="ac-focus-ring size-5 flex items-center justify-center rounded hover:bg-sunken disabled:opacity-40 disabled:hover:bg-transparent"
            >
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      )}

      {/* Query Detail Modal Dialog */}
      {selectedQuery && (
        <Dialog
          open={Boolean(selectedQuery)}
          onClose={() => setSelectedQuery(null)}
          title="Query Details"
          actions={
            <Button variant="outline" size="sm" onClick={() => setSelectedQuery(null)}>
              Close
            </Button>
          }
        >
          <div className="space-y-4 text-[13px] text-text-1">
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 border-b border-border pb-4 text-text-2">
              <div className="flex items-center gap-2">
                <CornerDownRight size={14} className="text-text-3" />
                <span className="font-semibold">Execution Status:</span>
              </div>
              <div>{getStatusBadge(selectedQuery.status)}</div>

              <div className="flex items-center gap-2">
                <Clock size={14} className="text-text-3" />
                <span className="font-semibold">Duration:</span>
              </div>
              <div className="font-mono">
                {selectedQuery.duration_ms >= 1000 
                  ? `${(selectedQuery.duration_ms / 1000).toFixed(2)}s` 
                  : `${selectedQuery.duration_ms}ms`}
              </div>

              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-text-3" />
                <span className="font-semibold">Timestamp:</span>
              </div>
              <div className="font-mono text-text-2">{formatTime(selectedQuery.created_at)}</div>
            </div>

            <div className="space-y-1">
              <span className="font-semibold text-text-2">SQL Statement:</span>
              <SqlViewer sql={selectedQuery.generated_sql} />
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
