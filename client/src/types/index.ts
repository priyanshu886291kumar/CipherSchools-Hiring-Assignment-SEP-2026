export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

export type AttemptStatus = 'CREATED' | 'SUBMITTED' | 'EVALUATING' | 'COMPLETED' | 'FAILED';

export type RubricDimension =
  | 'REQUIREMENT_ANALYSIS'
  | 'CLASS_RESPONSIBILITY'
  | 'COUPLING_ENCAPSULATION'
  | 'DESIGN_PATTERNS'
  | 'EXTENSIBILITY_TRADEOFFS'
  | 'EDGE_CASES_TESTABILITY';

export interface RubricItem {
  dimension: RubricDimension;
  weight: number;
}

export interface Problem {
  id: string;
  slug: string;
  title: string;
  difficulty: Difficulty;
  estimatedMinutes: number;
  shortDescription: string;
  fullDescription: string;
  functionalRequirements: string[];
  nonFunctionalRequirements: string[];
  constraints: string[];
  hints: string[];
  keyEntitiesExpected: string[];
  sampleApproach?: string;
  starterTemplate?: {
    requirementsAndAssumptions?: string;
    classModelTextOrDiagram?: string;
    designPatternsRationale?: string;
    implementationCode?: string;
    tradeoffsAndEdgeCases?: string;
  };
  rubric: {
    items: RubricItem[];
  };
}

export interface SubmissionPayload {
  requirementsAndAssumptions: string;
  classModelTextOrDiagram: string;
  designPatternsRationale: string;
  implementationCode: string;
  tradeoffsAndEdgeCases?: string;
  format?: 'structured_hybrid' | 'code_only' | 'text_only';
}

export interface CriterionEvaluation {
  dimension: RubricDimension;
  criterion: string;
  score: number;
  weight: number;
  evidence: string;
  concern: string;
  suggestion: string;
  confidence: number;
}

export interface EvaluationResult {
  overallScore: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  summary: string;
  criteria: CriterionEvaluation[];
  strengths: string[];
  keyAreasForImprovement: string[];
  evaluatedBy: 'deterministic' | 'heuristic' | 'llm-hybrid';
  evaluatedAt: string;
  durationMs: number;
}

export interface Attempt {
  id: string;
  problemId: string;
  learnerId: string;
  attemptNumber: number;
  status: AttemptStatus;
  submission: (SubmissionPayload & { submittedAt?: string }) | null;
  evaluation: EvaluationResult | null;
  failureReason: string | null;
  createdAt: string;
  updatedAt: string;
  submittedAt: string | null;
  completedAt: string | null;
}

export interface AttemptComparison {
  attempt1: Attempt;
  attempt2: Attempt;
  scoreDelta: number;
  percentageChange: number;
  dimensionDeltas: {
    dimension: string;
    criterion: string;
    score1: number;
    score2: number;
    delta: number;
  }[];
  improvementSummary: string;
}
