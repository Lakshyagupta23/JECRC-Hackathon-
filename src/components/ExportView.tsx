import React, { useState } from 'react';
import {
  DownloadCloud,
  FileCode,
  CheckCircle2,
  Copy,
  Check,
  ShieldCheck,
  FileSpreadsheet,
  FileJson
} from 'lucide-react';
import { CanonicalTask, TaskEvaluationResult } from '../types/canonical';
import {
  generateSFTDataset,
  generateDPODataset,
  generateExportManifest,
  triggerDownload
} from '../services/exportService';

interface ExportViewProps {
  tasks: CanonicalTask[];
  resultsA: Record<string, TaskEvaluationResult>;
}

export const ExportView: React.FC<ExportViewProps> = ({ tasks, resultsA }) => {
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const sftContent = generateSFTDataset(tasks);
  const dpoContent = generateDPODataset(tasks, resultsA);
  const sftCount = tasks.filter((t) => t.review_status === 'approved' && t.reference?.answer).length;
  const dpoCount = Object.values(resultsA).filter((r) => !r.passed || r.critical_failure).length;
  const manifest = generateExportManifest(tasks, sftCount, dpoCount);
  const manifestContent = JSON.stringify(manifest, null, 2);

  const handleCopy = (content: string, type: string) => {
    navigator.clipboard.writeText(content);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const exportCards = [
    {
      id: 'sft',
      format: 'SFT — .jsonl',
      title: 'Supervised Fine-Tuning Dataset',
      description: 'Standard chat-completion format (messages: [user, assistant]) containing all verified ground-truth reference targets.',
      count: `${sftCount} records`,
      content: sftContent,
      filename: 'benchmark_sft_dataset.jsonl',
      mime: 'application/x-jsonlines',
      icon: FileCode,
      primary: true,
    },
    {
      id: 'dpo',
      format: 'DPO — .jsonl',
      title: 'Preference Pairs (DPO / RLHF)',
      description: 'Pairs verified reference answers (chosen) against inspected model failures (rejected) with full rationale metadata.',
      count: `${dpoCount} pairs`,
      content: dpoContent,
      filename: 'benchmark_dpo_pairs.jsonl',
      mime: 'application/x-jsonlines',
      icon: FileSpreadsheet,
      primary: false,
    },
    {
      id: 'manifest',
      format: 'Manifest — .json',
      title: 'Provenance & Lineage Manifest',
      description: 'Cryptographic SHA-256 fingerprint, filter specs, timestamps, and training-suitability certification.',
      count: 'Audit compliant',
      content: manifestContent,
      filename: 'export_manifest.json',
      mime: 'application/json',
      icon: FileJson,
      primary: false,
    },
  ];

  return (
    <div className="space-y-5 animate-fade-up">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <DownloadCloud size={15} strokeWidth={2} style={{ color: 'var(--accent-text)' }} />
            <span className="section-label">Stage 6</span>
          </div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--txt-primary)' }}>
            Verified Training Data & Benchmark Export
          </h1>
          <p style={{ fontSize: '12px', color: 'var(--txt-secondary)', marginTop: '4px' }}>
            Convert audited benchmark outputs into SFT & DPO artifacts with immutable provenance manifests.
          </p>
        </div>
        <div
          className="flex items-center gap-2 px-3 flex-shrink-0"
          style={{
            height: '34px',
            background: 'var(--green-muted)',
            border: '1px solid rgba(34,197,94,0.18)',
            borderRadius: 'var(--radius-md)',
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--green)',
          }}
        >
          <ShieldCheck size={14} strokeWidth={2} />
          Ready for fine-tuning
        </div>
      </div>

      {/* Export cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {exportCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              className="card flex flex-col"
              style={{
                padding: '20px',
                borderColor: card.primary ? 'var(--border-accent)' : 'var(--border-default)',
                boxShadow: card.primary ? 'var(--shadow-accent)' : 'var(--shadow-sm)',
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <span className={`badge ${card.primary ? 'badge-accent' : 'badge-neutral'}`} style={{ fontFamily: 'var(--font-mono)' }}>
                  {card.format}
                </span>
                <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--txt-tertiary)' }}>
                  {card.count}
                </span>
              </div>

              <div
                style={{
                  width: '36px', height: '36px', borderRadius: 'var(--radius-md)',
                  background: card.primary ? 'var(--accent-muted)' : 'var(--bg-subtle)',
                  border: `1px solid ${card.primary ? 'rgba(99,102,241,0.18)' : 'var(--border-dim)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '12px',
                }}
              >
                <Icon size={16} strokeWidth={1.8} style={{ color: card.primary ? 'var(--accent-text)' : 'var(--txt-secondary)' }} />
              </div>

              <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--txt-primary)', marginBottom: '6px', letterSpacing: '-0.01em' }}>
                {card.title}
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--txt-secondary)', lineHeight: 1.5, flex: 1, marginBottom: '16px' }}>
                {card.description}
              </p>

              <div
                className="flex items-center gap-2"
                style={{ paddingTop: '14px', borderTop: '1px solid var(--border-dim)' }}
              >
                <button
                  onClick={() => triggerDownload(card.filename, card.content, card.mime)}
                  className={`btn flex-1 ${card.primary ? 'btn-primary' : 'btn-secondary'}`}
                  id={`download-${card.id}-btn`}
                >
                  <DownloadCloud size={13} strokeWidth={2} />
                  Download
                </button>
                <button
                  onClick={() => handleCopy(card.content, card.id)}
                  className="btn btn-ghost"
                  style={{ width: '36px', padding: 0, flexShrink: 0 }}
                  title="Copy to clipboard"
                  id={`copy-${card.id}-btn`}
                >
                  {copiedType === card.id ? (
                    <Check size={13} strokeWidth={2} style={{ color: 'var(--green)' }} />
                  ) : (
                    <Copy size={13} strokeWidth={2} />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live format previews */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FileCode size={13} strokeWidth={2} style={{ color: 'var(--accent-text)' }} />
              <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--txt-primary)' }}>
                SFT JSONL Preview
              </span>
            </div>
            <span style={{ fontSize: '10.5px', color: 'var(--txt-tertiary)' }}>OpenAI / HuggingFace format</span>
          </div>
          <div className="code-block" style={{ maxHeight: '200px', overflowX: 'auto' }}>
            {sftContent.split('\n')[0] || '// No records available'}
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FileSpreadsheet size={13} strokeWidth={2} style={{ color: 'var(--txt-secondary)' }} />
              <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--txt-primary)' }}>
                DPO Pair Preview
              </span>
            </div>
            <span style={{ fontSize: '10.5px', color: 'var(--txt-tertiary)' }}>Direct Preference Optimization</span>
          </div>
          <div className="code-block" style={{ maxHeight: '200px', overflowX: 'auto' }}>
            {dpoContent.split('\n')[0] || '// Run evaluation first to generate failure pairs for DPO'}
          </div>
        </div>
      </div>
    </div>
  );
};
