import { Suspense } from "react";
import { DataSourceList } from "@/features/data-sources/components/data-source-list";
import { PageSpinner } from "@/components/ui/spinner";

export default function DataSourcesPage() {
  return (
    <Suspense fallback={<PageSpinner label="Loading data sources" />}>
      <DataSourceList />
    </Suspense>
  );
}
