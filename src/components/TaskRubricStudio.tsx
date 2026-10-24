import React, { useState } from 'react';
import {
  FileCheck2,
  Search,
  CheckCircle2,
  ShieldAlert,
  Binary,
  Sparkles
} from 'lucide-react';
import { CanonicalTask } from '../types/canonical';

interface TaskRubricStudioProps {
  tasks: CanonicalTask[];
  onUpdateTask: (task: CanonicalTask) => void;
}

const DOMAINS = ['All', 'Math & Reasoning', 'Python & Coding', 'Biomedical & QA', 'Structured JSON'];

const diffBadgeStyle = (diff: string) => {
  if (diff === 'hard')   return { background: 'var(--red-muted)',   color: 'var(--red)',   border: '1px solid rgba(239,68,68,0.18)' };
  if (diff === 'medium') return { background: 'var(--amber-muted)', color: 'var(--amber)', border: '1px solid rgba(245,158,11,0.18)' };
  return                        { background: 'var(--green-muted)', color: 'var(--green)', border: '1px solid rgba(34,197,94,0.18)' };
};

export const TaskRubricStudio: React.FC<TaskRubricStudioProps> = ({ tasks, onUpdateTask }) => {
  const [selectedTaskId, setSelectedTaskId] = useState<string>(tasks[0]?.task_id || '');
  const [domainFilter, setDomainFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredTasks = tasks.filter((t) => {
    const matchesDomain = domainFilter === 'All' || t.metadata.domain === domainFilter;
    const matchesSearch =
      t.input.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.task_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.metadata.tags || []).some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesDomain && matchesSearch;
  });

  const activeTask = tasks.find((t) => t.task_id === selectedTaskId) || tasks[0];
  const totalRubricWeight = activeTask?.rubric.criteria.reduce((acc, c) => acc + c.weight, 0) || 0;
  const weightOk = Math.abs(totalRubricWeight - 100) < 1;

  const handleWeightChange = (criterionId: string, newWeight: number) => {
    if (!activeTask) return;
    onUpdateTask({
      ...activeTask,
      rubric: {
        ...activeTask.rubric,
        criteria: activeTask.rubric.criteria.map((c) =>
          c.criterion_id === criterionId ? { ...c, weight: Math.max(0, newWeight) } : c
        ),
      },
    });
  };

  return (
    <div className="space-y-5 animate-fade-up">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileCheck2 size={15} strokeWidth={2} style={{ color: 'var(--accent-text)' }} />
            <span className="section-label">Stage 2</span>
          </div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--txt-primary)' }}>
            Task Specification & Rubric Studio
          </h1>
          <p style={{ fontSize: '12px', color: 'var(--txt-secondary)', marginTop: '4px' }}>
            Inspect ground-truth references, calibrate numeric tolerances, and assign deterministic vs semantic graders.
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
          <span>Active benchmark:</span>
          <span style={{ fontWeight: 600, color: 'var(--accent-text)' }}>{tasks.length} tasks</span>
        </div>
      </div>

      {/* Main 2-col layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Task browser */}
        <div className="lg:col-span-5 space-y-3">
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <Search
              size={13}
              strokeWidth={2}
              style={{
                position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)',
                color: 'var(--txt-tertiary)', pointerEvents: 'none',
              }}
            />
            <input
              type="text"
              placeholder="Search task ID, prompt, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input"
              style={{ paddingLeft: '30px' }}
              id="task-search-input"
            />
          </div>

          {/* Domain filters */}
          <div className="flex flex-wrap gap-1.5">
            {DOMAINS.map((cat) => (
              <button
                key={cat}
                onClick={() => setDomainFilter(cat)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '11px',
                  fontWeight: domainFilter === cat ? 600 : 500,
                  background: domainFilter === cat ? 'var(--accent)' : 'var(--bg-raised)',
                  color: domainFilter === cat ? '#fff' : 'var(--txt-secondary)',
                  border: `1px solid ${domainFilter === cat ? 'transparent' : 'var(--border-default)'}`,
                  cursor: 'pointer',
                  transition: 'background 120ms, color 120ms',
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Task list */}
          <div className="space-y-1.5" style={{ maxHeight: '580px', overflowY: 'auto', paddingRight: '2px' }}>
            {filteredTasks.map((t) => {
              const isSelected = t.task_id === activeTask?.task_id;
              return (
                <div
                  key={t.task_id}
                  onClick={() => setSelectedTaskId(t.task_id)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: `1px solid ${isSelected ? 'var(--border-accent)' : 'var(--border-dim)'}`,
                    background: isSelected ? 'var(--bg-raised)' : 'transparent',
                    boxShadow: isSelected ? 'var(--shadow-accent)' : 'none',
                    cursor: 'pointer',
                    transition: 'border-color 150ms, background 150ms, box-shadow 150ms',
                  }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, color: 'var(--accent-text)' }}>
                      {t.task_id}
                    </span>
                    <span
                      style={{
                        ...diffBadgeStyle(t.metadata.difficulty || ''),
                        padding: '2px 7px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '10px',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {t.metadata.difficulty}
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--txt-secondary)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {t.input.prompt}
                  </p>
                  <div
                    className="flex items-center justify-between"
                    style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--border-dim)', fontSize: '10.5px', color: 'var(--txt-tertiary)' }}
                  >
                    <span>{t.metadata.domain}</span>
                    <span style={{ fontFamily: 'var(--font-mono)' }}>{t.rubric.criteria.length} criteria</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Task inspector */}
        <div className="lg:col-span-7">
          {activeTask ? (
            <div className="card p-6 space-y-5">
              {/* Task header */}
              <div
                className="flex items-center justify-between pb-4"
                style={{ borderBottom: '1px solid var(--border-dim)' }}
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700,
                      color: 'var(--accent-text)', background: 'var(--accent-muted)',
                      border: '1px solid rgba(99,102,241,0.18)', borderRadius: 'var(--radius-sm)',
                      padding: '3px 8px',
                    }}
                  >
                    {activeTask.task_id}
                  </span>
                  <span className="chip">{activeTask.task_type}</span>
                  <span className="chip">{activeTask.metadata.domain}</span>
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {(activeTask.intended_use || []).map((use) => (
                    <span key={use} className="chip">{use}</span>
                  ))}
                </div>
              </div>

              {/* Prompt */}
              <div>
                <p className="section-label mb-2">Evaluation Prompt</p>
                <div className="code-block" style={{ fontFamily: 'inherit', fontSize: '12.5px', color: 'var(--txt-secondary)' }}>
                  {activeTask.input.prompt}
                </div>
              </div>

              {/* Reference answer */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} strokeWidth={2} style={{ color: 'var(--green)' }} />
                    <p className="section-label" style={{ color: 'var(--green)' }}>Verified Reference Target</p>
                  </div>
                  {activeTask.reference.numeric_value !== undefined && (
                    <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--txt-tertiary)' }}>
                      Target: {activeTask.reference.numeric_value} {activeTask.reference.unit || ''}
                    </span>
                  )}
                </div>
                <div
                  className="code-block"
                  style={{
                    background: 'rgba(34,197,94,0.04)',
                    borderColor: 'rgba(34,197,94,0.15)',
                    color: '#86efac',
                  }}
                >
                  {activeTask.reference.answer}
                </div>
              </div>

              {/* Rubric criteria */}
              <div style={{ paddingTop: '4px', borderTop: '1px solid var(--border-dim)' }}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--txt-primary)' }}>Scoring Rubric</p>
                    <p style={{ fontSize: '11px', color: 'var(--txt-tertiary)', marginTop: '2px' }}>
                      Deterministic checks run first; semantic criteria invoke LLM judge.
                    </p>
                  </div>
                  <span className={`badge ${weightOk ? 'badge-green' : 'badge-amber'}`} style={{ fontFamily: 'var(--font-mono)' }}>
                    Sum: {totalRubricWeight}%
                  </span>
                </div>

                <div className="space-y-2">
                  {activeTask.rubric.criteria.map((crit) => (
                    <div
                      key={crit.criterion_id}
                      style={{
                        padding: '12px 14px',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-canvas)',
                        border: '1px solid var(--border-dim)',
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--txt-primary)' }}>
                            {crit.name}
                          </span>
                          {crit.is_critical && (
                            <span className="badge badge-red" style={{ gap: '3px' }}>
                              <ShieldAlert size={10} strokeWidth={2} />
                              Critical
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span style={{ fontSize: '11px', color: 'var(--txt-tertiary)' }}>Weight</span>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={crit.weight}
                            onChange={(e) => handleWeightChange(crit.criterion_id, parseInt(e.target.value) || 0)}
                            style={{
                              width: '52px',
                              height: '28px',
                              padding: '0 8px',
                              background: 'var(--bg-raised)',
                              border: '1px solid var(--border-default)',
                              borderRadius: 'var(--radius-sm)',
                              color: 'var(--txt-primary)',
                              fontSize: '12px',
                              fontFamily: 'var(--font-mono)',
                              textAlign: 'center',
                              outline: 'none',
                            }}
                          />
                          <span style={{ fontSize: '12px', color: 'var(--txt-tertiary)' }}>%</span>
                        </div>
                      </div>

                      <p style={{ fontSize: '12px', color: 'var(--txt-secondary)', lineHeight: 1.5, marginBottom: '10px' }}>
                        {crit.description}
                      </p>

                      <div
                        className="flex items-center justify-between"
                        style={{ paddingTop: '8px', borderTop: '1px solid var(--border-dim)', fontSize: '11px' }}
                      >
                        <div className="flex items-center gap-1.5">
                          {crit.scoring_type.startsWith('deterministic') ? (
                            <>
                              <Binary size={12} strokeWidth={2} style={{ color: 'var(--accent-text)' }} />
                              <span style={{ color: 'var(--accent-text)', fontWeight: 600 }}>Deterministic</span>
                            </>
                          ) : (
                            <>
                              <Sparkles size={12} strokeWidth={2} style={{ color: 'var(--txt-secondary)' }} />
                              <span style={{ color: 'var(--txt-secondary)', fontWeight: 600 }}>LLM Semantic Judge</span>
                            </>
                          )}
                        </div>
                        {crit.tolerance !== undefined && (
                          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--txt-tertiary)' }}>
                            tolerance ±{crit.tolerance}
                          </span>
                        )}
                        {crit.regex_pattern && (
                          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--txt-tertiary)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            /{crit.regex_pattern}/
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="card" style={{ padding: '80px 20px', textAlign: 'center', color: 'var(--txt-tertiary)' }}>
              <FileCheck2 size={32} strokeWidth={1.5} style={{ margin: '0 auto 10px', opacity: 0.3 }} />
              <p style={{ fontSize: '13px' }}>Select a task to inspect its specification</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
