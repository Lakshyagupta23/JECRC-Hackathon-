import React, { useState } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  Edit3,
  Save,
  History,
  Sparkles,
  UserCheck
} from 'lucide-react';
import { CanonicalTask, TaskEvaluationResult } from '../types/canonical';

interface AdjudicationQueueProps {
  tasks: CanonicalTask[];
  resultsA: Record<string, TaskEvaluationResult>;
  onOverrideScore: (taskId: string, modelId: string, newScore: number, note: string) => void;
}

interface AuditEntry {
  taskId: string;
  timestamp: string;
  reviewerId: string;
  previousScore: number;
  newScore: number;
  note: string;
}

export const AdjudicationQueue: React.FC<AdjudicationQueueProps> = ({
  tasks,
  resultsA,
  onOverrideScore
}) => {
  const queuedTasks = tasks.filter((t) => {
    const res = resultsA[t.task_id];
    return res && (res.confidence < 0.75 || res.critical_failure || res.adjudicated);
  });

  const [selectedTaskId, setSelectedTaskId] = useState<string>(queuedTasks[0]?.task_id || '');
  const [overrideScoreInput, setOverrideScoreInput] = useState<number>(85);
  const [reviewerNote, setReviewerNote] = useState<string>(
    'Accepting partial credit: formula steps were logically sound despite decimal rounding difference.'
  );
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([
    {
      taskId: 'math_001',
      timestamp: '2026-10-24 01:15 UTC',
      reviewerId: 'lead_evaluator_01',
      previousScore: 40,
      newScore: 75,
      note: 'Kinematics formula derived correctly; tolerated 2.5m calculation offset as acceptable approximation.',
    },
  ]);

  const activeTask = tasks.find((t) => t.task_id === selectedTaskId) || queuedTasks[0];
  const activeResult = activeTask ? resultsA[activeTask.task_id] : null;

  const handleApplyOverride = () => {
    if (!activeTask || !activeResult) return;
    onOverrideScore(activeTask.task_id, activeResult.model_id, overrideScoreInput, reviewerNote);
    setAuditLog((prev) => [
      {
        taskId: activeTask.task_id,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
        reviewerId: 'lead_evaluator_01',
        previousScore: activeResult.task_score,
        newScore: overrideScoreInput,
        note: reviewerNote,
      },
      ...prev,
    ]);
  };

  return (
    <div className="space-y-5 animate-fade-up">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert size={15} strokeWidth={2} style={{ color: 'var(--accent-text)' }} />
            <span className="section-label">Stage 5</span>
          </div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--txt-primary)' }}>
            Human Review & Adjudication Queue
          </h1>
          <p style={{ fontSize: '12px', color: 'var(--txt-secondary)', marginTop: '4px' }}>
            Resolve disputed criteria, override miscalibrated judges, and record an immutable audit trail.
          </p>
        </div>
        <div
          className="flex items-center gap-2 px-3 flex-shrink-0"
          style={{
            height: '34px',
            background: 'var(--amber-muted)',
            border: '1px solid rgba(245,158,11,0.18)',
            borderRadius: 'var(--radius-md)',
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--amber)',
          }}
        >
          {queuedTasks.length} tasks queued for review
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Queue */}
        <div className="lg:col-span-4">
          <p className="section-label mb-2">Items requiring human decision</p>
          <div className="space-y-1.5" style={{ maxHeight: '580px', overflowY: 'auto', paddingRight: '2px' }}>
            {queuedTasks.map((t) => {
              const isSelected = t.task_id === activeTask?.task_id;
              const res = resultsA[t.task_id];
              return (
                <div
                  key={t.task_id}
                  onClick={() => {
                    setSelectedTaskId(t.task_id);
                    if (res?.override_score !== undefined) setOverrideScoreInput(res.override_score);
                  }}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: `1px solid ${isSelected ? 'var(--border-accent)' : 'var(--border-dim)'}`,
                    background: isSelected ? 'var(--bg-raised)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'border-color 120ms, background 120ms',
                  }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, color: 'var(--accent-text)' }}>
                      {t.task_id}
                    </span>
                    {res?.adjudicated ? (
                      <span className="badge badge-green" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px' }}>
                        {res.override_score}%
                      </span>
                    ) : (
                      <span className="badge badge-amber" style={{ fontSize: '10px' }}>
                        Needs review
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--txt-secondary)', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {t.input.prompt}
                  </p>
                  <div
                    className="flex items-center justify-between"
                    style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--border-dim)', fontSize: '10.5px' }}
                  >
                    <span style={{ color: 'var(--txt-tertiary)' }}>{t.metadata.domain}</span>
                    <span style={{ color: 'var(--amber)', fontFamily: 'var(--font-mono)' }}>
                      conf: {((res?.confidence || 0) * 100)}%
                    </span>
                  </div>
                </div>
              );
            })}
            {queuedTasks.length === 0 && (
              <div style={{ padding: '48px 0', textAlign: 'center' }}>
                <CheckCircle2 size={32} strokeWidth={1.5} style={{ color: 'var(--green)', margin: '0 auto 8px', opacity: 0.6 }} />
                <p style={{ fontSize: '13px', color: 'var(--txt-secondary)' }}>No items queued</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Adjudication workspace */}
        <div className="lg:col-span-8">
          {activeTask && activeResult ? (
            <div className="card p-6 space-y-5">
              {/* Header */}
              <div className="flex items-center justify-between pb-4" style={{ borderBottom: '1px solid var(--border-dim)' }}>
                <div className="flex items-center gap-2">
                  <UserCheck size={14} strokeWidth={2} style={{ color: 'var(--accent-text)' }} />
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--txt-primary)' }}>
                    Adjudicating:
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--accent-text)' }}>
                    {activeTask.task_id}
                  </span>
                  <span className="chip">{activeTask.metadata.domain}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: '11px', color: 'var(--txt-tertiary)' }}>Auto score:</span>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '12px',
                      padding: '2px 8px', borderRadius: 'var(--radius-sm)',
                      background: 'var(--red-muted)', color: 'var(--red)',
                    }}
                  >
                    {activeResult.task_score}%
                  </span>
                </div>
              </div>

              {/* Prompt + comparison */}
              <div className="space-y-3">
                <div>
                  <p className="section-label mb-2">Evaluation Prompt</p>
                  <div className="code-block" style={{ fontFamily: 'inherit', fontSize: '12px', color: 'var(--txt-secondary)' }}>
                    {activeTask.input.prompt}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <p className="section-label mb-2" style={{ color: 'var(--green)' }}>
                      Verified Reference
                    </p>
                    <div
                      className="code-block"
                      style={{ background: 'rgba(34,197,94,0.04)', borderColor: 'rgba(34,197,94,0.15)', color: '#86efac', minHeight: '90px' }}
                    >
                      {activeTask.reference.answer}
                    </div>
                  </div>
                  <div>
                    <p className="section-label mb-2">Model A Output</p>
                    <div className="code-block" style={{ minHeight: '90px' }}>
                      {activeResult.output}
                    </div>
                  </div>
                </div>
              </div>

              {/* Judge evidence */}
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-canvas)',
                  border: '1px solid var(--border-dim)',
                }}
              >
                <div className="flex items-center gap-1.5 mb-2">
                  <Sparkles size={12} strokeWidth={2} style={{ color: 'var(--txt-tertiary)' }} />
                  <span className="section-label">Automated Judge Evidence</span>
                </div>
                <p style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--txt-secondary)', lineHeight: 1.5 }}>
                  {activeResult.failure_reason || activeResult.criterion_scores[0]?.evidence}
                </p>
              </div>

              {/* Override form */}
              <div
                style={{
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-canvas)',
                  border: '1px solid var(--border-default)',
                }}
              >
                <div className="flex items-center gap-1.5 mb-4">
                  <Edit3 size={13} strokeWidth={2} style={{ color: 'var(--accent-text)' }} />
                  <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--txt-primary)' }}>
                    Reviewer Override Decision
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--txt-tertiary)', display: 'block', marginBottom: '6px' }}>
                      New score (0-100)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={overrideScoreInput}
                      onChange={(e) => setOverrideScoreInput(parseInt(e.target.value) || 0)}
                      className="input"
                      style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontWeight: 700 }}
                      id="override-score-input"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label style={{ fontSize: '11px', color: 'var(--txt-tertiary)', display: 'block', marginBottom: '6px' }}>
                      Reviewer rationale (required)
                    </label>
                    <input
                      type="text"
                      value={reviewerNote}
                      onChange={(e) => setReviewerNote(e.target.value)}
                      placeholder="Explain the reason for overriding..."
                      className="input"
                      id="reviewer-note-input"
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                  <button
                    onClick={handleApplyOverride}
                    className="btn btn-primary"
                    id="commit-adjudication-btn"
                  >
                    <Save size={13} strokeWidth={2} />
                    Commit to audit trail
                  </button>
                </div>
              </div>

              {/* Audit log */}
              <div style={{ paddingTop: '4px', borderTop: '1px solid var(--border-dim)' }}>
                <div className="flex items-center gap-1.5 mb-3">
                  <History size={13} strokeWidth={2} style={{ color: 'var(--txt-tertiary)' }} />
                  <p className="section-label">Adjudication audit history</p>
                </div>
                <div className="space-y-2" style={{ maxHeight: '160px', overflowY: 'auto' }}>
                  {auditLog.map((entry, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '9px 12px',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-canvas)',
                        border: '1px solid var(--border-dim)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: '12px',
                        alignItems: 'flex-start',
                      }}
                    >
                      <div>
                        <div className="flex items-center gap-2" style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', marginBottom: '3px' }}>
                          <span style={{ fontWeight: 700, color: 'var(--accent-text)' }}>{entry.taskId}</span>
                          <span style={{ color: 'var(--txt-tertiary)' }}>{entry.timestamp}</span>
                          <span style={{ color: 'var(--txt-tertiary)' }}>by {entry.reviewerId}</span>
                        </div>
                        <p style={{ fontSize: '11.5px', color: 'var(--txt-secondary)', lineHeight: 1.4 }}>{entry.note}</p>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0, fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '12px' }}>
                        <span style={{ textDecoration: 'line-through', color: 'var(--red)', marginRight: '6px' }}>{entry.previousScore}%</span>
                        <span style={{ color: 'var(--green)' }}>{entry.newScore}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="card" style={{ padding: '80px 20px', textAlign: 'center', color: 'var(--txt-tertiary)' }}>
              <ShieldAlert size={32} strokeWidth={1.5} style={{ margin: '0 auto 10px', opacity: 0.3 }} />
              <p style={{ fontSize: '13px' }}>No tasks currently queued for adjudication</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
