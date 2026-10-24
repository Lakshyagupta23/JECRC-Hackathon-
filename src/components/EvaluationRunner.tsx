import React, { useState } from 'react';
import {
  PlayCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Cpu,
  Binary,
  Sparkles,
  ShieldAlert,
  RotateCcw,
  Zap
} from 'lucide-react';
import { CanonicalTask, TaskEvaluationResult, EvaluationRun } from '../types/canonical';

interface EvaluationRunnerProps {
  tasks: CanonicalTask[];
  run: EvaluationRun;
  onExecuteRun: () => void;
  isRunning: boolean;
}

export const EvaluationRunner: React.FC<EvaluationRunnerProps> = ({
  tasks,
  run,
  onExecuteRun,
  isRunning,
}) => {
  const [selectedTaskId, setSelectedTaskId] = useState<string>(tasks[0]?.task_id || '');

  const activeTask = tasks.find((t) => t.task_id === selectedTaskId) || tasks[0];
  const resultA = activeTask ? run.results_a[activeTask.task_id] : null;
  const resultB = activeTask ? run.results_b[activeTask.task_id] : null;
  const isCompleted = run.status === 'completed';

  // Compute aggregate score for the progress bar header
  const allResultsA = Object.values(run.results_a);
  const avgA = allResultsA.length
    ? Math.round(allResultsA.reduce((s, r) => s + (r.override_score ?? r.task_score), 0) / allResultsA.length)
    : 0;
  const allResultsB = Object.values(run.results_b);
  const avgB = allResultsB.length
    ? Math.round(allResultsB.reduce((s, r) => s + (r.override_score ?? r.task_score), 0) / allResultsB.length)
    : 0;

  return (
    <div className="space-y-5 animate-fade-up">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <PlayCircle size={15} strokeWidth={2} style={{ color: 'var(--accent-text)' }} />
            <span className="section-label">Stage 3</span>
          </div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--txt-primary)' }}>
            Side-by-Side Hybrid Evaluation Runner
          </h1>
          <p style={{ fontSize: '12px', color: 'var(--txt-secondary)', marginTop: '4px' }}>
            Deterministic validators run first; LLM judges score semantic clarity. Shows model delta on 20 tasks.
          </p>
        </div>
        <button
          onClick={onExecuteRun}
          disabled={isRunning}
          className={`btn btn-lg flex-shrink-0 ${isRunning ? 'btn-secondary' : 'btn-primary'}`}
          id="run-evaluation-btn"
        >
          {isRunning ? (
            <>
              <span className="animate-spin-slow" style={{ width: '14px', height: '14px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', display: 'inline-block' }} />
              Running... {run.progress}%
            </>
          ) : (
            <>
              {isCompleted ? <RotateCcw size={14} strokeWidth={2} /> : <Zap size={14} strokeWidth={2} />}
              {isCompleted ? 'Re-run Evaluation' : 'Run Hybrid Evaluation'}
            </>
          )}
        </button>
      </div>

      {/* Progress / model summary bar */}
      {run.progress > 0 && (
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--txt-primary)' }}>
                Evaluation run
              </span>
              <span className={`badge ${isCompleted ? 'badge-green' : 'badge-accent'}`}
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                {run.status}
              </span>
            </div>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--txt-tertiary)' }}>
              {Math.round((run.progress / 100) * tasks.length)} / {tasks.length} tasks
            </span>
          </div>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${run.progress}%`, background: isCompleted ? 'var(--green)' : 'var(--accent)' }}
            />
          </div>
        </div>
      )}

      {/* Model comparison strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Model A */}
        <div className="card p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              style={{
                width: '36px', height: '36px', borderRadius: 'var(--radius-md)',
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-default)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '14px',
                color: 'var(--txt-secondary)',
              }}
            >
              A
            </div>
            <div>
              <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--txt-primary)', letterSpacing: '-0.01em' }}>
                Baseline-8B
              </p>
              <p style={{ fontSize: '11px', color: 'var(--txt-tertiary)' }}>Pre-trained open foundation</p>
            </div>
          </div>
          {isCompleted && (
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '10.5px', color: 'var(--txt-tertiary)' }}>Avg. Score</p>
              <span
                className="tabnum"
                style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--amber)', fontFamily: 'var(--font-mono)' }}
              >
                {avgA}%
              </span>
            </div>
          )}
        </div>

        {/* Model B */}
        <div
          className="card p-4 flex items-center justify-between"
          style={{ borderColor: isCompleted ? 'rgba(34,197,94,0.2)' : 'var(--border-default)' }}
        >
          <div className="flex items-center gap-3">
            <div
              style={{
                width: '36px', height: '36px', borderRadius: 'var(--radius-md)',
                background: 'var(--accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '14px',
                color: '#fff',
              }}
            >
              B
            </div>
            <div>
              <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--txt-primary)', letterSpacing: '-0.01em' }}>
                Expert-Aligned 70B
              </p>
              <p style={{ fontSize: '11px', color: 'var(--txt-tertiary)' }}>Post-RLHF aligned specialist</p>
            </div>
          </div>
          {isCompleted && (
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '10.5px', color: 'var(--txt-tertiary)' }}>Avg. Score</p>
              <span
                className="tabnum"
                style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--green)', fontFamily: 'var(--font-mono)' }}
              >
                {avgB}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main comparison layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Task picker */}
        <div className="lg:col-span-4">
          <p className="section-label mb-2">Select task to inspect</p>
          <div className="space-y-1" style={{ maxHeight: '660px', overflowY: 'auto', paddingRight: '2px' }}>
            {tasks.map((task) => {
              const isSelected = task.task_id === activeTask?.task_id;
              const rA = run.results_a[task.task_id];
              const rB = run.results_b[task.task_id];
              return (
                <div
                  key={task.task_id}
                  onClick={() => setSelectedTaskId(task.task_id)}
                  style={{
                    padding: '9px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: `1px solid ${isSelected ? 'var(--border-accent)' : 'var(--border-dim)'}`,
                    background: isSelected ? 'var(--bg-raised)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'border-color 120ms, background 120ms',
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10.5px', fontWeight: 700, color: 'var(--accent-text)' }}>
                      {task.task_id}
                    </span>
                    <div className="flex items-center gap-1">
                      {rA && (
                        <span style={{
                          fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: 700,
                          padding: '1px 5px', borderRadius: '4px',
                          background: rA.passed ? 'var(--green-muted)' : 'var(--red-muted)',
                          color: rA.passed ? 'var(--green)' : 'var(--red)',
                        }}>
                          A:{rA.override_score ?? rA.task_score}
                        </span>
                      )}
                      {rB && (
                        <span style={{
                          fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: 700,
                          padding: '1px 5px', borderRadius: '4px',
                          background: rB.passed ? 'var(--green-muted)' : 'var(--red-muted)',
                          color: rB.passed ? 'var(--green)' : 'var(--red)',
                        }}>
                          B:{rB.override_score ?? rB.task_score}
                        </span>
                      )}
                    </div>
                  </div>
                  <p style={{ fontSize: '11.5px', color: 'var(--txt-secondary)', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {task.input.prompt}
                  </p>
                  <p style={{ fontSize: '10px', color: 'var(--txt-tertiary)', marginTop: '3px' }}>{task.metadata.domain}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: details */}
        <div className="lg:col-span-8 space-y-4">
          {activeTask ? (
            <>
              {/* Task context card */}
              <div className="card p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, color: 'var(--accent-text)' }}>
                    {activeTask.task_id}
                  </span>
                  <span className="chip">{activeTask.metadata.domain}</span>
                </div>
                <p style={{ fontSize: '12.5px', color: 'var(--txt-secondary)', lineHeight: 1.5 }}>
                  {activeTask.input.prompt}
                </p>
                <div style={{ paddingTop: '8px', borderTop: '1px solid var(--border-dim)' }}>
                  <p style={{ fontSize: '11px', color: 'var(--txt-tertiary)', marginBottom: '3px' }}>Ground truth reference:</p>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#86efac', lineHeight: 1.5 }}>
                    {activeTask.reference.answer.substring(0, 160)}...
                  </p>
                </div>
              </div>

              {/* Side-by-side outputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Model A */}
                <ModelOutputCard
                  label="Model A"
                  modelName="Baseline-8B"
                  result={resultA}
                  dotColor="var(--amber)"
                />
                {/* Model B */}
                <ModelOutputCard
                  label="Model B"
                  modelName="Expert-70B"
                  result={resultB}
                  dotColor="var(--green)"
                />
              </div>

              {/* Criterion breakdown */}
              {resultA && resultB && (
                <div className="card p-5 space-y-3">
                  <div className="flex items-center justify-between pb-3" style={{ borderBottom: '1px solid var(--border-dim)' }}>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--txt-primary)' }}>Hybrid Grader Breakdown</p>
                    <span style={{ fontSize: '11px', color: 'var(--txt-tertiary)' }}>Deterministic · LLM Judge</span>
                  </div>

                  <div className="space-y-2">
                    {resultA.criterion_scores.map((critA, idx) => {
                      const critB = resultB.criterion_scores[idx];
                      const isDeterministic = critA.grader_type.startsWith('deterministic');
                      return (
                        <div
                          key={critA.criterion_id}
                          style={{
                            padding: '10px 12px',
                            borderRadius: 'var(--radius-md)',
                            background: 'var(--bg-canvas)',
                            border: '1px solid var(--border-dim)',
                          }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--txt-primary)' }}>{critA.name}</span>
                              {isDeterministic ? (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '10px', fontWeight: 600, color: 'var(--accent-text)', background: 'var(--accent-muted)', borderRadius: '4px', padding: '2px 6px' }}>
                                  <Binary size={10} strokeWidth={2} />Det.
                                </span>
                              ) : (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '10px', fontWeight: 600, color: 'var(--txt-secondary)', background: 'var(--bg-subtle)', borderRadius: '4px', padding: '2px 6px' }}>
                                  <Sparkles size={10} strokeWidth={2} />LLM
                                </span>
                              )}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700 }}>
                              <span style={{ color: critA.pass ? 'var(--green)' : 'var(--red)' }}>A: {critA.score}%</span>
                              <span style={{ color: 'var(--border-default)', fontSize: '10px' }}>|</span>
                              <span style={{ color: critB?.pass ? 'var(--green)' : 'var(--red)' }}>B: {critB?.score}%</span>
                            </div>
                          </div>
                          <div
                            className="grid grid-cols-2 gap-2"
                            style={{
                              padding: '8px', borderRadius: 'var(--radius-sm)',
                              background: 'var(--bg-surface)',
                              border: '1px solid var(--border-dim)',
                              fontFamily: 'var(--font-mono)', fontSize: '10.5px',
                            }}
                          >
                            <div>
                              <p style={{ color: 'var(--txt-tertiary)', marginBottom: '2px' }}>Model A:</p>
                              <p style={{ color: critA.pass ? 'var(--txt-secondary)' : 'var(--red)', lineHeight: 1.4 }}>{critA.evidence}</p>
                            </div>
                            <div>
                              <p style={{ color: 'var(--txt-tertiary)', marginBottom: '2px' }}>Model B:</p>
                              <p style={{ color: critB?.pass ? 'var(--txt-secondary)' : 'var(--red)', lineHeight: 1.4 }}>{critB?.evidence}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="card" style={{ padding: '80px 20px', textAlign: 'center', color: 'var(--txt-tertiary)' }}>
              <PlayCircle size={32} strokeWidth={1.5} style={{ margin: '0 auto 10px', opacity: 0.3 }} />
              <p style={{ fontSize: '13px' }}>Select a task to view evaluation results</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Sub-component ──────────────────────────────────────
interface ModelOutputCardProps {
  label: string;
  modelName: string;
  result: TaskEvaluationResult | null;
  dotColor: string;
}

const ModelOutputCard: React.FC<ModelOutputCardProps> = ({ label, modelName, result, dotColor }) => (
  <div className="card p-4 space-y-3">
    <div className="flex items-center justify-between pb-3" style={{ borderBottom: '1px solid var(--border-dim)' }}>
      <div className="flex items-center gap-2">
        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: dotColor, flexShrink: 0, display: 'inline-block' }} />
        <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--txt-primary)' }}>{label}: {modelName}</span>
      </div>
      {result ? (
        <span
          style={{
            fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700, padding: '3px 8px', borderRadius: 'var(--radius-sm)',
            background: result.passed ? 'var(--green-muted)' : 'var(--red-muted)',
            color: result.passed ? 'var(--green)' : 'var(--red)',
          }}
        >
          {result.override_score ?? result.task_score}%
        </span>
      ) : (
        <span style={{ fontSize: '11px', color: 'var(--txt-tertiary)' }}>Awaiting run</span>
      )}
    </div>

    {result?.critical_failure && (
      <div
        style={{
          display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '8px 10px',
          background: 'var(--red-muted)', border: '1px solid rgba(239,68,68,0.18)',
          borderRadius: 'var(--radius-sm)', fontSize: '11.5px', color: 'var(--red)',
        }}
      >
        <ShieldAlert size={13} strokeWidth={2} style={{ flexShrink: 0, marginTop: '1px' }} />
        {result.failure_reason}
      </div>
    )}

    <div>
      <p className="section-label mb-2">Generated Response</p>
      <div
        className="code-block"
        style={{ minHeight: '120px', maxHeight: '200px', overflowY: 'auto', userSelect: 'text' }}
      >
        {result ? result.output : 'Run evaluation to inspect generated model output.'}
      </div>
    </div>

    {result && (
      <div
        style={{
          display: 'flex', justifyContent: 'space-between',
          fontFamily: 'var(--font-mono)', fontSize: '10.5px', color: 'var(--txt-tertiary)',
        }}
      >
        <span>{result.latency_ms}ms</span>
        <span>{result.tokens_used} tokens</span>
        <span>{result.confidence * 100}% conf.</span>
      </div>
    )}
  </div>
);
