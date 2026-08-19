import { Suspense } from "react";
import { DataSourceExplorerPage } from "@/features/schema-explorer/components/data-source-explorer";
import { PageSpinner } from "@/components/ui/spinner";

export default function DataSourceExplorerRoute() {
  return (
    <Suspense fallback={<PageSpinner label="Loading data source" />}>
      <DataSourceExplorerPage />
    </Suspense>
  );
}
