export interface ISubmissionPayload {
  requirementsAndAssumptions: string;
  classModelTextOrDiagram: string;
  designPatternsRationale: string;
  implementationCode: string;
  tradeoffsAndEdgeCases?: string;
  format?: 'structured_hybrid' | 'code_only' | 'text_only';
}

export class Submission {
  public readonly requirementsAndAssumptions: string;
  public readonly classModelTextOrDiagram: string;
  public readonly designPatternsRationale: string;
  public readonly implementationCode: string;
  public readonly tradeoffsAndEdgeCases: string;
  public readonly format: 'structured_hybrid' | 'code_only' | 'text_only';
  public readonly submittedAt: Date;

  constructor(payload: ISubmissionPayload, submittedAt: Date = new Date()) {
    this.requirementsAndAssumptions = payload.requirementsAndAssumptions?.trim() || '';
    this.classModelTextOrDiagram = payload.classModelTextOrDiagram?.trim() || '';
    this.designPatternsRationale = payload.designPatternsRationale?.trim() || '';
    this.implementationCode = payload.implementationCode?.trim() || '';
    this.tradeoffsAndEdgeCases = payload.tradeoffsAndEdgeCases?.trim() || '';
    this.format = payload.format || 'structured_hybrid';
    this.submittedAt = submittedAt;
  }

  public getTotalLength(): number {
    return (
      this.requirementsAndAssumptions.length +
      this.classModelTextOrDiagram.length +
      this.designPatternsRationale.length +
      this.implementationCode.length +
      this.tradeoffsAndEdgeCases.length
    );
  }

  public getSectionCompleteness(): {
    hasRequirements: boolean;
    hasClassModel: boolean;
    hasPatterns: boolean;
    hasCode: boolean;
    hasTradeoffs: boolean;
    completenessRatio: number;
  } {
    const hasRequirements = this.requirementsAndAssumptions.length >= 20;
    const hasClassModel = this.classModelTextOrDiagram.length >= 30;
    const hasPatterns = this.designPatternsRationale.length >= 20;
    const hasCode = this.implementationCode.length >= 40;
    const hasTradeoffs = this.tradeoffsAndEdgeCases.length >= 20;

    const completedCount = [hasRequirements, hasClassModel, hasPatterns, hasCode, hasTradeoffs].filter(Boolean).length;
    return {
      hasRequirements,
      hasClassModel,
      hasPatterns,
      hasCode,
      hasTradeoffs,
      completenessRatio: completedCount / 5,
    };
  }

  public toJSON(): ISubmissionPayload & { submittedAt: string } {
    return {
      requirementsAndAssumptions: this.requirementsAndAssumptions,
      classModelTextOrDiagram: this.classModelTextOrDiagram,
      designPatternsRationale: this.designPatternsRationale,
      implementationCode: this.implementationCode,
      tradeoffsAndEdgeCases: this.tradeoffsAndEdgeCases,
      format: this.format,
      submittedAt: this.submittedAt.toISOString(),
    };
  }

  public static fromJSON(json: any): Submission {
    return new Submission(
      {
        requirementsAndAssumptions: json.requirementsAndAssumptions,
        classModelTextOrDiagram: json.classModelTextOrDiagram,
        designPatternsRationale: json.designPatternsRationale,
        implementationCode: json.implementationCode,
        tradeoffsAndEdgeCases: json.tradeoffsAndEdgeCases,
        format: json.format,
      },
      json.submittedAt ? new Date(json.submittedAt) : new Date()
    );
  }
}
