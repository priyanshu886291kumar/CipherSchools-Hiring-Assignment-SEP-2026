import React, { useState } from 'react';
import { Problem } from '../types';
import { CheckCircle2, AlertCircle, Lightbulb, Box, ArrowLeft, Play, FileText } from 'lucide-react';

interface ProblemDetailProps {
  problem: Problem;
  onBack: () => void;
  onStartAttempt: () => void;
  isLoading: boolean;
  previousAttemptsCount: number;
}

export const ProblemDetail: React.FC<ProblemDetailProps> = ({
  problem,
  onBack,
  onStartAttempt,
  isLoading,
  previousAttemptsCount,
}) => {
  const [activeTab, setActiveTab] = useState<'requirements' | 'hints' | 'rubric'>('requirements');

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Top action bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Problem Library</span>
        </button>

        <button
          onClick={onStartAttempt}
          disabled={isLoading}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/20 flex items-center space-x-2 transition-all disabled:opacity-50"
        >
          <Play className="w-4 h-4 fill-slate-950" />
          <span>{previousAttemptsCount > 0 ? `Start Attempt #${previousAttemptsCount + 1}` : 'Start New Attempt'}</span>
        </button>
      </div>

      {/* Main Problem Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-wider px-3 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            {problem.difficulty}
          </span>
          <span className="text-xs text-slate-400">Estimated Duration: ~{problem.estimatedMinutes} mins</span>
          {previousAttemptsCount > 0 && (
            <span className="text-xs text-teal-400 font-medium bg-teal-500/10 px-2.5 py-0.5 rounded-full border border-teal-500/20">
              {previousAttemptsCount} past attempt{previousAttemptsCount > 1 ? 's' : ''}
            </span>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{problem.title}</h1>
        <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">{problem.fullDescription}</p>

        {/* Expected Domain Entities */}
        <div className="pt-4 border-t border-slate-800">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center space-x-1.5">
            <Box className="w-3.5 h-3.5 text-emerald-400" />
            <span>Key Expected Domain Entities</span>
          </h4>
          <div className="flex flex-wrap gap-2">
            {problem.keyEntitiesExpected.map((entity) => (
              <span
                key={entity}
                className="text-xs font-mono px-2.5 py-1 rounded-md bg-slate-800 text-emerald-300 border border-slate-700 font-medium"
              >
                {entity}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Problem Tabs */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="flex border-b border-slate-800 bg-slate-950/50">
          <button
            onClick={() => setActiveTab('requirements')}
            className={`px-5 py-3 text-xs font-bold flex items-center space-x-2 border-b-2 transition-all ${
              activeTab === 'requirements'
                ? 'border-emerald-500 text-emerald-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Requirements & Constraints</span>
          </button>

          <button
            onClick={() => setActiveTab('hints')}
            className={`px-5 py-3 text-xs font-bold flex items-center space-x-2 border-b-2 transition-all ${
              activeTab === 'hints'
                ? 'border-emerald-500 text-emerald-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>Design Hints & Patterns</span>
          </button>

          <button
            onClick={() => setActiveTab('rubric')}
            className={`px-5 py-3 text-xs font-bold flex items-center space-x-2 border-b-2 transition-all ${
              activeTab === 'rubric'
                ? 'border-emerald-500 text-emerald-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Evaluation Rubric</span>
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {activeTab === 'requirements' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-3">
                  Functional Requirements
                </h3>
                <ul className="space-y-2.5">
                  {problem.functionalRequirements.map((req, idx) => (
                    <li key={idx} className="flex items-start space-x-2.5 text-xs sm:text-sm text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-3">
                  Non-Functional Requirements & Extensibility
                </h3>
                <ul className="space-y-2.5">
                  {problem.nonFunctionalRequirements.map((req, idx) => (
                    <li key={idx} className="flex items-start space-x-2.5 text-xs sm:text-sm text-slate-300">
                      <AlertCircle className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {problem.constraints.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-3">
                    Assumptions & Constraints
                  </h3>
                  <ul className="space-y-2">
                    {problem.constraints.map((c, idx) => (
                      <li key={idx} className="text-xs text-slate-400 bg-slate-800/50 px-3 py-2 rounded-lg border border-slate-700/50">
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {activeTab === 'hints' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                These hints highlight classic design patterns and structural choices recommended for this problem:
              </p>
              <div className="space-y-3">
                {problem.hints.map((hint, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 flex items-start space-x-3 text-xs sm:text-sm text-amber-200/90"
                  >
                    <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>{hint}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'rubric' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Your submission will be evaluated against this 100-point rubric across 6 core architectural dimensions:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {problem.rubric.items.map((item) => (
                  <div
                    key={item.dimension}
                    className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700 flex items-center justify-between"
                  >
                    <span className="text-xs font-medium text-slate-200">{item.dimension.replace(/_/g, ' ')}</span>
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      {item.weight}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
