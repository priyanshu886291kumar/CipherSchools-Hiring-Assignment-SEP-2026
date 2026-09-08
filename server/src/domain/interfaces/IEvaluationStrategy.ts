import { Problem } from '../entities/Problem';
import { Submission } from '../entities/Submission';
import { EvaluationResult } from '../entities/Evaluation';

export interface IEvaluationStrategy {
  readonly name: string;
  supports(format: string): boolean;
  evaluate(submission: Submission, problem: Problem): Promise<EvaluationResult>;
}
