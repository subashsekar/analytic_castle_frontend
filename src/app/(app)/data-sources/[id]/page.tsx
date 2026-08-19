import { Suspense } from "react";
import { DataSourceDetailsPage } from "@/features/data-sources/components/data-source-details";
import { PageSpinner } from "@/components/ui/spinner";

export default function DataSourceDetailRoute() {
  return (
    <Suspense fallback={<PageSpinner label="Loading data source" />}>
      <DataSourceDetailsPage />
    </Suspense>
  );
}
