/**
 * Public API base URL for the AnalyticCastle FastAPI backend.
 * Prefer NEXT_PUBLIC_API_BASE_URL; NEXT_PUBLIC_API_URL is kept for compatibility.
 */
export function getApiBaseUrl(): string | undefined {
  return (
    process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_API_URL?.trim() ||
    undefined
  );
}
