/** Types aligned with AnalyticCastle Phase 6–8 AI, conversation, SQL, and analysis APIs. */

/** Client timeout for POST /ai/chat (intent + SQL + Phase 8 can take 60–120s). */
export const AI_CHAT_TIMEOUT_MS = 180_000;

export const AI_MAX_MESSAGE_CHARS = 4000;

export type ConversationStatus = "ACTIVE" | "COMPLETED" | "FAILED";

export type Conversation = {
  conversation_id: string;
  user_id: string;
  workspace_id: string;
  organization_id: string;
  data_source_id: string | null;
  status: ConversationStatus | string;
  message_count: number;
  char_count: number;
  conversation_version: number;
  /** Agent-state version for PATCH complete (optimistic concurrency). */
  agent_version: number;
  started_at: string;
  updated_at: string;
  error_message: string | null;
};

export type ConversationMessage = {
  role: "system" | "user" | "assistant" | string;
  content: string;
  message_id: string;
};

export type ConversationListResponse = {
  items: Conversation[];
  page: number;
  page_size: number;
  total: number;
};

export type ConversationMessageListResponse = {
  items: ConversationMessage[];
  page: number;
  page_size: number;
  total: number;
};

export type CreateConversationRequest = {
  data_source_id?: string | null;
  initial_message?: string | null;
};

export type UpdateConversationRequest = {
  status?: ConversationStatus;
  expected_agent_version: number;
};

export type AppendConversationMessageRequest = {
  content: string;
  expected_context_version: number;
  trim_if_needed?: boolean;
  /** Public API accepts user messages only. */
  role?: "user";
};

export type AIChatRequest = {
  message: string;
  data_source_id: string;
  conversation_id?: string | null;
  conversation_version?: number | null;
};

export type AIUsage = {
  input_tokens: number | null;
  output_tokens: number | null;
  total_tokens: number | null;
};

export type AIMetric = {
  name: string;
  aggregation: string;
};

export type AIDimension = {
  name: string;
};

export type AIFilter = {
  field: string;
  operator: string;
  value: string | number | boolean | null;
  values: Array<string | number | boolean> | null;
  start: string | number | boolean | null;
  end: string | number | boolean | null;
};

export type AITimeRange = {
  preset: string;
  start_date: string | null;
  end_date: string | null;
};

export type AISort = {
  field: string;
  direction: string;
};

export type AIIntent = {
  type: string;
  operation: string | null;
  subject: string | null;
  metrics: AIMetric[];
  dimensions: AIDimension[];
  filters: AIFilter[];
  time_range: AITimeRange | null;
  sort: AISort | null;
  requested_limit: number | null;
  safe_limit: number | null;
  exceeds_limit: boolean;
  requires_data_access: boolean;
  requires_metadata: boolean;
  confidence: string;
  requires_clarification: boolean;
  clarification_question: string | null;
};

export type AIPlan = {
  requires_clarification: boolean;
  clarification_question: string | null;
  operations: string[];
  required_capabilities: string[];
  requires_metadata: boolean;
  requires_database: boolean;
  requires_sample_data: boolean;
  requires_aggregation: boolean;
  requires_time_filter: boolean;
  requires_relationships: boolean;
  unsupported: boolean;
};

export type MetadataTableCandidate = {
  table_id: string;
  schema_name: string;
  table_name: string;
  match_reason: string;
  relevance_score: number;
};

export type MetadataColumnCandidate = {
  column_id: string;
  table_id: string;
  schema_name: string;
  table_name: string;
  column_name: string;
  data_type: string;
  is_primary_key: boolean;
  match_reason: string;
  relevance_score: number;
};

export type MetadataRelationshipCandidate = {
  relationship_id: string;
  source_schema: string;
  source_table: string;
  source_column: string;
  target_schema: string;
  target_table: string;
  target_column: string;
  relationship_type: string;
  constraint_name: string | null;
};

export type ResolvedMetadataContext = {
  data_source_id: string;
  tables: MetadataTableCandidate[];
  columns: MetadataColumnCandidate[];
  relationships: MetadataRelationshipCandidate[];
  unresolved_concepts: string[];
  requires_clarification: boolean;
  clarification_question: string | null;
};

export type GeneratedSQL = {
  sql: string;
  dialect: string;
  referenced_tables: string[];
  referenced_columns: string[];
  confidence: string;
  suggested_limit: number;
};

/** Phase 8 confidence levels from backend AnalysisConfidence. */
export type AnalysisConfidence = "HIGH" | "MEDIUM" | "LOW";

export type InsightPriority = "HIGH" | "MEDIUM" | "LOW";

export type RecommendationLevel = "HIGH" | "MEDIUM" | "LOW";

export type TrendDirection =
  | "INCREASING"
  | "DECREASING"
  | "STABLE"
  | "VOLATILE"
  | "INSUFFICIENT_DATA";

export type AnomalyType =
  | "STATISTICAL_OUTLIER"
  | "UNEXPECTED_CHANGE"
  | "THRESHOLD_BREACH";

export type AnomalySeverity = "HIGH" | "MEDIUM" | "LOW";

/** Backend DataAnalysisResult — structured data analyst output. */
export type DataAnalysisResult = {
  interpretation: string;
  summary: string;
  comparisons: string;
  conclusions: string[];
  confidence_score: AnalysisConfidence;
  confidence_reasoning: string;
};

export type KeyMetric = {
  column: string;
  value_count: number;
  total: number;
  average: number;
  minimum: number;
  maximum: number;
};

export type BusinessInsight = {
  rank: number;
  title: string;
  insight: string;
  metric: string | null;
  business_impact: string;
  supporting_evidence: string;
  priority: InsightPriority;
  confidence_score: AnalysisConfidence;
  confidence_reasoning: string;
};

/** Backend InsightAnalysisResult. */
export type InsightAnalysisResult = {
  summary: string;
  top_insight: string | null;
  insights: BusinessInsight[];
  key_metrics: KeyMetric[];
  data_gaps: string[];
  confidence_score: AnalysisConfidence;
  confidence_reasoning: string;
  notes: string[];
};

export type PeriodComparison = {
  previous_period: string;
  period: string;
  previous_value: number;
  value: number;
  absolute_change: number;
  percent_change: number | null;
  direction: TrendDirection;
  significant: boolean;
};

export type TrendSeries = {
  period_column: string | null;
  value_column: string | null;
  point_count: number;
  skipped_row_count: number;
  reordered: boolean;
  first_period: string | null;
  last_period: string | null;
  first_value: number | null;
  last_value: number | null;
  minimum_value: number | null;
  maximum_value: number | null;
  direction: TrendDirection;
  total_change: number | null;
  growth_rate_percent: number | null;
  average_period_change_percent: number | null;
  direction_changes: number;
  comparisons: PeriodComparison[];
  significant_changes: PeriodComparison[];
  notes: string[];
};

/** Backend TrendAnalysisResult. */
export type TrendAnalysisResult = {
  direction: TrendDirection;
  growth_rate_percent: number | null;
  series: TrendSeries;
  summary: string;
  direction_explanation: string;
  period_comparisons: string;
  significant_changes: string;
  conclusions: string[];
  confidence_score: AnalysisConfidence;
  confidence_reasoning: string;
};

export type Anomaly = {
  column: string;
  anomaly_type: AnomalyType;
  severity: AnomalySeverity;
  method: string;
  value: number;
  row_index: number | null;
  period: string | null;
  previous_value: number | null;
  percent_change: number | null;
  expected_low: number | null;
  expected_high: number | null;
  score: number | null;
  evidence: string;
};

export type AnomalyScan = {
  analyzed: boolean;
  numeric_columns: string[];
  scanned_row_count: number;
  period_column: string | null;
  column_statistics: Record<string, Record<string, number>>;
  anomalies: Anomaly[];
  notes: string[];
};

/** Backend AnomalyAnalysisResult. */
export type AnomalyAnalysisResult = {
  anomaly_count: number;
  highest_severity: AnomalySeverity | null;
  scan: AnomalyScan;
  summary: string;
  outliers: string;
  unexpected_changes: string;
  threshold_breaches: string;
  conclusions: string[];
  confidence_score: AnalysisConfidence;
  confidence_reasoning: string;
};

export type RootCauseEvidence = {
  question: string;
  sql: string | null;
  executed: boolean;
  columns: string[];
  rows: unknown[][];
  row_count: number;
  truncated: boolean;
  note: string | null;
};

export type RootCauseHypothesis = {
  rank: number;
  statement: string;
  contributing_factors: string[];
  supporting_evidence: string;
  contradicting_evidence: string | null;
  confidence_score: AnalysisConfidence;
  confidence_reasoning: string;
  investigation_question: string | null;
};

/** Backend RootCauseAnalysisResult. */
export type RootCauseAnalysisResult = {
  summary: string;
  primary_cause: string | null;
  hypotheses: RootCauseHypothesis[];
  evidence: RootCauseEvidence[];
  additional_queries_run: number;
  confidence_score: AnalysisConfidence;
  confidence_reasoning: string;
  notes: string[];
};

export type RecommendationItem = {
  rank: number;
  title: string;
  recommendation: string;
  evidence_reference: string;
  supporting_evidence: string;
  expected_outcome: string;
  assumptions: string[];
  risks: string[];
  impact: RecommendationLevel;
  feasibility: RecommendationLevel;
  priority: RecommendationLevel;
  confidence_score: AnalysisConfidence;
  confidence_reasoning: string;
};

/** Backend RecommendationResult. */
export type RecommendationResult = {
  summary: string;
  top_recommendation: string | null;
  recommendations: RecommendationItem[];
  data_gaps: string[];
  confidence_score: AnalysisConfidence;
  confidence_reasoning: string;
  notes: string[];
};

/**
 * Optional Phase 8 payload on AI chat responses.
 * Preferred namespace: `analysis` on AIChatResponse (see normalizePhase8Analysis).
 * Agent field names match the target HTTP contract.
 */
export type EvaluatedAgent =
  | "DATA_ANALYST"
  | "TREND_ANALYSIS"
  | "ANOMALY_DETECTION"
  | "ROOT_CAUSE_ANALYSIS"
  | "INSIGHT"
  | "RECOMMENDATION";

export type EvaluationDimension =
  | "STRUCTURE"
  | "COMPLETENESS"
  | "ACCURACY"
  | "GROUNDING"
  | "CALIBRATION"
  | "HALLUCINATION";

export type EvaluationMethod = "VERIFIED" | "ESTIMATED";

export type CheckStatus = "PASS" | "FAIL" | "WARN" | "SKIPPED";

export type EvaluationCheck = {
  agent: EvaluatedAgent;
  check_id: string;
  dimension: EvaluationDimension;
  status: CheckStatus;
  method: EvaluationMethod;
  detail: string;
  evidence_reference: string | null;
};

export type AgentEvaluation = {
  agent: EvaluatedAgent;
  checks: EvaluationCheck[];
  verified_passed: number;
  verified_failed: number;
  estimated_passed: number;
  estimated_warnings: number;
  skipped: number;
  verified_correct: boolean;
  estimated_quality_score: number;
};

export type EvaluationMetrics = {
  agents_evaluated: number;
  checks_run: number;
  verified_checks: number;
  verified_failures: number;
  estimated_checks: number;
  estimated_warnings: number;
  skipped_checks: number;
  verified_pass_rate: number;
  estimated_quality_score: number;
  query_duration_ms: number | null;
};

/** Backend EvaluationReport — optional / quality-check facing. */
export type EvaluationReport = {
  session_id: string | null;
  generated_at: string | null;
  agents: AgentEvaluation[];
  agents_not_evaluated: EvaluatedAgent[];
  metrics: EvaluationMetrics;
  verified_correct: boolean;
  notes: string[];
};

/** Alias used in some docs — same as AnomalyAnalysisResult. */
export type AnomalyDetectionResult = AnomalyAnalysisResult;

/**
 * Nested Phase 8 analysis object attached to chat once the backend wires agents.
 * Render only sections that are present; agents may be skipped independently.
 */
export type AIQueryPreview = {
  columns: string[];
  row_count: number;
  truncated: boolean;
  sample_rows: unknown[][];
};

export type Phase8Analysis = {
  session_id?: string | null;
  data_analyst?: DataAnalysisResult | null;
  trend?: TrendAnalysisResult | null;
  anomaly?: AnomalyAnalysisResult | null;
  root_cause?: RootCauseAnalysisResult | null;
  insight?: InsightAnalysisResult | null;
  recommendation?: RecommendationResult | null;
  evaluation?: EvaluationReport | null;
  /** Backend restatement of the user question. */
  question_understood?: string | null;
  /** Resolved analysis window when present. */
  date_range?: string | null;
  /** Measured findings — preferred primary answer body. */
  facts?: string[];
  /** Explicit assumptions used for the answer. */
  assumptions?: string[];
  /** Secondary notes (not the main answer). */
  notes?: string[];
  /** Optional chart guidance from the backend. */
  chart_hint?: string | null;
  /** Read-only SQL from the analysis pipeline when present. */
  sql?: string | null;
  /** Small sample of executed result rows (not full customer result sets). */
  query_preview?: AIQueryPreview | null;
};

/** @deprecated Prefer Phase8Analysis — kept for transitional imports. */
export type AnalysisReportPayload = Phase8Analysis;

export type AIChatResponse = {
  request_id: string;
  response: string;
  model: string;
  usage: AIUsage | null;
  intent: AIIntent;
  plan: AIPlan;
  metadata_context: ResolvedMetadataContext;
  conversation_id: string | null;
  conversation_version: number | null;
  generated?: GeneratedSQL | null;
  /**
   * Phase 8 structured analysis — feature-gated.
   * Absent on current production chat until backend attaches the pipeline.
   */
  analysis?: Phase8Analysis | null;
};

/** Transient UI turn while a request is in flight or failed before persistence. */
export type ChatTurn = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  response?: AIChatResponse;
  error?: string;
  pending?: boolean;
};

export type QueryHistoryStatus = "SUCCEEDED" | "FAILED" | "REJECTED" | "CORRECTED";

export type QueryHistorySummary = {
  id: string;
  data_source_id: string | null;
  generated_sql: string;
  status: QueryHistoryStatus;
  duration_ms: number;
  created_at: string;
};

export type QueryHistoryListResponse = {
  items: QueryHistorySummary[];
  total: number;
  page: number;
  page_size: number;
};

export type QueryHistoryRead = {
  id: string;
  user_id: string;
  workspace_id: string;
  organization_id: string;
  data_source_id: string | null;
  generated_sql: string;
  validated_sql: string | null;
  corrected_sql: string | null;
  status: QueryHistoryStatus;
  duration_ms: number;
  result_metadata: Record<string, unknown> | null;
  error_metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

export type SqlValidationRequest = {
  sql: string;
  data_source_id: string;
};

export type SqlValidationErrorDetail = {
  line?: number;
  column?: number;
  message: string;
};

export type SqlValidationResponse = {
  is_valid: boolean;
  sql: string;
  violations: string[];
  errors?: SqlValidationErrorDetail[];
};

export type SqlExecutionRequest = {
  sql: string;
  data_source_id: string;
  limit?: number;
  metadata?: Record<string, unknown> | null;
};

export type SqlExecutionResponse = {
  success: boolean;
  rows: Record<string, unknown>[];
  columns: string[];
  duration_ms: number;
  truncated: boolean;
  applied_limit?: number;
  error_message?: string | null;
  error_code?: string | null;
  statement_count?: number;
};

export type SqlCorrectionRequest = {
  sql: string;
  data_source_id: string;
  error_message: string;
  error_code?: string | null;
  violations?: string[];
};

export type SqlCorrectionResponse = {
  success: boolean;
  corrected_sql: string;
  explanation?: string;
};

