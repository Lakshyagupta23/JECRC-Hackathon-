import React from 'react';
import {
  BarChart3,
  CheckCircle2,
  TrendingUp,
  Info,
  AlertTriangle
} from 'lucide-react';
import { CanonicalTask, TaskEvaluationResult } from '../types/canonical';
import { computeDomainBreakdown, computeFailureTaxonomy } from '../services/failureAnalysis';

interface FailureAnalysisProps {
  tasks: CanonicalTask[];
  resultsA: Record<string, TaskEvaluationResult>;
  resultsB: Record<string, TaskEvaluationResult>;
}

export const FailureAnalysis: React.FC<FailureAnalysisProps> = ({ tasks, resultsA, resultsB }) => {
  const domainSummaries = computeDomainBreakdown(tasks, resultsA, resultsB);
  const taxonomyItems = computeFailureTaxonomy(resultsA, resultsB);

  const totalTasks = tasks.length;
  let totalScoreA = 0, totalScoreB = 0, passedA = 0, passedB = 0;
  tasks.forEach((t) => {
    const rA = resultsA[t.task_id], rB = resultsB[t.task_id];
    if (rA) { totalScoreA += (rA.override_score ?? rA.task_score); if (rA.passed) passedA++; }
    if (rB) { totalScoreB += (rB.override_score ?? rB.task_score); if (rB.passed) passedB++; }
  });
  const avgA = totalTasks > 0 ? Math.round(totalScoreA / totalTasks) : 0;
  const avgB = totalTasks > 0 ? Math.round(totalScoreB / totalTasks) : 0;
  const delta = avgB - avgA;

  return (
    <div className="space-y-5 animate-fade-up">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 size={15} strokeWidth={2} style={{ color: 'var(--accent-text)' }} />
            <span className="section-label">Stage 4</span>
          </div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--txt-primary)' }}>
            Failure Analysis & Root-Cause Taxonomy
          </h1>
          <p style={{ fontSize: '12px', color: 'var(--txt-secondary)', marginTop: '4px' }}>
            Isolates recurring failure patterns and verifies performance across domains.
          </p>
        </div>
        <div
          className="flex items-center gap-2 px-3 flex-shrink-0"
          style={{
            height: '34px',
            background: 'var(--bg-raised)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            fontSize: '12px',
            color: 'var(--txt-secondary)',
          }}
        >
          <span>Sample size:</span>
          <span style={{ fontWeight: 600, color: 'var(--accent-text)' }}>{totalTasks} tasks</span>
        </div>
      </div>

      {/* Callout */}
      <div
        style={{
          display: 'flex', gap: '12px', alignItems: 'flex-start',
          padding: '14px 16px',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--accent-muted)',
          border: '1px solid rgba(99,102,241,0.20)',
        }}
      >
        <Info size={15} strokeWidth={2} style={{ color: 'var(--accent-text)', flexShrink: 0, marginTop: '1px' }} />
        <div>
          <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--txt-primary)', marginBottom: '3px' }}>
            Key invariant: Low model score != poor training data
          </p>
          <p style={{ fontSize: '12px', color: 'var(--txt-secondary)', lineHeight: 1.5 }}>
            Tasks where Model A failed but have a verified reference answer are the most valuable SFT/DPO candidates. Model performance here is a signal, not a filter.
          </p>
        </div>
      </div>

      {/* Score summary row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Model A */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="section-label">Model A - Baseline-8B</span>
            <span className="badge badge-amber" style={{ fontFamily: 'var(--font-mono)' }}>
              {passedA}/{totalTasks} passed
            </span>
          </div>
          <div className="flex items-baseline gap-1.5 mb-3">
            <span className="tabnum" style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--amber)', fontFamily: 'var(--font-mono)' }}>
              {avgA}
            </span>
            <span style={{ fontSize: '13px', color: 'var(--txt-secondary)' }}>%</span>
          </div>
          <div className="score-bar">
            <div className="score-fill mid" style={{ width: `${avgA}%` }} />
          </div>
        </div>

        {/* Model B */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="section-label">Model B - Expert-70B</span>
            <span className="badge badge-green" style={{ fontFamily: 'var(--font-mono)' }}>
              {passedB}/{totalTasks} passed
            </span>
          </div>
          <div className="flex items-baseline gap-1.5 mb-3">
            <span className="tabnum" style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--green)', fontFamily: 'var(--font-mono)' }}>
              {avgB}
            </span>
            <span style={{ fontSize: '13px', color: 'var(--txt-secondary)' }}>%</span>
          </div>
          <div className="score-bar">
            <div className="score-fill high" style={{ width: `${avgB}%` }} />
          </div>
        </div>

        {/* Delta */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="section-label">Observed Delta (B vs A)</span>
            <TrendingUp size={14} strokeWidth={2} style={{ color: 'var(--green)' }} />
          </div>
          <div className="flex items-baseline gap-1.5 mb-1">
            <span className="tabnum" style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--accent-text)', fontFamily: 'var(--font-mono)' }}>
              +{delta}
            </span>
            <span style={{ fontSize: '13px', color: 'var(--txt-secondary)' }}>%</span>
          </div>
          <p style={{ fontSize: '11px', color: 'var(--txt-tertiary)' }}>
            Eliminates all critical failures & tolerance deviations
          </p>
        </div>
      </div>

      {/* Domain breakdown */}
      <div className="card p-5">
        <div className="flex items-center justify-between pb-4" style={{ borderBottom: '1px solid var(--border-dim)' }}>
          <div>
            <h3 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--txt-primary)' }}>Domain-Level Performance Breakdown</h3>
            <p style={{ fontSize: '11px', color: 'var(--txt-tertiary)', marginTop: '2px' }}>5 tasks per domain</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
          {domainSummaries.map((ds) => (
            <div
              key={ds.category}
              style={{
                padding: '14px', borderRadius: 'var(--radius-md)',
                background: 'var(--bg-canvas)',
                border: '1px solid var(--border-dim)',
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--txt-primary)' }}>{ds.category}</span>
                <span style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--txt-tertiary)' }}>
                  {ds.totalTasks} tasks
                </span>
              </div>

              {/* Model A bar */}
              <div className="space-y-1 mb-3">
                <div className="flex items-center justify-between" style={{ fontSize: '11px' }}>
                  <span style={{ color: 'var(--txt-tertiary)' }}>Model A</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--amber)' }}>{ds.avgScoreA}%</span>
                </div>
                <div className="score-bar">
                  <div className="score-fill mid" style={{ width: `${ds.avgScoreA}%` }} />
                </div>
              </div>

              {/* Model B bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between" style={{ fontSize: '11px' }}>
                  <span style={{ color: 'var(--txt-tertiary)' }}>Model B</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--green)' }}>{ds.avgScoreB}%</span>
                </div>
                <div className="score-bar">
                  <div className="score-fill high" style={{ width: `${ds.avgScoreB}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Failure taxonomy */}
      <div className="card p-5">
        <div className="flex items-center justify-between pb-4" style={{ borderBottom: '1px solid var(--border-dim)' }}>
          <div>
            <h3 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--txt-primary)' }}>Failure Root-Cause Taxonomy</h3>
            <p style={{ fontSize: '11px', color: 'var(--txt-tertiary)', marginTop: '2px' }}>
              Systematic categorization detected by deterministic validators and LLM judges.
            </p>
          </div>
          <span className="badge badge-red">{taxonomyItems.length} failure modes</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
          {taxonomyItems.map((item) => (
            <div
              key={item.id}
              style={{
                padding: '14px', borderRadius: 'var(--radius-md)',
                background: 'var(--bg-canvas)',
                border: '1px solid var(--border-dim)',
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--txt-primary)' }}>{item.label}</span>
                <span className={`badge ${item.severity === 'high' ? 'badge-red' : 'badge-amber'}`}>
                  {item.severity}
                </span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--txt-secondary)', lineHeight: 1.5, marginBottom: '10px' }}>
                {item.description}
              </p>
              <div
                className="flex items-center justify-between"
                style={{ paddingTop: '8px', borderTop: '1px solid var(--border-dim)', fontFamily: 'var(--font-mono)', fontSize: '10.5px' }}
              >
                <span>
                  <span style={{ color: 'var(--txt-tertiary)' }}>A failures: </span>
                  <span style={{ color: 'var(--red)', fontWeight: 700 }}>{item.countA}</span>
                </span>
                <span>
                  <span style={{ color: 'var(--txt-tertiary)' }}>B failures: </span>
                  <span style={{ color: 'var(--green)', fontWeight: 700 }}>{item.countB}</span>
                </span>
                <span style={{ color: 'var(--txt-tertiary)' }}>e.g. {item.exampleTaskId}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
