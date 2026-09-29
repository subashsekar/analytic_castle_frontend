/** FastAPI versioned API prefix. */
export const API_V1 = "/api/v1";

export const healthPaths = {
  root: `/`,
  live: `/health/live`,
  ready: `/health/ready`,
  health: `/health`,
} as const;

export const authPaths = {
  register: `${API_V1}/auth/register`,
  login: `${API_V1}/auth/login`,
  me: `${API_V1}/auth/me`,
  refresh: `${API_V1}/auth/refresh`,
  logout: `${API_V1}/auth/logout`,
  verifyEmail: `${API_V1}/auth/verify-email`,
  resendVerification: `${API_V1}/auth/resend-verification`,
  /** Alias of resend-verification documented in OpenAPI. */
  sendVerificationEmail: `${API_V1}/auth/verify-email/send`,
  forgotPassword: `${API_V1}/auth/forgot-password`,
  resetPassword: `${API_V1}/auth/reset-password`,
  changePassword: `${API_V1}/auth/change-password`,
} as const;

export const aiPaths = {
  chat: `${API_V1}/ai/chat`,
  nestedChat: (workspaceId: string) => `${API_V1}/workspaces/${workspaceId}/ai/chat`,
  nestedValidate: (workspaceId: string) => `${API_V1}/workspaces/${workspaceId}/ai/validate`,
  nestedExecute: (workspaceId: string) => `${API_V1}/workspaces/${workspaceId}/ai/execute`,
  nestedCorrect: (workspaceId: string) => `${API_V1}/workspaces/${workspaceId}/ai/correct`,
} as const;

export const conversationPaths = {
  root: (workspaceId: string) =>
    `${API_V1}/workspaces/${workspaceId}/conversations`,
  byId: (workspaceId: string, conversationId: string) =>
    `${API_V1}/workspaces/${workspaceId}/conversations/${conversationId}`,
  messages: (workspaceId: string, conversationId: string) =>
    `${API_V1}/workspaces/${workspaceId}/conversations/${conversationId}/messages`,
} as const;

export const organizationPaths = {
  root: `${API_V1}/organizations`,
  byId: (organizationId: string) => `${API_V1}/organizations/${organizationId}`,
} as const;

export const workspacePaths = {
  root: `${API_V1}/workspaces`,
  byId: (workspaceId: string) => `${API_V1}/workspaces/${workspaceId}`,
  members: (workspaceId: string) =>
    `${API_V1}/workspaces/${workspaceId}/members`,
  member: (workspaceId: string, userId: string) =>
    `${API_V1}/workspaces/${workspaceId}/members/${userId}`,
} as const;

export const dataSourcePaths = {
  root: `${API_V1}/data-sources`,
  byId: (dataSourceId: string) => `${API_V1}/data-sources/${dataSourceId}`,
  testConnection: (dataSourceId: string) =>
    `${API_V1}/data-sources/${dataSourceId}/test-connection`,
  // Nested Phase 7 paths
  nestedRoot: (workspaceId: string) =>
    `${API_V1}/workspaces/${workspaceId}/data-sources`,
  nestedTestConnection: (workspaceId: string, dataSourceId: string) =>
    `${API_V1}/workspaces/${workspaceId}/data-sources/${dataSourceId}/test-connection`,
} as const;

export const metadataPaths = {
  schemas: (dataSourceId: string) =>
    `${API_V1}/data-sources/${dataSourceId}/schemas`,
  schema: (dataSourceId: string, schemaId: string) =>
    `${API_V1}/data-sources/${dataSourceId}/schemas/${schemaId}`,
  tables: (dataSourceId: string) =>
    `${API_V1}/data-sources/${dataSourceId}/tables`,
  table: (dataSourceId: string, tableId: string) =>
    `${API_V1}/data-sources/${dataSourceId}/tables/${tableId}`,
  columns: (dataSourceId: string, tableId: string) =>
    `${API_V1}/data-sources/${dataSourceId}/tables/${tableId}/columns`,
  relationships: (dataSourceId: string) =>
    `${API_V1}/data-sources/${dataSourceId}/relationships`,
  search: (dataSourceId: string) =>
    `${API_V1}/data-sources/${dataSourceId}/metadata/search`,
  sync: (dataSourceId: string) =>
    `${API_V1}/data-sources/${dataSourceId}/metadata/sync`,
  syncStatus: (dataSourceId: string) =>
    `${API_V1}/data-sources/${dataSourceId}/metadata/sync-status`,
  sample: (dataSourceId: string, tableId: string) =>
    `${API_V1}/data-sources/${dataSourceId}/tables/${tableId}/sample`,
  // Nested Phase 7 paths
  nestedSync: (workspaceId: string, dataSourceId: string) =>
    `${API_V1}/workspaces/${workspaceId}/metadata/${dataSourceId}/sync`,
  nestedSyncStatus: (workspaceId: string, dataSourceId: string) =>
    `${API_V1}/workspaces/${workspaceId}/metadata/${dataSourceId}/sync-status`,
} as const;

export const queryHistoryPaths = {
  root: (workspaceId: string) =>
    `${API_V1}/workspaces/${workspaceId}/query-history`,
  byDataSource: (workspaceId: string, dataSourceId: string) =>
    `${API_V1}/workspaces/${workspaceId}/query-history/data-sources/${dataSourceId}`,
  byId: (workspaceId: string, historyId: string) =>
    `${API_V1}/workspaces/${workspaceId}/query-history/${historyId}`,
} as const;

