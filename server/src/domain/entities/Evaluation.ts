import { RubricDimension, RubricDimensionMetadata } from '../enums/RubricDimension';

export interface ICriterionEvaluationPayload {
  dimension: RubricDimension;
  criterion: string;
  score: number; // 0 to 100
  weight: number; // e.g. 15, 20
  evidence: string; // Specific code snippet, class name, or text quoted from submission
  concern: string; // Analysis of why it falls short or trade-offs overlooked
  suggestion: string; // Actionable, concrete advice for the next attempt
  confidence: number; // 0.0 to 1.0
}

export class CriterionEvaluation {
  public readonly dimension: RubricDimension;
  public readonly criterion: string;
  public readonly score: number;
  public readonly weight: number;
  public readonly evidence: string;
  public readonly concern: string;
  public readonly suggestion: string;
  public readonly confidence: number;

  constructor(payload: ICriterionEvaluationPayload) {
    this.dimension = payload.dimension;
    this.criterion = payload.criterion || RubricDimensionMetadata[payload.dimension]?.label || payload.dimension;
    this.score = Math.max(0, Math.min(100, Math.round(payload.score)));
    this.weight = payload.weight || RubricDimensionMetadata[payload.dimension]?.defaultWeight || 15;
    this.evidence = payload.evidence || 'No direct evidence cited';
    this.concern = payload.concern || 'None identified';
    this.suggestion = payload.suggestion || 'Continue refining your design';
    this.confidence = Math.max(0, Math.min(1, payload.confidence ?? 0.9));
  }

  public getWeightedScore(): number {
    return (this.score * this.weight) / 100;
  }

  public toJSON(): ICriterionEvaluationPayload {
    return {
      dimension: this.dimension,
      criterion: this.criterion,
      score: this.score,
      weight: this.weight,
      evidence: this.evidence,
      concern: this.concern,
      suggestion: this.suggestion,
      confidence: this.confidence,
    };
  }
}

export interface IEvaluationResultPayload {
  overallScore: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  summary: string;
  criteria: ICriterionEvaluationPayload[];
  strengths: string[];
  keyAreasForImprovement: string[];
  evaluatedBy: 'deterministic' | 'heuristic' | 'llm-hybrid';
  evaluatedAt?: string;
  durationMs?: number;
}

export class EvaluationResult {
  public readonly overallScore: number;
  public readonly grade: 'A' | 'B' | 'C' | 'D' | 'F';
  public readonly summary: string;
  public readonly criteria: CriterionEvaluation[];
  public readonly strengths: string[];
  public readonly keyAreasForImprovement: string[];
  public readonly evaluatedBy: 'deterministic' | 'heuristic' | 'llm-hybrid';
  public readonly evaluatedAt: Date;
  public readonly durationMs: number;

  constructor(payload: {
    overallScore?: number;
    grade?: 'A' | 'B' | 'C' | 'D' | 'F';
    summary: string;
    criteria: (CriterionEvaluation | ICriterionEvaluationPayload)[];
    strengths: string[];
    keyAreasForImprovement: string[];
    evaluatedBy: 'deterministic' | 'heuristic' | 'llm-hybrid';
    evaluatedAt?: Date | string;
    durationMs?: number;
  }) {
    this.criteria = payload.criteria.map((c) =>
      c instanceof CriterionEvaluation ? c : new CriterionEvaluation(c)
    );

    // Compute overall score if not provided
    if (typeof payload.overallScore === 'number') {
      this.overallScore = Math.max(0, Math.min(100, Math.round(payload.overallScore)));
    } else {
      const calculatedScore = this.criteria.reduce((acc, c) => acc + c.getWeightedScore(), 0);
      this.overallScore = Math.round(calculatedScore);
    }

    this.grade = payload.grade || EvaluationResult.calculateGrade(this.overallScore);
    this.summary = payload.summary;
    this.strengths = payload.strengths;
    this.keyAreasForImprovement = payload.keyAreasForImprovement;
    this.evaluatedBy = payload.evaluatedBy;
    this.evaluatedAt = payload.evaluatedAt
      ? new Date(payload.evaluatedAt)
      : new Date();
    this.durationMs = payload.durationMs || 0;
  }

  public static calculateGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  public toJSON(): IEvaluationResultPayload {
    return {
      overallScore: this.overallScore,
      grade: this.grade,
      summary: this.summary,
      criteria: this.criteria.map((c) => c.toJSON()),
      strengths: this.strengths,
      keyAreasForImprovement: this.keyAreasForImprovement,
      evaluatedBy: this.evaluatedBy,
      evaluatedAt: this.evaluatedAt.toISOString(),
      durationMs: this.durationMs,
    };
  }

  public static fromJSON(json: any): EvaluationResult {
    return new EvaluationResult({
      overallScore: json.overallScore,
      grade: json.grade,
      summary: json.summary,
      criteria: json.criteria,
      strengths: json.strengths,
      keyAreasForImprovement: json.keyAreasForImprovement,
      evaluatedBy: json.evaluatedBy,
      evaluatedAt: json.evaluatedAt,
      durationMs: json.durationMs,
    });
  }
}
