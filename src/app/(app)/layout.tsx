import { AppShell } from "@/components/layout/app-shell";
import {
  ProtectedGate,
  WorkspaceGate,
} from "@/features/auth/components/auth-guards";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedGate>
      <WorkspaceGate>
        <AppShell>{children}</AppShell>
      </WorkspaceGate>
    </ProtectedGate>
  );
}
