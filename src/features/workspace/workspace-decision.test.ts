import { describe, expect, it } from "vitest";
import { decideWorkspace } from "@/features/workspace/workspace-decision";

const alpha = { id: "a", name: "Alpha" };
const beta = { id: "b", name: "Beta" };

describe("decideWorkspace", () => {
  it("asks the user to create when none exist", () => {
    expect(decideWorkspace([], null)).toEqual({ action: "create" });
  });

  it("selects a single workspace automatically", () => {
    expect(decideWorkspace([alpha], null)).toEqual({
      action: "use",
      workspace: alpha,
    });
  });

  it("restores a persisted workspace", () => {
    expect(decideWorkspace([alpha, beta], "b")).toEqual({
      action: "use",
      workspace: beta,
    });
  });

  it("asks the user to choose when several exist", () => {
    expect(decideWorkspace([alpha, beta], null)).toEqual({
      action: "choose",
      workspaces: [alpha, beta],
    });
  });
});
