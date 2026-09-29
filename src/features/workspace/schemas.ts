import { required } from "@/lib/utils/validation";

export function workspaceNameErrors(values: { name: string }) {
  return { name: required(values.name, "Workspace name") };
}

export function organizationNameErrors(values: { name: string }) {
  return { name: required(values.name, "Organization name") };
}
