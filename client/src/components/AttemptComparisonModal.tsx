import React from 'react';
import { AttemptComparison } from '../types';
import {
  X,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from 'lucide-react';

interface AttemptComparisonModalProps {
  comparison: AttemptComparison;
  onClose: () => void;
}

export const AttemptComparisonModal: React.FC<AttemptComparisonModalProps> = ({
  comparison,
  onClose,
}) => {
  const { attempt1, attempt2, scoreDelta, dimensionDeltas, improvementSummary } =
    comparison;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Iterative Design Progression & Delta
              </h2>
              <p className="text-xs text-slate-400">
                Attempt #{attempt1.attemptNumber} vs Attempt #{attempt2.attemptNumber}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Delta KPI Card */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center sm:text-left">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Overall Improvement Summary
              </div>
              <p className="text-xs sm:text-sm text-slate-200 max-w-xl leading-relaxed">
                {improvementSummary}
              </p>
            </div>

            <div className="flex items-center space-x-6 shrink-0">
              <div className="text-center">
                <div className="text-xs text-slate-400">Attempt #{attempt1.attemptNumber}</div>
                <div className="text-2xl font-black text-slate-300">
                  {attempt1.evaluation?.overallScore}/100
                </div>
              </div>

              <div className="text-center">
                <div className="text-xs text-slate-400">Attempt #{attempt2.attemptNumber}</div>
                <div className="text-2xl font-black text-emerald-400">
                  {attempt2.evaluation?.overallScore}/100
                </div>
              </div>

              <div className="text-center pl-4 border-l border-slate-800">
                <div className="text-xs text-slate-400">Score Delta</div>
                <div
                  className={`text-2xl font-black flex items-center justify-center space-x-1 ${
                    scoreDelta > 0
                      ? 'text-emerald-400'
                      : scoreDelta < 0
                      ? 'text-rose-400'
                      : 'text-slate-400'
                  }`}
                >
                  {scoreDelta > 0 ? (
                    <ArrowUpRight className="w-5 h-5" />
                  ) : scoreDelta < 0 ? (
                    <ArrowDownRight className="w-5 h-5" />
                  ) : (
                    <Minus className="w-5 h-5" />
                  )}
                  <span>{scoreDelta > 0 ? `+${scoreDelta}` : scoreDelta}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Dimension-by-Dimension Delta Breakdown */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Rubric Dimension Breakdown & Score Shifts
            </h3>

            <div className="space-y-3">
              {dimensionDeltas.map((dim, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-white">{dim.criterion}</span>
                    <div className="text-[11px] text-slate-400 font-mono">{dim.dimension}</div>
                  </div>

                  <div className="flex items-center space-x-4 shrink-0">
                    <div className="text-xs font-mono text-slate-400">
                      Att #{attempt1.attemptNumber}: <span className="text-white font-bold">{dim.score1}</span>
                    </div>
                    <span className="text-slate-600">→</span>
                    <div className="text-xs font-mono text-slate-400">
                      Att #{attempt2.attemptNumber}: <span className="text-emerald-300 font-bold">{dim.score2}</span>
                    </div>

                    <div
                      className={`text-xs font-mono font-bold px-2.5 py-1 rounded-md ${
                        dim.delta > 0
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : dim.delta < 0
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {dim.delta > 0 ? `+${dim.delta}` : dim.delta}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex justify-end bg-slate-950/50">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
};
