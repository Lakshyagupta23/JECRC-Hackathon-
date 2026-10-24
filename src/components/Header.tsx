import React from 'react';
import {
  Database,
  FileCheck2,
  PlayCircle,
  BarChart3,
  ShieldAlert,
  DownloadCloud,
  Layers,
  LucideIcon
} from 'lucide-react';

export type ActiveTab = 'ingestion' | 'rubric' | 'evaluation' | 'diagnostics' | 'adjudication' | 'export';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  taskCount: number;
  qualityScore: number;
  adjudicationCount: number;
}

const tabs: { id: ActiveTab; label: string; icon: LucideIcon }[] = [
  { id: 'ingestion',    label: 'Ingestion & QA',       icon: Database      },
  { id: 'rubric',       label: 'Tasks & Rubrics',      icon: FileCheck2    },
  { id: 'evaluation',  label: 'Eval Runner',           icon: PlayCircle    },
  { id: 'diagnostics', label: 'Failure Analysis',      icon: BarChart3     },
  { id: 'adjudication',label: 'Adjudication',          icon: ShieldAlert   },
  { id: 'export',      label: 'Export',                icon: DownloadCloud },
];

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  taskCount,
  qualityScore,
  adjudicationCount,
}) => {
  return (
    <header
      className="sticky top-0 z-40 border-b"
      style={{
        background: 'rgba(9,9,11,0.88)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderColor: 'var(--border-dim)',
      }}
    >
      {/* Brand row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        {/* Left: wordmark */}
        <div className="flex items-center gap-3">
          <div
            className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--accent)', boxShadow: '0 0 16px rgba(99,102,241,0.35)' }}
          >
            <Layers size={15} strokeWidth={2.2} style={{ color: '#fff' }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span
                className="font-extrabold tracking-tight"
                style={{ fontSize: '15px', letterSpacing: '-0.03em', color: 'var(--txt-primary)' }}
              >
                ENCORD
              </span>
              <span className="badge badge-accent" style={{ fontSize: '10px' }}>
                Eval Platform
              </span>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--txt-tertiary)', marginTop: '1px' }}>
              Benchmark QA · Hybrid Grading · SFT/DPO Export
            </p>
          </div>
        </div>

        {/* Right: status pills */}
        <div className="hidden sm:flex items-center gap-3">
          <div
            className="flex items-center gap-2 px-3"
            style={{
              height: '30px',
              background: 'var(--bg-raised)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              fontSize: '12px',
              color: 'var(--txt-secondary)',
            }}
          >
            <span className="status-dot live" />
            <span style={{ color: 'var(--txt-tertiary)' }}>Role:</span>
            <span style={{ color: 'var(--txt-primary)', fontWeight: 500 }}>ML Lead Evaluator</span>
          </div>

          <div
            className="flex items-center gap-2 px-3"
            style={{
              height: '30px',
              background: 'var(--bg-raised)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              fontSize: '12px',
              fontWeight: 500,
            }}
          >
            <span
              className="h-2 w-2 rounded-full flex-shrink-0"
              style={{ background: 'var(--accent)', boxShadow: '0 0 6px rgba(99,102,241,0.5)' }}
            />
            <span style={{ color: 'var(--accent-text)' }}>Inference Engine Active</span>
          </div>

          <div
            className="flex items-center gap-2 px-3"
            style={{
              height: '30px',
              background: 'var(--green-muted)',
              border: '1px solid rgba(34,197,94,0.18)',
              borderRadius: 'var(--radius-md)',
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--green)',
            }}
          >
            {qualityScore}% Health
          </div>
        </div>
      </div>

      {/* Nav row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav
          className="flex gap-1 overflow-x-auto pb-0"
          style={{ scrollbarWidth: 'none' }}
          aria-label="Navigation"
        >
          {tabs.map((tab, i) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const stepNum = i + 1;
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 12px',
                  fontSize: '12px',
                  fontWeight: isActive ? 600 : 500,
                  whiteSpace: 'nowrap',
                  border: 'none',
                  borderBottom: isActive
                    ? '2px solid var(--accent)'
                    : '2px solid transparent',
                  background: 'transparent',
                  color: isActive ? 'var(--txt-primary)' : 'var(--txt-secondary)',
                  cursor: 'pointer',
                  transition: 'color 120ms, border-color 120ms',
                  position: 'relative',
                  borderRadius: 0,
                  outline: 'none',
                }}
                onMouseEnter={e => {
                  if (!isActive) (e.currentTarget as HTMLButtonElement).style.color = 'var(--txt-primary)';
                }}
                onMouseLeave={e => {
                  if (!isActive) (e.currentTarget as HTMLButtonElement).style.color = 'var(--txt-secondary)';
                }}
              >
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '16px',
                    height: '16px',
                    borderRadius: '4px',
                    background: isActive ? 'var(--accent-muted)' : 'var(--bg-subtle)',
                    fontSize: '9px',
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono)',
                    color: isActive ? 'var(--accent-text)' : 'var(--txt-tertiary)',
                    flexShrink: 0,
                  }}
                >
                  {stepNum}
                </span>
                <Icon size={13} strokeWidth={2} />
                {tab.label}
                {tab.id === 'adjudication' && adjudicationCount > 0 && (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      background: 'var(--accent)',
                      color: '#fff',
                      fontSize: '10px',
                      fontWeight: 700,
                    }}
                  >
                    {adjudicationCount}
                  </span>
                )}
                {tab.id === 'ingestion' && (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      height: '16px',
                      padding: '0 5px',
                      borderRadius: '4px',
                      background: qualityScore >= 95 ? 'var(--green-muted)' : 'var(--amber-muted)',
                      color: qualityScore >= 95 ? 'var(--green)' : 'var(--amber)',
                      fontSize: '10px',
                      fontWeight: 600,
                    }}
                  >
                    {qualityScore}%
                  </span>
                )}
                {tab.id === 'rubric' && (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      height: '16px',
                      padding: '0 5px',
                      borderRadius: '4px',
                      background: 'var(--bg-subtle)',
                      color: 'var(--txt-tertiary)',
                      fontSize: '10px',
                      fontWeight: 600,
                    }}
                  >
                    {taskCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
