import React, { useState } from 'react';
import { Attempt, Problem } from '../types';
import {
  Award,
  ArrowRight,
  TrendingUp,
  BookOpen,
  Calendar,
} from 'lucide-react';

interface AttemptHistoryProps {
  attempts: Attempt[];
  problems: Problem[];
  onSelectAttempt: (attempt: Attempt) => void;
  onCompareAttempts: (att1Id: string, att2Id: string) => void;
  onNavigateToProblem: (problem: Problem) => void;
}

export const AttemptHistory: React.FC<AttemptHistoryProps> = ({
  attempts,
  problems,
  onSelectAttempt,
  onCompareAttempts,
}) => {
  const [selectedProblemFilter, setSelectedProblemFilter] = useState<string>('ALL');

  const problemsById = new Map<string, Problem>(problems.map((p) => [p.id, p]));

  const filteredAttempts = attempts.filter((a) => {
    if (selectedProblemFilter === 'ALL') return true;
    return a.problemId === selectedProblemFilter;
  });

  // Group attempts by problem to facilitate multi-attempt comparisons
  const attemptsByProblem: Record<string, Attempt[]> = {};
  attempts.forEach((a) => {
    if (!attemptsByProblem[a.problemId]) {
      attemptsByProblem[a.problemId] = [];
    }
    attemptsByProblem[a.problemId].push(a);
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-3">
        <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold">
          <Award className="w-4 h-4" />
          <span>Iterative Progression Tracker</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Your Low-Level Design Practice History
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
          Review your progression over time. Select any attempt to inspect feedback, or compare two consecutive attempts side-by-side to verify how you resolved architectural flaws.
        </p>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800">
          <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl">
            <span className="text-xs text-slate-400">Total Attempts</span>
            <div className="text-2xl font-bold text-white mt-0.5">{attempts.length}</div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl">
            <span className="text-xs text-slate-400">Problems Explored</span>
            <div className="text-2xl font-bold text-emerald-400 mt-0.5">
              {Object.keys(attemptsByProblem).length} / {problems.length}
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl col-span-2 sm:col-span-1">
            <span className="text-xs text-slate-400">Average Score</span>
            <div className="text-2xl font-bold text-teal-400 mt-0.5">
              {attempts.length > 0
                ? Math.round(
                    attempts
                      .filter((a) => a.evaluation)
                      .reduce((acc, a) => acc + (a.evaluation?.overallScore || 0), 0) /
                      Math.max(1, attempts.filter((a) => a.evaluation).length)
                  )
                : 0}
              /100
            </div>
          </div>
        </div>
      </div>

      {/* Filter by Problem */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setSelectedProblemFilter('ALL')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            selectedProblemFilter === 'ALL'
              ? 'bg-emerald-500 text-slate-950 font-bold'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          All Problems ({attempts.length})
        </button>

        {problems.map((p) => {
          const count = attemptsByProblem[p.id]?.length || 0;
          return (
            <button
              key={p.id}
              onClick={() => setSelectedProblemFilter(p.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedProblemFilter === p.id
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {p.title} ({count})
            </button>
          );
        })}
      </div>

      {/* Attempt List */}
      {filteredAttempts.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-4">
          <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No attempts recorded yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Choose any problem from the library to start practicing and receive comprehensive rubric feedback.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAttempts.map((attempt) => {
            const prob = problemsById.get(attempt.problemId);
            const probAttempts = attemptsByProblem[attempt.problemId] || [];
            const canCompare = probAttempts.length > 1;

            return (
              <div
                key={attempt.id}
                className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Attempt #{attempt.attemptNumber}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(attempt.createdAt).toLocaleDateString()}</span>
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                        attempt.status === 'COMPLETED'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : attempt.status === 'EVALUATING'
                          ? 'bg-amber-500/10 text-amber-400 animate-pulse'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {attempt.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white hover:text-emerald-400 cursor-pointer transition-colors" onClick={() => onSelectAttempt(attempt)}>
                    {prob?.title || 'Unknown Problem'}
                  </h3>

                  {attempt.evaluation && (
                    <p className="text-xs text-slate-400 line-clamp-2 max-w-xl">
                      {attempt.evaluation.summary}
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-4 shrink-0 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-slate-800">
                  {attempt.evaluation && (
                    <div className="text-right">
                      <div className="text-2xl font-black text-white">
                        {attempt.evaluation.overallScore}
                        <span className="text-xs text-slate-500 font-normal">/100</span>
                      </div>
                      <div className="text-[11px] font-bold text-emerald-400">
                        Grade: {attempt.evaluation.grade}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onSelectAttempt(attempt)}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition-all border border-slate-700"
                    >
                      <span>Review Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    {canCompare && (
                      <button
                        onClick={() => {
                          const other = probAttempts.find((a) => a.id !== attempt.id);
                          if (other) {
                            onCompareAttempts(other.id, attempt.id);
                          }
                        }}
                        className="px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center space-x-1.5 transition-all border border-emerald-500/30"
                        title="Compare with another attempt on this problem"
                      >
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>Compare</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
