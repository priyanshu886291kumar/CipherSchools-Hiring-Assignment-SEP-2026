import { IEvaluationStrategy } from '../../domain/interfaces/IEvaluationStrategy';
import { ISubmissionValidator, ValidationResult } from '../../domain/interfaces/ISubmissionValidator';
import { Problem } from '../../domain/entities/Problem';
import { Submission } from '../../domain/entities/Submission';
import { EvaluationResult } from '../../domain/entities/Evaluation';
import { DeterministicSubmissionValidator } from '../validators/DeterministicSubmissionValidator';
import { HeuristicRubricEvaluator } from './HeuristicRubricEvaluator';
import { LlmRubricEvaluator } from './LlmRubricEvaluator';

export class CompositeEvaluationPipeline {
  private strategies: IEvaluationStrategy[] = [];
  private validator: ISubmissionValidator;

  constructor(
    strategies?: IEvaluationStrategy[],
    validator?: ISubmissionValidator
  ) {
    this.validator = validator || new DeterministicSubmissionValidator();

    if (strategies && strategies.length > 0) {
      this.strategies = strategies;
    } else {
      // Default pipeline: Try LLM first, fallback to Heuristic
      this.strategies = [
        new LlmRubricEvaluator(),
        new HeuristicRubricEvaluator(),
      ];
    }
  }

  public registerStrategy(strategy: IEvaluationStrategy): void {
    this.strategies.unshift(strategy); // Priority order
  }

  public validate(submission: Submission, problem: Problem): ValidationResult {
    return this.validator.validate(submission, problem);
  }

  public async evaluate(submission: Submission, problem: Problem): Promise<EvaluationResult> {
    const validation = this.validate(submission, problem);
    if (!validation.isValid) {
      throw new Error(`Submission failed pre-flight validation: ${validation.errors.join('; ')}`);
    }

    let lastError: Error | null = null;

    for (const strategy of this.strategies) {
      if (strategy.supports(submission.format)) {
        try {
          const result = await strategy.evaluate(submission, problem);
          return result;
        } catch (error: any) {
          console.warn(`Evaluator strategy ${strategy.name} failed:`, error?.message);
          lastError = error;
        }
      }
    }

    throw new Error(`All evaluation strategies failed. Last error: ${lastError?.message || 'Unknown error'}`);
  }
}
