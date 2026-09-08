import React from 'react';
import { Layers, Award, BookOpen } from 'lucide-react';

interface HeaderProps {
  currentView: 'problems' | 'practice' | 'history';
  onNavigate: (view: 'problems' | 'history') => void;
  selectedProblemTitle?: string;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onNavigate, selectedProblemTitle }) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onNavigate('problems')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg text-white tracking-tight">LLD Studio</span>
              <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Practice & Eval
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">Iterative Low-Level Design Engine</p>
          </div>
        </div>

        {selectedProblemTitle && currentView === 'practice' && (
          <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 max-w-md truncate">
            <BookOpen className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-xs font-medium text-slate-300 truncate">
              {selectedProblemTitle}
            </span>
          </div>
        )}

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onNavigate('problems')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
              currentView === 'problems'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Problems</span>
          </button>

          <button
            onClick={() => onNavigate('history')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
              currentView === 'history'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Attempt History</span>
          </button>
        </div>
      </div>
    </header>
  );
};
