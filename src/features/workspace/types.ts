import type { Organization } from "@/types/common";

export type CreateWorkspaceRequest = {
  organization_id: string;
  name: string;
};

export type UpdateWorkspaceRequest = {
  name?: string;
};

export type CreateOrganizationRequest = {
  name: string;
};

export type UpdateOrganizationRequest = {
  name?: string;
};

export type CreateOrganizationResponse = Organization;
