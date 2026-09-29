export const queryKeys = {
  me: ["auth", "me"] as const,
  health: ["health"] as const,
  organizations: ["organizations"] as const,
  workspaces: ["workspaces"] as const,
  workspace: (id: string) => ["workspaces", id] as const,
  workspaceMembers: (id: string) => ["workspaces", id, "members"] as const,
  dataSources: (workspaceId: string) => ["data-sources", workspaceId] as const,
  dataSource: (id: string) => ["data-sources", "detail", id] as const,
  catalogAvailability: (workspaceId: string, dataSourceId: string) =>
    ["metadata", workspaceId, dataSourceId, "catalog-availability"] as const,
  metadata: (dataSourceId: string) => ["metadata", dataSourceId] as const,
  schemas: (dataSourceId: string) =>
    ["metadata", dataSourceId, "schemas"] as const,
  schema: (dataSourceId: string, schemaId: string) =>
    ["metadata", dataSourceId, "schemas", schemaId] as const,
  tables: (
    dataSourceId: string,
    schemaId: string,
    search: string,
    tableType: string | null = null,
  ) =>
    ["metadata", dataSourceId, "tables", schemaId, search, tableType] as const,
  table: (dataSourceId: string, tableId: string) =>
    ["metadata", dataSourceId, "tables", "detail", tableId] as const,
  columns: (dataSourceId: string, tableId: string) =>
    ["metadata", dataSourceId, "columns", tableId] as const,
  relationships: (dataSourceId: string) =>
    ["metadata", dataSourceId, "relationships"] as const,
  sampleData: (dataSourceId: string, tableId: string) =>
    ["metadata", dataSourceId, "sample", tableId] as const,
  syncStatus: (dataSourceId: string) =>
    ["metadata", dataSourceId, "sync-status"] as const,
  metadataSearch: (
    dataSourceId: string,
    query: string,
    metadataType: string | null,
  ) => ["metadata", dataSourceId, "search", query, metadataType] as const,
  conversations: (workspaceId: string) =>
    ["conversations", workspaceId] as const,
  conversation: (workspaceId: string, conversationId: string) =>
    ["conversations", workspaceId, conversationId] as const,
  conversationMessages: (workspaceId: string, conversationId: string) =>
    ["conversations", workspaceId, conversationId, "messages"] as const,
  queryHistory: (workspaceId: string, options?: Record<string, unknown>) =>
    ["workspaces", workspaceId, "query-history", options] as const,
  queryHistoryDetail: (workspaceId: string, historyId: string) =>
    ["workspaces", workspaceId, "query-history", "detail", historyId] as const,
};
