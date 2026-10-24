import { CanonicalTask, DataHygieneReport } from '../types/canonical';
import { RAW_INGESTION_DATASET_WITH_PLANTED_ERRORS } from '../data/benchmarkTasks';

// Computes a deterministic pseudo-hash for duplicate detection
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16);
}

export function analyzeDatasetQuality(tasks: CanonicalTask[]): DataHygieneReport {
  const issues: DataHygieneReport['issues'] = [];
  const seenPrompts = new Set<string>();
  let duplicateCount = 0;
  let missingFieldErrors = 0;
  let schemaErrors = 0;
  const acceptedRecords: CanonicalTask[] = [];

  tasks.forEach((task, idx) => {
    const line = idx + 1;
    let isCorrupt = false;

    // Check 1: Missing Required Fields
    if (!task.task_id || !task.input?.prompt?.trim()) {
      issues.push({
        line,
        taskId: task.task_id || `line_${line}`,
        issue: 'Missing mandatory prompt or task_id',
        severity: 'error'
      });
      missingFieldErrors++;
      isCorrupt = true;
    }

    if (!task.reference?.answer?.trim()) {
      issues.push({
        line,
        taskId: task.task_id || `line_${line}`,
        issue: 'Missing verified reference answer',
        severity: 'error'
      });
      missingFieldErrors++;
      isCorrupt = true;
    }

    // Check 2: Exact Duplicate Detection
    const promptNorm = (task.input?.prompt || '').trim().toLowerCase();
    if (promptNorm) {
      if (seenPrompts.has(promptNorm)) {
        issues.push({
          line,
          taskId: task.task_id,
          issue: `Exact duplicate prompt detected: matches prior record`,
          severity: 'error'
        });
        duplicateCount++;
        isCorrupt = true;
      } else {
        seenPrompts.add(promptNorm);
      }
    }

    // Check 3: Rubric Schema & Weight Sanity
    if (task.rubric?.criteria?.length) {
      let weightSum = 0;
      for (const crit of task.rubric.criteria) {
        if (crit.weight <= 0) {
          issues.push({
            line,
            taskId: task.task_id,
            issue: `Invalid criterion weight (${crit.weight}) in '${crit.name}'. Weights must be positive`,
            severity: 'error'
          });
          schemaErrors++;
          isCorrupt = true;
        }
        weightSum += crit.weight;
      }
      if (Math.abs(weightSum - 100) > 1 && !isCorrupt) {
        issues.push({
          line,
          taskId: task.task_id,
          issue: `Criteria weights sum to ${weightSum}% (expected 100%)`,
          severity: 'warning'
        });
      }
    } else {
      issues.push({
        line,
        taskId: task.task_id,
        issue: 'No rubric criteria defined for task',
        severity: 'warning'
      });
    }

    if (!isCorrupt) {
      acceptedRecords.push(task);
    }
  });

  const totalRecords = tasks.length;
  const rejectedRecords = totalRecords - acceptedRecords.length;
  const qualityScore = totalRecords > 0 ? Math.round((acceptedRecords.length / totalRecords) * 100) : 0;
  const fingerprintHash = hashString(JSON.stringify(tasks.map(t => t.task_id)));

  return {
    totalRecords,
    acceptedRecords: acceptedRecords.length,
    rejectedRecords,
    duplicateCount,
    missingFieldErrors,
    schemaErrors,
    qualityScore,
    fingerprintHash,
    records: acceptedRecords,
    issues
  };
}

export function parseJSONLString(content: string): CanonicalTask[] {
  const lines = content.split('\n');
  const tasks: CanonicalTask[] = [];
  lines.forEach((line) => {
    const trimmed = line.trim();
    if (trimmed) {
      try {
        const parsed = JSON.parse(trimmed);
        tasks.push(parsed);
      } catch (e) {
        // malformed line
        tasks.push({
          task_id: `err_malformed_${Math.random().toString(36).substring(7)}`,
          task_type: 'qa',
          input: { prompt: '' },
          reference: { answer: '' },
          rubric: { criteria: [] },
          metadata: { domain: 'Biomedical & QA', difficulty: 'easy', language: 'en' },
          intended_use: ['evaluation'],
          review_status: 'draft',
          is_planted_error: true,
          error_type: 'malformed_schema'
        });
      }
    }
  });
  return tasks;
}

export function getSampleDatasetWithPlantedErrors(): CanonicalTask[] {
  return RAW_INGESTION_DATASET_WITH_PLANTED_ERRORS;
}
