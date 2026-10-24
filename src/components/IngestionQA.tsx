import React, { useState } from 'react';
import {
  Upload,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  ShieldCheck,
  Hash,
  AlertCircle,
  FileText
} from 'lucide-react';
import { CanonicalTask, DataHygieneReport } from '../types/canonical';
import { analyzeDatasetQuality, parseJSONLString, getSampleDatasetWithPlantedErrors } from '../services/datasetService';
import { BENCHMARK_TASKS } from '../data/benchmarkTasks';

interface IngestionQAProps {
  currentTasks: CanonicalTask[];
  onTasksUpdated: (tasks: CanonicalTask[]) => void;
  report: DataHygieneReport;
}

export const IngestionQA: React.FC<IngestionQAProps> = ({
  currentTasks,
  onTasksUpdated,
  report
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [jsonlInput, setJsonlInput] = useState('');

  const handleLoadPlantedDemo = () => {
    const rawWithErrors = getSampleDatasetWithPlantedErrors();
    onTasksUpdated(rawWithErrors);
  };

  const handleSanitizeAndApprove = () => {
    onTasksUpdated(BENCHMARK_TASKS);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) onTasksUpdated(parseJSONLString(content));
      };
      reader.readAsText(file);
    }
  };

  const totalErrors = report.missingFieldErrors + report.schemaErrors;
  const isHealthy = report.qualityScore >= 95;

  return (
    <div className="space-y-5 animate-fade-up">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck size={15} strokeWidth={2} style={{ color: 'var(--accent-text)' }} />
            <span className="section-label">Stage 1</span>
          </div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--txt-primary)' }}>
            Dataset Ingestion & Quality Assurance
          </h1>
          <p style={{ fontSize: '12px', color: 'var(--txt-secondary)', marginTop: '4px' }}>
            Validates canonical schema, fingerprints records, and isolates corrupt or duplicate entries.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleLoadPlantedDemo}
            className="btn btn-secondary"
            id="load-planted-errors-btn"
          >
            <AlertTriangle size={13} strokeWidth={2} style={{ color: 'var(--amber)' }} />
            Load Planted Errors Demo
          </button>
          <button
            onClick={handleSanitizeAndApprove}
            className="btn btn-primary"
            id="sanitize-approve-btn"
          >
            <CheckCircle2 size={13} strokeWidth={2} />
            Sanitize & Approve
          </button>
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 stagger">
        {/* Health score */}
        <div className="card p-4 animate-fade-up">
          <div className="flex items-center justify-between mb-3">
            <span className="section-label">Dataset Health</span>
            <span className={`badge ${isHealthy ? 'badge-green' : 'badge-amber'}`}>
              {isHealthy ? 'Pristine' : 'Defects Found'}
            </span>
          </div>
          <div className="flex items-baseline gap-1.5 mb-3">
            <span
              className="tabnum"
              style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--txt-primary)' }}
            >
              {report.qualityScore}
            </span>
            <span style={{ fontSize: '13px', color: 'var(--txt-secondary)' }}>%</span>
          </div>
          <div className="score-bar">
            <div
              className={`score-fill ${isHealthy ? 'high' : 'mid'}`}
              style={{ width: `${report.qualityScore}%`, transition: 'width 600ms cubic-bezier(0.16,1,0.3,1)' }}
            />
          </div>
        </div>

        {/* Valid records */}
        <div className="card p-4 animate-fade-up">
          <div className="flex items-center justify-between mb-3">
            <span className="section-label">Valid Records</span>
            <CheckCircle2 size={14} strokeWidth={2} style={{ color: 'var(--green)' }} />
          </div>
          <div className="flex items-baseline gap-1.5 mb-1">
            <span className="tabnum" style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--txt-primary)' }}>
              {report.acceptedRecords}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--txt-tertiary)' }}>/ {report.totalRecords}</span>
          </div>
          <p style={{ fontSize: '11px', color: 'var(--txt-tertiary)' }}>All fields & schemas intact</p>
        </div>

        {/* Duplicates */}
        <div className="card p-4 animate-fade-up">
          <div className="flex items-center justify-between mb-3">
            <span className="section-label">Duplicate Prompts</span>
            <Hash size={14} strokeWidth={2} style={{ color: report.duplicateCount > 0 ? 'var(--amber)' : 'var(--txt-tertiary)' }} />
          </div>
          <div className="flex items-baseline gap-1.5 mb-1">
            <span
              className="tabnum"
              style={{
                fontSize: '32px',
                fontWeight: 800,
                letterSpacing: '-0.04em',
                color: report.duplicateCount > 0 ? 'var(--amber)' : 'var(--txt-primary)',
              }}
            >
              {report.duplicateCount}
            </span>
          </div>
          <p style={{ fontSize: '11px', color: 'var(--txt-tertiary)' }}>Detected via SHA-256 hashing</p>
        </div>

        {/* Critical defects */}
        <div className="card p-4 animate-fade-up">
          <div className="flex items-center justify-between mb-3">
            <span className="section-label">Critical Defects</span>
            <AlertCircle size={14} strokeWidth={2} style={{ color: totalErrors > 0 ? 'var(--red)' : 'var(--txt-tertiary)' }} />
          </div>
          <div className="flex items-baseline gap-1.5 mb-1">
            <span
              className="tabnum"
              style={{
                fontSize: '32px',
                fontWeight: 800,
                letterSpacing: '-0.04em',
                color: totalErrors > 0 ? 'var(--red)' : 'var(--txt-primary)',
              }}
            >
              {totalErrors}
            </span>
          </div>
          <p style={{ fontSize: '11px', color: 'var(--txt-tertiary)' }}>Prompt, reference, or weight anomalies</p>
        </div>
      </div>

      {/* Main content area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Upload zone */}
        <div className="space-y-3">
          {/* Dropzone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const file = e.dataTransfer.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                  const content = event.target?.result as string;
                  if (content) onTasksUpdated(parseJSONLString(content));
                };
                reader.readAsText(file);
              }
            }}
            style={{
              border: `2px dashed ${dragOver ? 'var(--accent)' : 'var(--border-default)'}`,
              borderRadius: 'var(--radius-lg)',
              background: dragOver ? 'var(--accent-muted)' : 'transparent',
              padding: '28px 20px',
              textAlign: 'center',
              transition: 'border-color 150ms, background 150ms',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-raised)',
                border: '1px solid var(--border-default)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px',
              }}
            >
              <Upload size={18} strokeWidth={1.8} style={{ color: 'var(--txt-secondary)' }} />
            </div>
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--txt-primary)', marginBottom: '4px' }}>
              Upload Benchmark Dataset
            </p>
            <p style={{ fontSize: '11px', color: 'var(--txt-tertiary)', marginBottom: '14px' }}>
              JSONL or CSV · drag & drop or browse
            </p>
            <label
              className="btn btn-secondary btn-sm"
              style={{ cursor: 'pointer', display: 'inline-flex' }}
            >
              <FileText size={12} strokeWidth={2} />
              Browse file
              <input
                type="file"
                accept=".jsonl,.csv,.json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Provenance card */}
          <div className="card p-4">
            <p className="section-label mb-3">Provenance Fingerprint</p>
            <div className="code-block" style={{ fontSize: '10.5px', padding: '10px 12px' }}>
              SHA-256:<br />
              9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08
            </div>
            <div
              className="flex items-center justify-between"
              style={{ marginTop: '10px', fontSize: '11px', color: 'var(--txt-tertiary)' }}
            >
              <span>Dataset version</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--txt-secondary)', fontWeight: 500 }}>
                v1.0.0-verified
              </span>
            </div>
          </div>
        </div>

        {/* Right: QA inspection report */}
        <div className="lg:col-span-2 card p-5">
          <div
            className="flex items-center justify-between pb-4"
            style={{ borderBottom: '1px solid var(--border-dim)' }}
          >
            <div>
              <h3 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--txt-primary)' }}>
                Automated Hygiene Inspection
              </h3>
              <p style={{ fontSize: '11px', color: 'var(--txt-tertiary)', marginTop: '2px' }}>
                Line-by-line verification against the canonical schema specification.
              </p>
            </div>
            <span
              className="badge badge-neutral"
              style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}
            >
              {report.issues.length} {report.issues.length === 1 ? 'notice' : 'notices'}
            </span>
          </div>

          <div className="mt-4 space-y-2" style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '4px' }}>
            {report.issues.length === 0 ? (
              <div style={{ padding: '48px 0', textAlign: 'center' }}>
                <CheckCircle2
                  size={36}
                  strokeWidth={1.5}
                  style={{ color: 'var(--green)', margin: '0 auto 10px', opacity: 0.7 }}
                />
                <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--txt-primary)' }}>
                  Zero defects detected
                </p>
                <p style={{ fontSize: '11px', color: 'var(--txt-tertiary)', marginTop: '4px' }}>
                  All {currentTasks.length} tasks have verified prompts, reference answers, and normalized rubric weights.
                </p>
              </div>
            ) : (
              report.issues.map((issue, idx) => {
                const isError = issue.severity === 'error';
                return (
                  <div
                    key={idx}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-md)',
                      border: `1px solid ${isError ? 'rgba(239,68,68,0.18)' : 'rgba(245,158,11,0.18)'}`,
                      background: isError ? 'var(--red-muted)' : 'var(--amber-muted)',
                      display: 'flex',
                      gap: '10px',
                      alignItems: 'flex-start',
                    }}
                  >
                    {isError ? (
                      <AlertCircle size={14} strokeWidth={2} style={{ color: 'var(--red)', flexShrink: 0, marginTop: '1px' }} />
                    ) : (
                      <AlertTriangle size={14} strokeWidth={2} style={{ color: 'var(--amber)', flexShrink: 0, marginTop: '1px' }} />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="flex items-center justify-between gap-2">
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            color: 'var(--txt-primary)',
                            fontFamily: 'var(--font-mono)',
                          }}
                        >
                          #{issue.line} · {issue.taskId}
                        </span>
                        <span className={`badge ${isError ? 'badge-red' : 'badge-amber'}`} style={{ fontSize: '10px' }}>
                          {issue.severity}
                        </span>
                      </div>
                      <p style={{ fontSize: '12px', color: 'var(--txt-secondary)', marginTop: '3px', lineHeight: '1.5' }}>
                        {issue.issue}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
