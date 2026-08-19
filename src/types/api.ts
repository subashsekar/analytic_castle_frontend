import type {
  Organization,
  Permission,
  User,
  Workspace,
  WorkspaceRole,
} from "@/types/common";

export type TokenEnvelope = {
  access_token: string;
  refresh_token: string;
  expires_in?: number;
  token_type?: string;
};

export type AuthResponse = TokenEnvelope & {
  user?: User;
  organization?: Organization | null;
  workspace?: Workspace | null;
};

export type MeResponse = {
  user: User;
  organization: Organization | null;
  workspace: Workspace | null;
  organizations: Organization[];
  workspaces: Workspace[];
  workspace_role: WorkspaceRole | null;
  permissions: Permission[];
};

export type Paginated<T> = {
  items: T[];
  page?: number;
  page_size?: number;
  total?: number;
};
