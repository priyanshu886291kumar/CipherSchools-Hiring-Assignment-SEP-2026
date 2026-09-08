import React, { useState, useEffect } from 'react';
import { Problem, Attempt, SubmissionPayload, AttemptComparison } from './types';
import { api } from './api/client';
import { Header } from './components/Header';
import { ProblemList } from './components/ProblemList';
import { ProblemDetail } from './components/ProblemDetail';
import { DesignCanvas } from './components/DesignCanvas';
import { EvaluationView } from './components/EvaluationView';
import { AttemptHistory } from './components/AttemptHistory';
import { AttemptComparisonModal } from './components/AttemptComparisonModal';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export const App: React.FC = () => {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [allAttempts, setAllAttempts] = useState<Attempt[]>([]);
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [currentAttempt, setCurrentAttempt] = useState<Attempt | null>(null);
  const [view, setView] = useState<'problems' | 'detail' | 'practice' | 'evaluation' | 'history'>('problems');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeComparison, setActiveComparison] = useState<AttemptComparison | null>(null);
  const [bannerMessage, setBannerMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      const [probs, atts] = await Promise.all([
        api.getProblems(),
        api.getAttemptsForProblem('all', 'learner-1').catch(() => []),
      ]);
      setProblems(probs);
      setAllAttempts(atts);
    } catch (err: any) {
      console.error('Failed to load problems:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const showBanner = (text: string, type: 'success' | 'error' = 'success') => {
    setBannerMessage({ type, text });
    setTimeout(() => setBannerMessage(null), 4000);
  };

  const handleSelectProblem = (problem: Problem) => {
    setSelectedProblem(problem);
    setView('detail');
  };

  const handleStartAttempt = async () => {
    if (!selectedProblem) return;
    try {
      setIsLoading(true);
      const attempt = await api.startAttempt(selectedProblem.id, 'learner-1');
      setCurrentAttempt(attempt);
      setAllAttempts((prev) => [attempt, ...prev.filter((a) => a.id !== attempt.id)]);
      setView('practice');
    } catch (err: any) {
      showBanner(err.message || 'Failed to start attempt', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitAttempt = async (submission: SubmissionPayload) => {
    if (!currentAttempt) return;
    try {
      setIsSubmitting(true);
      const updatedAttempt = await api.submitAttempt(currentAttempt.id, submission);
      setCurrentAttempt(updatedAttempt);
      setAllAttempts((prev) => [updatedAttempt, ...prev.filter((a) => a.id !== updatedAttempt.id)]);

      if (updatedAttempt.evaluation) {
        setView('evaluation');
        showBanner(`Attempt #${updatedAttempt.attemptNumber} evaluated successfully! Score: ${updatedAttempt.evaluation.overallScore}/100`);
      }
    } catch (err: any) {
      showBanner(err.message || 'Submission evaluation failed.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompareAttempts = async (att1Id: string, att2Id: string) => {
    try {
      const comparison = await api.compareAttempts(att1Id, att2Id);
      setActiveComparison(comparison);
    } catch (err: any) {
      showBanner(err.message || 'Failed to load comparison.', 'error');
    }
  };

  const handleReviewAttempt = (attempt: Attempt) => {
    const prob = problems.find((p) => p.id === attempt.problemId);
    if (prob) setSelectedProblem(prob);
    setCurrentAttempt(attempt);
    if (attempt.evaluation) {
      setView('evaluation');
    } else {
      setView('practice');
    }
  };

  // Compute attempts count per problem
  const attemptsCountByProblem: Record<string, number> = {};
  allAttempts.forEach((a) => {
    attemptsCountByProblem[a.problemId] = (attemptsCountByProblem[a.problemId] || 0) + 1;
  });

  const currentProblemAttempts = selectedProblem
    ? allAttempts.filter((a) => a.problemId === selectedProblem.id)
    : [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header
        currentView={view === 'history' ? 'history' : view === 'problems' ? 'problems' : 'practice'}
        onNavigate={(nav) => setView(nav)}
        selectedProblemTitle={selectedProblem?.title}
      />

      {/* Banner Notifications */}
      {bannerMessage && (
        <div
          className={`px-4 py-2.5 text-xs font-semibold text-center flex items-center justify-center space-x-2 transition-all ${
            bannerMessage.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-300 border-b border-emerald-500/30'
              : 'bg-rose-500/10 text-rose-300 border-b border-rose-500/30'
          }`}
        >
          {bannerMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400" />
          )}
          <span>{bannerMessage.text}</span>
        </div>
      )}

      {/* Main View Router */}
      <main className="flex-1">
        {view === 'problems' && (
          <ProblemList
            problems={problems}
            onSelectProblem={handleSelectProblem}
            attemptsCountByProblem={attemptsCountByProblem}
          />
        )}

        {view === 'detail' && selectedProblem && (
          <ProblemDetail
            problem={selectedProblem}
            onBack={() => setView('problems')}
            onStartAttempt={handleStartAttempt}
            isLoading={isLoading}
            previousAttemptsCount={currentProblemAttempts.length}
          />
        )}

        {view === 'practice' && selectedProblem && currentAttempt && (
          <DesignCanvas
            problem={selectedProblem}
            attemptNumber={currentAttempt.attemptNumber}
            initialSubmission={currentAttempt.submission || undefined}
            onSubmit={handleSubmitAttempt}
            isSubmitting={isSubmitting}
          />
        )}

        {view === 'evaluation' && selectedProblem && currentAttempt?.evaluation && (
          <EvaluationView
            evaluation={currentAttempt.evaluation}
            problemTitle={selectedProblem.title}
            attemptNumber={currentAttempt.attemptNumber}
            onTryAgain={handleStartAttempt}
            onViewHistory={() => setView('history')}
            hasPreviousAttempts={currentProblemAttempts.length > 1}
            onCompareWithPrevious={() => {
              const previous = currentProblemAttempts.find(
                (a) => a.attemptNumber === currentAttempt.attemptNumber - 1 && a.evaluation
              );
              if (previous) {
                handleCompareAttempts(previous.id, currentAttempt.id);
              }
            }}
          />
        )}

        {view === 'history' && (
          <AttemptHistory
            attempts={allAttempts}
            problems={problems}
            onSelectAttempt={handleReviewAttempt}
            onCompareAttempts={handleCompareAttempts}
            onNavigateToProblem={handleSelectProblem}
          />
        )}
      </main>

      {/* Comparison Modal */}
      {activeComparison && (
        <AttemptComparisonModal
          comparison={activeComparison}
          onClose={() => setActiveComparison(null)}
        />
      )}
    </div>
  );
};

export default App;
