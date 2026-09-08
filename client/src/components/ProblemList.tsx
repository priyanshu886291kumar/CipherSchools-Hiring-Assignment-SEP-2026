import React, { useState } from 'react';
import { Problem, Difficulty } from '../types';
import { Clock, ArrowRight, CheckCircle, Search, Sparkles } from 'lucide-react';

interface ProblemListProps {
  problems: Problem[];
  onSelectProblem: (problem: Problem) => void;
  attemptsCountByProblem: Record<string, number>;
}

export const ProblemList: React.FC<ProblemListProps> = ({
  problems,
  onSelectProblem,
  attemptsCountByProblem,
}) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProblems = problems.filter((p) => {
    const matchesDiff = selectedDifficulty === 'ALL' || p.difficulty === selectedDifficulty;
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.shortDescription.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDiff && matchesSearch;
  });

  const getDifficultyBadge = (diff: Difficulty) => {
    switch (diff) {
      case 'EASY':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'MEDIUM':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'HARD':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 p-8 shadow-xl">
        <div className="absolute -right-10 -top-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Master Object-Oriented & Low-Level Design</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Iterative LLD Practice with <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Explainable Feedback</span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Move beyond static solutions and vague AI scores. Design real-world systems, receive evidence-based rubric feedback, and track your architectural improvements across attempts.
          </p>

          {/* Loop Indicator */}
          <div className="pt-2 flex flex-wrap items-center gap-2 text-xs text-slate-300 font-medium">
            <span className="px-2.5 py-1 rounded-md bg-slate-800/90 border border-slate-700/60">1. Select Problem</span>
            <span className="text-slate-500">→</span>
            <span className="px-2.5 py-1 rounded-md bg-slate-800/90 border border-slate-700/60">2. Model & Code</span>
            <span className="text-slate-500">→</span>
            <span className="px-2.5 py-1 rounded-md bg-slate-800/90 border border-slate-700/60">3. Rubric Evaluation</span>
            <span className="text-slate-500">→</span>
            <span className="px-2.5 py-1 rounded-md bg-emerald-950/60 border border-emerald-500/40 text-emerald-300">4. Iterate & Compare</span>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          {['ALL', 'EASY', 'MEDIUM', 'HARD'].map((diff) => (
            <button
              key={diff}
              onClick={() => setSelectedDifficulty(diff)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedDifficulty === diff
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {diff === 'ALL' ? 'All Difficulties' : diff}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search problems, patterns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
          />
        </div>
      </div>

      {/* Problem Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProblems.map((problem) => {
          const attemptCount = attemptsCountByProblem[problem.id] || 0;
          return (
            <div
              key={problem.id}
              onClick={() => onSelectProblem(problem)}
              className="group relative bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 rounded-xl p-6 transition-all duration-200 hover:shadow-xl hover:shadow-emerald-500/5 flex flex-col justify-between cursor-pointer"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getDifficultyBadge(
                      problem.difficulty
                    )}`}
                  >
                    {problem.difficulty}
                  </span>

                  <div className="flex items-center space-x-1 text-slate-400 text-xs">
                    <Clock className="w-3.5 h-3.5" />
                    <span>~{problem.estimatedMinutes}m</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-100 group-hover:text-emerald-400 transition-colors">
                    {problem.title}
                  </h3>
                  <p className="mt-2 text-xs text-slate-400 line-clamp-3 leading-relaxed">
                    {problem.shortDescription}
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {problem.keyEntitiesExpected.slice(0, 3).map((entity) => (
                    <span
                      key={entity}
                      className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700/50"
                    >
                      {entity}
                    </span>
                  ))}
                  {problem.keyEntitiesExpected.length > 3 && (
                    <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 text-slate-500">
                      +{problem.keyEntitiesExpected.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-6 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-500">
                  {attemptCount > 0 ? (
                    <span className="text-emerald-400 font-medium flex items-center space-x-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>{attemptCount} attempt{attemptCount > 1 ? 's' : ''} recorded</span>
                    </span>
                  ) : (
                    'Not attempted yet'
                  )}
                </span>

                <span className="font-semibold text-emerald-400 group-hover:translate-x-1 transition-transform inline-flex items-center space-x-1">
                  <span>Practice</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
