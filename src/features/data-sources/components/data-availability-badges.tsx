"use client";

import { Badge } from "@/components/ui/badge";
import type {
  DataAvailability,
  DataHealth,
} from "@/features/data-sources/product-status";
import {
  dataAvailabilityLabel,
  dataAvailabilityTone,
  dataHealthLabel,
  dataHealthTone,
} from "@/features/data-sources/product-status";

export function DataAvailabilityBadge({
  availability,
}: {
  availability: DataAvailability;
}) {
  return <Badge tone={dataAvailabilityTone(availability)}>{dataAvailabilityLabel(availability)}</Badge>;
}

export function DataHealthBadge({ health }: { health: DataHealth }) {
  return <Badge tone={dataHealthTone(health)}>{dataHealthLabel(health)}</Badge>;
}

