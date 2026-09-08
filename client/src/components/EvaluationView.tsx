import React from 'react';
import { EvaluationResult, CriterionEvaluation } from '../types';
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  TrendingUp,
  RotateCcw,
  Quote,
} from 'lucide-react';

interface EvaluationViewProps {
  evaluation: EvaluationResult;
  problemTitle: string;
  attemptNumber: number;
  onTryAgain: () => void;
  onViewHistory: () => void;
  hasPreviousAttempts: boolean;
  onCompareWithPrevious?: () => void;
}

export const EvaluationView: React.FC<EvaluationViewProps> = ({
  evaluation,
  problemTitle,
  attemptNumber,
  onTryAgain,
  onViewHistory,
  hasPreviousAttempts,
  onCompareWithPrevious,
}) => {
  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'B':
        return 'text-teal-400 bg-teal-500/10 border-teal-500/30';
      case 'C':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'D':
        return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
      default:
        return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
    }
  };

  const getScoreBarColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 70) return 'bg-teal-500';
    if (score >= 60) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Top Banner & Grade Summary */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                Attempt #{attemptNumber} Evaluation
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Evaluator: {evaluation.evaluatedBy.toUpperCase()} ({evaluation.durationMs}ms)
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{problemTitle}</h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">{evaluation.summary}</p>
          </div>

          <div className="flex items-center space-x-4 shrink-0 bg-slate-950/80 border border-slate-800 p-4 rounded-2xl">
            <div className="text-center pr-4 border-r border-slate-800">
              <div className="text-3xl font-black text-white">{evaluation.overallScore}</div>
              <div className="text-[11px] uppercase font-bold text-slate-400">Score / 100</div>
            </div>
            <div className="text-center">
              <div className={`text-3xl font-black px-3 py-0.5 rounded-xl border ${getGradeColor(evaluation.grade)}`}>
                {evaluation.grade}
              </div>
              <div className="text-[11px] uppercase font-bold text-slate-400 mt-1">Grade</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-6 mt-6 border-t border-slate-800/80 flex flex-wrap items-center gap-3">
          <button
            onClick={onTryAgain}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-emerald-500/20 flex items-center space-x-2 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Refine & Try Again (Attempt #{attemptNumber + 1})</span>
          </button>

          {hasPreviousAttempts && onCompareWithPrevious && (
            <button
              onClick={onCompareWithPrevious}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs sm:text-sm border border-slate-700 flex items-center space-x-2 transition-all"
            >
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Compare with Previous Attempt</span>
            </button>
          )}

          <button
            onClick={onViewHistory}
            className="px-4 py-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-slate-200 font-semibold text-xs sm:text-sm flex items-center space-x-2 transition-all"
          >
            <Award className="w-4 h-4" />
            <span>View All Attempts</span>
          </button>
        </div>
      </div>

      {/* Strengths & Quick Wins */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Key Strengths Observed</span>
          </h3>
          <ul className="space-y-2">
            {evaluation.strengths.map((str, idx) => (
              <li key={idx} className="text-xs text-slate-300 flex items-start space-x-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4" />
            <span>Key Areas to Improve for Next Attempt</span>
          </h3>
          <ul className="space-y-2">
            {evaluation.keyAreasForImprovement.map((imp, idx) => (
              <li key={idx} className="text-xs text-slate-300 flex items-start space-x-2">
                <span className="text-amber-400 font-bold">•</span>
                <span>{imp}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 6-Dimensional Rubric Deep Dive */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white tracking-tight">
            Detailed 6-Dimension Architectural Rubric
          </h2>
          <span className="text-xs text-slate-400">
            Evidence-Based Evaluation with Actionable Guidance
          </span>
        </div>

        <div className="space-y-4">
          {evaluation.criteria.map((item: CriterionEvaluation, idx: number) => (
            <div
              key={idx}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm"
            >
              {/* Header with Score Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-white">{item.criterion}</span>
                    <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      Weight: {item.weight}%
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">{item.dimension}</span>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <div className="w-32 bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getScoreBarColor(item.score)} transition-all`}
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                  <span className="text-sm font-extrabold text-white font-mono w-10 text-right">
                    {item.score}/100
                  </span>
                </div>
              </div>

              {/* Evidence */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                  <Quote className="w-3 h-3 text-teal-400" />
                  <span>Observed Evidence from Your Design</span>
                </div>
                <p className="text-xs font-mono text-slate-300 leading-relaxed pl-2 border-l-2 border-teal-500/40">
                  {item.evidence}
                </p>
              </div>

              {/* Concern & Suggestion */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                <div className="p-3.5 rounded-xl bg-rose-500/5 border border-rose-500/20 space-y-1">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-rose-400 flex items-center space-x-1.5">
                    <AlertTriangle className="w-3 h-3 text-rose-400" />
                    <span>Design Concern / Overlooked Aspect</span>
                  </div>
                  <p className="text-xs text-rose-200/90 leading-relaxed">{item.concern}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-1">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-1.5">
                    <Lightbulb className="w-3 h-3 text-emerald-400" />
                    <span>Actionable Suggestion for Next Attempt</span>
                  </div>
                  <p className="text-xs text-emerald-200/90 leading-relaxed">{item.suggestion}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
