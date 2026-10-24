import React, { useState, useEffect } from 'react';
import { Header, ActiveTab } from './components/Header';
import { IngestionQA } from './components/IngestionQA';
import { TaskRubricStudio } from './components/TaskRubricStudio';
import { EvaluationRunner } from './components/EvaluationRunner';
import { FailureAnalysis } from './components/FailureAnalysis';
import { AdjudicationQueue } from './components/AdjudicationQueue';
import { ExportView } from './components/ExportView';

import { CanonicalTask, EvaluationRun, TaskEvaluationResult } from './types/canonical';
import { BENCHMARK_TASKS } from './data/benchmarkTasks';
import { analyzeDatasetQuality } from './services/datasetService';
import { evaluateTaskModelOutput } from './services/evaluationEngine';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('ingestion');
  const [tasks, setTasks] = useState<CanonicalTask[]>(BENCHMARK_TASKS);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  // Compute initial evaluation results for both models
  const initialResultsA: Record<string, TaskEvaluationResult> = {};
  const initialResultsB: Record<string, TaskEvaluationResult> = {};
  BENCHMARK_TASKS.forEach((t) => {
    initialResultsA[t.task_id] = evaluateTaskModelOutput(t, 'model_a');
    initialResultsB[t.task_id] = evaluateTaskModelOutput(t, 'model_b');
  });

  const [evaluationRun, setEvaluationRun] = useState<EvaluationRun>({
    run_id: 'run_eval_demo_001',
    status: 'completed',
    progress: 100,
    current_task_index: 20,
    total_tasks: 20,
    model_a: {
      id: 'model_a',
      name: 'Baseline Checkpoint (8B-Base)',
      version: 'v1.0.4',
      badge: 'Open Foundation'
    },
    model_b: {
      id: 'model_b',
      name: 'Expert Fine-Tuned (70B-Aligned)',
      version: 'v2.2.0',
      badge: 'RLHF Aligned'
    },
    results_a: initialResultsA,
    results_b: initialResultsB
  });

  const report = analyzeDatasetQuality(tasks);

  // Handle tasks update from Ingestion / Planted errors
  const handleTasksUpdated = (newTasks: CanonicalTask[]) => {
    setTasks(newTasks);
    // Refresh evaluation results for active tasks
    const newResA: Record<string, TaskEvaluationResult> = {};
    const newResB: Record<string, TaskEvaluationResult> = {};
    newTasks.forEach((t) => {
      newResA[t.task_id] = evaluateTaskModelOutput(t, 'model_a');
      newResB[t.task_id] = evaluateTaskModelOutput(t, 'model_b');
    });
    setEvaluationRun((prev) => ({
      ...prev,
      results_a: newResA,
      results_b: newResB
    }));
  };

  // Update a single task (e.g. rubric weight adjustments)
  const handleUpdateTask = (updatedTask: CanonicalTask) => {
    const updatedTasks = tasks.map((t) =>
      t.task_id === updatedTask.task_id ? updatedTask : t
    );
    setTasks(updatedTasks);
    // Re-evaluate that task
    setEvaluationRun((prev) => ({
      ...prev,
      results_a: {
        ...prev.results_a,
        [updatedTask.task_id]: evaluateTaskModelOutput(updatedTask, 'model_a')
      },
      results_b: {
        ...prev.results_b,
        [updatedTask.task_id]: evaluateTaskModelOutput(updatedTask, 'model_b')
      }
    }));
  };

  // Execute interactive simulated run with progressive animation
  const handleExecuteRun = () => {
    setIsRunning(true);
    setEvaluationRun((prev) => ({
      ...prev,
      status: 'running',
      progress: 0
    }));

    let step = 0;
    const interval = setInterval(() => {
      step += 1;
      const progress = Math.min(100, Math.round((step / tasks.length) * 100));
      
      setEvaluationRun((prev) => ({
        ...prev,
        progress,
        status: progress >= 100 ? 'completed' : 'running'
      }));

      if (progress >= 100) {
        clearInterval(interval);
        setIsRunning(false);
      }
    }, 120);
  };

  // Score override from Human Adjudication
  const handleOverrideScore = (
    taskId: string,
    modelId: string,
    newScore: number,
    note: string
  ) => {
    setEvaluationRun((prev) => {
      const currentRes = prev.results_a[taskId];
      if (!currentRes) return prev;

      return {
        ...prev,
        results_a: {
          ...prev.results_a,
          [taskId]: {
            ...currentRes,
            override_score: newScore,
            adjudicated: true,
            adjudication_note: note,
            reviewer_id: 'lead_evaluator_01',
            passed: newScore >= 70
          }
        }
      };
    });
  };

  const adjudicationCount = Object.values(evaluationRun.results_a).filter(
    (r) => r.adjudicated
  ).length;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-canvas)', color: 'var(--txt-primary)' }}>
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        taskCount={tasks.length}
        qualityScore={report.qualityScore}
        adjudicationCount={adjudicationCount}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'ingestion' && (
          <IngestionQA
            currentTasks={tasks}
            onTasksUpdated={handleTasksUpdated}
            report={report}
          />
        )}

        {activeTab === 'rubric' && (
          <TaskRubricStudio
            tasks={tasks}
            onUpdateTask={handleUpdateTask}
          />
        )}

        {activeTab === 'evaluation' && (
          <EvaluationRunner
            tasks={tasks}
            run={evaluationRun}
            onExecuteRun={handleExecuteRun}
            isRunning={isRunning}
          />
        )}

        {activeTab === 'diagnostics' && (
          <FailureAnalysis
            tasks={tasks}
            resultsA={evaluationRun.results_a}
            resultsB={evaluationRun.results_b}
          />
        )}

        {activeTab === 'adjudication' && (
          <AdjudicationQueue
            tasks={tasks}
            resultsA={evaluationRun.results_a}
            onOverrideScore={handleOverrideScore}
          />
        )}

        {activeTab === 'export' && (
          <ExportView
            tasks={tasks}
            resultsA={evaluationRun.results_a}
          />
        )}
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--border-dim)',
          background: 'var(--bg-surface)',
          padding: '12px 0',
        }}
      >
        <div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2"
          style={{ fontSize: '11px', color: 'var(--txt-tertiary)' }}
        >
          <span>Encord AI Evaluation Platform · Hackathon Demo Build · Canonical Schema v1.0</span>
          <span style={{ fontFamily: 'var(--font-mono)' }}>React 18 · Vite 6 · Tailwind CSS</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
