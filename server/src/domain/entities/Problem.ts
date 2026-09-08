import { Difficulty } from '../enums/Difficulty';
import { Rubric } from './Rubric';

export interface IProblemPayload {
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
  rubric?: Rubric;
}

export class Problem {
  public readonly id: string;
  public readonly slug: string;
  public readonly title: string;
  public readonly difficulty: Difficulty;
  public readonly estimatedMinutes: number;
  public readonly shortDescription: string;
  public readonly fullDescription: string;
  public readonly functionalRequirements: string[];
  public readonly nonFunctionalRequirements: string[];
  public readonly constraints: string[];
  public readonly hints: string[];
  public readonly keyEntitiesExpected: string[];
  public readonly sampleApproach?: string;
  public readonly starterTemplate?: {
    requirementsAndAssumptions?: string;
    classModelTextOrDiagram?: string;
    designPatternsRationale?: string;
    implementationCode?: string;
    tradeoffsAndEdgeCases?: string;
  };
  public readonly rubric: Rubric;

  constructor(payload: IProblemPayload) {
    this.id = payload.id;
    this.slug = payload.slug;
    this.title = payload.title;
    this.difficulty = payload.difficulty;
    this.estimatedMinutes = payload.estimatedMinutes || 45;
    this.shortDescription = payload.shortDescription;
    this.fullDescription = payload.fullDescription;
    this.functionalRequirements = payload.functionalRequirements;
    this.nonFunctionalRequirements = payload.nonFunctionalRequirements;
    this.constraints = payload.constraints;
    this.hints = payload.hints;
    this.keyEntitiesExpected = payload.keyEntitiesExpected;
    this.sampleApproach = payload.sampleApproach;
    this.starterTemplate = payload.starterTemplate;
    this.rubric = payload.rubric || Rubric.defaultRubric();
  }

  public toJSON(): IProblemPayload {
    return {
      id: this.id,
      slug: this.slug,
      title: this.title,
      difficulty: this.difficulty,
      estimatedMinutes: this.estimatedMinutes,
      shortDescription: this.shortDescription,
      fullDescription: this.fullDescription,
      functionalRequirements: this.functionalRequirements,
      nonFunctionalRequirements: this.nonFunctionalRequirements,
      constraints: this.constraints,
      hints: this.hints,
      keyEntitiesExpected: this.keyEntitiesExpected,
      sampleApproach: this.sampleApproach,
      starterTemplate: this.starterTemplate,
      rubric: this.rubric,
    };
  }
}
