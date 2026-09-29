"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createOrganization,
  createWorkspace,
  getWorkspace,
  listOrganizations,
  listWorkspaces,
  updateWorkspace,
} from "@/features/workspace/api";
import { setWorkspaceId } from "@/lib/auth/session";
import { queryKeys } from "@/lib/query/query-keys";
import type { MeResponse } from "@/types/api";
import type { Workspace } from "@/types/common";

export function useWorkspaces(organizationId: string | null, enabled = true) {
  return useQuery({
    queryKey: [...queryKeys.workspaces, organizationId],
    queryFn: () => listWorkspaces(organizationId as string),
    enabled: enabled && Boolean(organizationId),
  });
}

export function useWorkspace(workspaceId: string | null) {
  return useQuery({
    queryKey: queryKeys.workspace(workspaceId ?? ""),
    queryFn: () => getWorkspace(workspaceId as string),
    enabled: Boolean(workspaceId),
  });
}

export function useCreateWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      me,
    }: {
      name: string;
      me: MeResponse | null;
    }) => {
      const organizationId =
        me?.organization?.id ?? me?.organizations[0]?.id ?? null;

      if (!organizationId) {
        const organization = await createOrganization({ name });
        const workspaces = await listWorkspaces(organization.id);
        if (workspaces[0]) {
          return workspaces[0];
        }
        throw new Error(
          "Organization was created without a default workspace.",
        );
      }

      return createWorkspace({
        organization_id: organizationId,
        name,
      });
    },
    onSuccess: async (workspace) => {
      setWorkspaceId(workspace.id);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.me }),
        queryClient.invalidateQueries({ queryKey: queryKeys.workspaces }),
      ]);
    },
  });
}

export function useUpdateWorkspace(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => updateWorkspace(workspaceId, { name }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.me }),
        queryClient.invalidateQueries({ queryKey: queryKeys.workspaces }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.workspace(workspaceId),
        }),
      ]);
    },
  });
}

export function useSwitchWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ workspace }: { workspace: Workspace }) => {
      setWorkspaceId(workspace.id);
      return workspace;
    },
    onSuccess: async (workspace) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.me }),
        queryClient.invalidateQueries({ queryKey: queryKeys.workspaces }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.workspace(workspace.id),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.workspaceMembers(workspace.id),
        }),
        queryClient.invalidateQueries({ queryKey: ["data-sources"] }),
        queryClient.removeQueries({ queryKey: ["metadata"] }),
      ]);
    },
  });
}

export function useOrganizations(enabled = true) {
  return useQuery({
    queryKey: queryKeys.organizations,
    queryFn: listOrganizations,
    enabled,
  });
}

export function useCreateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => createOrganization({ name }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.me }),
        queryClient.invalidateQueries({ queryKey: queryKeys.organizations }),
        queryClient.invalidateQueries({ queryKey: queryKeys.workspaces }),
      ]);
    },
  });
}
