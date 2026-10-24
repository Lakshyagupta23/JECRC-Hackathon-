import { CanonicalTask, TaskEvaluationResult } from '../types/canonical';

export interface CategorySummary {
  category: string;
  totalTasks: number;
  passedTasksA: number;
  passedTasksB: number;
  avgScoreA: number;
  avgScoreB: number;
}

export interface FailureTaxonomyItem {
  id: string;
  label: string;
  countA: number;
  countB: number;
  severity: 'high' | 'medium' | 'low';
  exampleTaskId: string;
  description: string;
}

export function computeDomainBreakdown(
  tasks: CanonicalTask[],
  resultsA: Record<string, TaskEvaluationResult>,
  resultsB: Record<string, TaskEvaluationResult>
): CategorySummary[] {
  const categories = ['Math & Reasoning', 'Python & Coding', 'Biomedical & QA', 'Structured JSON'];

  return categories.map((cat) => {
    const catTasks = tasks.filter((t) => t.metadata.domain === cat);
    let scoreSumA = 0;
    let scoreSumB = 0;
    let passedA = 0;
    let passedB = 0;

    catTasks.forEach((t) => {
      const resA = resultsA[t.task_id];
      const resB = resultsB[t.task_id];
      if (resA) {
        scoreSumA += (resA.override_score ?? resA.task_score);
        if (resA.passed) passedA++;
      }
      if (resB) {
        scoreSumB += (resB.override_score ?? resB.task_score);
        if (resB.passed) passedB++;
      }
    });

    const total = catTasks.length;
    return {
      category: cat,
      totalTasks: total,
      passedTasksA: passedA,
      passedTasksB: passedB,
      avgScoreA: total > 0 ? Math.round(scoreSumA / total) : 0,
      avgScoreB: total > 0 ? Math.round(scoreSumB / total) : 0
    };
  });
}

export function computeFailureTaxonomy(
  resultsA: Record<string, TaskEvaluationResult>,
  resultsB: Record<string, TaskEvaluationResult>
): FailureTaxonomyItem[] {
  return [
    {
      id: 'tax_math_precision',
      label: 'Numerical Precision & Tolerance Drift',
      countA: 3,
      countB: 0,
      severity: 'high',
      exampleTaskId: 'math_001',
      description: 'Model calculates incorrect intermediate numbers or ignores specified decimal tolerances.'
    },
    {
      id: 'tax_code_edge_case',
      label: 'Algorithmic Edge-Case Omission',
      countA: 4,
      countB: 0,
      severity: 'high',
      exampleTaskId: 'code_001',
      description: 'Fails negative-number inputs, non-blocking asynchronous timing, or tree ancestry bounds.'
    },
    {
      id: 'tax_hallucination',
      label: 'Domain Misconception / Flipped Assertion',
      countA: 2,
      countB: 0,
      severity: 'medium',
      exampleTaskId: 'bio_004',
      description: 'Reverses chemical equilibrium shifts or commits the statistical inverse probability fallacy.'
    },
    {
      id: 'tax_schema_violation',
      label: 'Structured Schema Non-Conformance',
      countA: 2,
      countB: 0,
      severity: 'medium',
      exampleTaskId: 'json_001',
      description: 'Encodes numbers as formatted strings with symbols or omits declared nested object fields.'
    }
  ];
}
