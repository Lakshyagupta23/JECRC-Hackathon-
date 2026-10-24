export type TaskType = 'math' | 'code' | 'qa' | 'extraction';

export type ScoringType =
  | 'deterministic_exact'
  | 'deterministic_tolerance'
  | 'deterministic_regex'
  | 'llm_judge';

export interface RubricCriterion {
  criterion_id: string;
  name: string;
  description: string;
  weight: number; // typically sums to 100 per task
  scoring_type: ScoringType;
  tolerance?: number; // for numeric tolerance checks
  regex_pattern?: string; // for deterministic regex checks
  is_critical?: boolean; // if true and fails, overall task score is 0
}

export interface TaskRubric {
  criteria: RubricCriterion[];
}

export interface TaskMetadata {
  domain: 'Math & Reasoning' | 'Python & Coding' | 'Biomedical & QA' | 'Structured JSON';
  difficulty: 'easy' | 'medium' | 'hard';
  language: string;
  tags?: string[];
  provenance?: string;
}

export interface CanonicalTask {
  task_id: string;
  task_type: TaskType;
  input: {
    prompt: string;
    context?: string;
  };
  reference: {
    answer: string;
    acceptable_alternatives?: string[];
    numeric_value?: number;
    unit?: string;
  };
  rubric: TaskRubric;
  metadata: TaskMetadata;
  intended_use: ('evaluation' | 'sft' | 'dpo' | 'regression')[];
  review_status: 'draft' | 'approved' | 'rejected' | 'flagged';
  is_planted_error?: boolean;
  error_type?: 'duplicate' | 'missing_field' | 'malformed_schema';
}

export interface DataHygieneReport {
  totalRecords: number;
  acceptedRecords: number;
  rejectedRecords: number;
  duplicateCount: number;
  missingFieldErrors: number;
  schemaErrors: number;
  qualityScore: number; // 0 to 100%
  fingerprintHash: string;
  records: CanonicalTask[];
  issues: {
    line: number;
    taskId: string;
    issue: string;
    severity: 'error' | 'warning';
  }[];
}

export interface CriterionScore {
  criterion_id: string;
  name: string;
  score: number; // 0 to 100
  pass: boolean;
  grader_type: ScoringType;
  evidence: string;
}

export interface TaskEvaluationResult {
  task_id: string;
  model_id: string;
  model_name: string;
  task_score: number;
  passed: boolean;
  critical_failure: boolean;
  failure_reason?: string;
  criterion_scores: CriterionScore[];
  output: string;
  latency_ms: number;
  tokens_used: number;
  confidence: number;
  is_simulated: boolean;
  adjudicated?: boolean;
  adjudication_note?: string;
  reviewer_id?: string;
  override_score?: number;
}

export interface EvaluationRun {
  run_id: string;
  status: 'idle' | 'queued' | 'running' | 'completed' | 'completed_with_errors';
  progress: number; // 0 to 100
  current_task_index: number;
  total_tasks: number;
  model_a: {
    id: string;
    name: string;
    version: string;
    badge: string;
  };
  model_b: {
    id: string;
    name: string;
    version: string;
    badge: string;
  };
  results_a: Record<string, TaskEvaluationResult>;
  results_b: Record<string, TaskEvaluationResult>;
  started_at?: string;
  completed_at?: string;
}

export interface SFTRecord {
  messages: [
    { role: 'user'; content: string },
    { role: 'assistant'; content: string }
  ];
  metadata: {
    task_id: string;
    domain: string;
    dataset_version: string;
  };
}

export interface DPORecord {
  prompt: string;
  chosen: string;
  rejected: string;
  rationale: string;
  task_id: string;
  metadata: {
    model_rejected: string;
    rejected_score: number;
    dataset_version: string;
  };
}

export interface ExportManifest {
  manifest_version: string;
  export_id: string;
  timestamp: string;
  dataset_version: string;
  sft_records_count: number;
  dpo_pairs_count: number;
  quality_checks_passed: boolean;
  provenance_sha256: string;
  training_suitability: 'verified_eligible';
}
