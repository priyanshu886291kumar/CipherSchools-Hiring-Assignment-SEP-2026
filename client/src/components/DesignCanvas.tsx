import React, { useState } from 'react';
import { Problem, SubmissionPayload } from '../types';
import {
  FileText,
  Layers,
  Sparkles,
  Code2,
  Scale,
  Send,
  RotateCcw,
  AlertCircle,
} from 'lucide-react';

interface DesignCanvasProps {
  problem: Problem;
  attemptNumber: number;
  initialSubmission?: SubmissionPayload;
  onSubmit: (submission: SubmissionPayload) => void;
  isSubmitting: boolean;
}

export const DesignCanvas: React.FC<DesignCanvasProps> = ({
  problem,
  attemptNumber,
  initialSubmission,
  onSubmit,
  isSubmitting,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'requirements' | 'model' | 'patterns' | 'code' | 'tradeoffs'>('all');

  const [formData, setFormData] = useState<SubmissionPayload>({
    requirementsAndAssumptions: initialSubmission?.requirementsAndAssumptions || '',
    classModelTextOrDiagram: initialSubmission?.classModelTextOrDiagram || '',
    designPatternsRationale: initialSubmission?.designPatternsRationale || '',
    implementationCode: initialSubmission?.implementationCode || '',
    tradeoffsAndEdgeCases: initialSubmission?.tradeoffsAndEdgeCases || '',
    format: 'structured_hybrid',
  });

  const [validationError, setValidationError] = useState<string | null>(null);

  const loadStarterTemplate = () => {
    if (problem.starterTemplate) {
      setFormData({
        requirementsAndAssumptions: problem.starterTemplate.requirementsAndAssumptions || '',
        classModelTextOrDiagram: problem.starterTemplate.classModelTextOrDiagram || '',
        designPatternsRationale: problem.starterTemplate.designPatternsRationale || '',
        implementationCode: problem.starterTemplate.implementationCode || '',
        tradeoffsAndEdgeCases: problem.starterTemplate.tradeoffsAndEdgeCases || '',
        format: 'structured_hybrid',
      });
      setValidationError(null);
    }
  };

  const handleFieldChange = (field: keyof SubmissionPayload, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setValidationError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side completeness check
    const totalLength =
      formData.requirementsAndAssumptions.length +
      formData.classModelTextOrDiagram.length +
      formData.designPatternsRationale.length +
      formData.implementationCode.length +
      (formData.tradeoffsAndEdgeCases?.length || 0);

    if (totalLength < 30) {
      setValidationError('Please complete the design sections before submitting for evaluation.');
      return;
    }

    if (formData.classModelTextOrDiagram.length < 15 && formData.implementationCode.length < 20) {
      setValidationError('Please provide either a Class Model (structure/entities) or Implementation Code.');
      return;
    }

    onSubmit(formData);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold text-xs border border-emerald-500/20">
              Attempt #{attemptNumber}
            </span>
            <h2 className="text-lg font-bold text-white tracking-tight">{problem.title}</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Provide your Low-Level Design model, patterns, code, and trade-offs below.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {problem.starterTemplate && (
            <button
              type="button"
              onClick={loadStarterTemplate}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition-all border border-slate-700"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Load Template</span>
            </button>
          )}

          <button
            type="button"
            onClick={() =>
              setFormData({
                requirementsAndAssumptions: '',
                classModelTextOrDiagram: '',
                designPatternsRationale: '',
                implementationCode: '',
                tradeoffsAndEdgeCases: '',
                format: 'structured_hybrid',
              })
            }
            className="px-3 py-1.5 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Validation Alert */}
      {validationError && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2.5">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Section Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        {[
          { id: 'all', label: 'All Sections (Full Canvas)', icon: Layers },
          { id: 'requirements', label: '1. Assumptions & Scope', icon: FileText },
          { id: 'model', label: '2. Class Model / Diagram', icon: Layers },
          { id: 'patterns', label: '3. Design Patterns', icon: Sparkles },
          { id: 'code', label: '4. Implementation Code', icon: Code2 },
          { id: 'tradeoffs', label: '5. Trade-offs & Concurrency', icon: Scale },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                activeTab === tab.id
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Form Fields */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Requirements & Assumptions */}
        {(activeTab === 'all' || activeTab === 'requirements') && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>1. Requirements, Scope & Clarifying Assumptions</span>
              </label>
              <span className="text-[11px] text-slate-500 font-mono">
                {formData.requirementsAndAssumptions.length} chars
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              List functional boundaries, actors, scale assumptions (e.g. single-node in-memory vs distributed), and concurrency expectations.
            </p>
            <textarea
              rows={4}
              value={formData.requirementsAndAssumptions}
              onChange={(e) => handleFieldChange('requirementsAndAssumptions', e.target.value)}
              placeholder="e.g. In-memory parking lot with 3 floors, 150 spots. Thread-safe gates. Vehicle types: Motorcycle, Car, Truck..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
            />
          </div>
        )}

        {/* Section 2: Class Model / UML */}
        {(activeTab === 'all' || activeTab === 'model') && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                <Layers className="w-4 h-4 text-teal-400" />
                <span>2. Class Model & Structural Relationships (Text or Mermaid UML)</span>
              </label>
              <span className="text-[11px] text-slate-500 font-mono">
                {formData.classModelTextOrDiagram.length} chars
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Define the entities, attributes, methods, and relationships (Composition, Aggregation, Inheritance, Realization).
            </p>
            <textarea
              rows={6}
              value={formData.classModelTextOrDiagram}
              onChange={(e) => handleFieldChange('classModelTextOrDiagram', e.target.value)}
              placeholder="class ParkingLot { -List<ParkingFloor> floors; +Ticket park(Vehicle); }&#10;class ParkingFloor { -int floorNum; }&#10;interface IPricingStrategy { double calculateFee(); }"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50"
            />
          </div>
        )}

        {/* Section 3: Design Patterns */}
        {(activeTab === 'all' || activeTab === 'patterns') && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>3. Design Patterns & Architectural Rationale</span>
              </label>
              <span className="text-[11px] text-slate-500 font-mono">
                {formData.designPatternsRationale.length} chars
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Name the Gang-of-Four design patterns used (e.g. Strategy, Factory, State, Observer) and justify why they fit.
            </p>
            <textarea
              rows={4}
              value={formData.designPatternsRationale}
              onChange={(e) => handleFieldChange('designPatternsRationale', e.target.value)}
              placeholder="e.g. Strategy Pattern on IPricingStrategy to allow pluggable surge pricing algorithms without modifying ParkingLot..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50"
            />
          </div>
        )}

        {/* Section 4: Implementation Code */}
        {(activeTab === 'all' || activeTab === 'code') && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                <Code2 className="w-4 h-4 text-emerald-400" />
                <span>4. Core Implementation Code / Pseudocode (Java, C++, TS, Python, etc.)</span>
              </label>
              <span className="text-[11px] text-slate-500 font-mono">
                {formData.implementationCode.length} chars
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Provide the concrete classes, interfaces, method signatures, access modifiers, and execution flow.
            </p>
            <textarea
              rows={9}
              value={formData.implementationCode}
              onChange={(e) => handleFieldChange('implementationCode', e.target.value)}
              placeholder="public interface IPricingStrategy { double calculateFee(Ticket t); }&#10;public class HourlyPricingStrategy implements IPricingStrategy { ... }"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-emerald-300/90 placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
            />
          </div>
        )}

        {/* Section 5: Trade-offs & Edge Cases */}
        {(activeTab === 'all' || activeTab === 'tradeoffs') && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                <Scale className="w-4 h-4 text-purple-400" />
                <span>5. Trade-offs, Edge Cases & Concurrency Handling</span>
              </label>
              <span className="text-[11px] text-slate-500 font-mono">
                {formData.tradeoffsAndEdgeCases?.length || 0} chars
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Explain design trade-offs made, Open-Closed Principle extension points, and thread synchronization to prevent race conditions.
            </p>
            <textarea
              rows={4}
              value={formData.tradeoffsAndEdgeCases}
              onChange={(e) => handleFieldChange('tradeoffsAndEdgeCases', e.target.value)}
              placeholder="e.g. Synchronized locks on ParkingSpot vs lock-free CAS. Handled race conditions during simultaneous gate entries..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50"
            />
          </div>
        )}

        {/* Submit Button */}
        <div className="flex items-center justify-end space-x-4 pt-4 border-t border-slate-800">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/20 flex items-center space-x-2 transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Evaluating Design...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4 fill-slate-950" />
                <span>Submit Solution for Evaluation</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
