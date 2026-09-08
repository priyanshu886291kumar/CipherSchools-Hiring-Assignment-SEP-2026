import { v4 as uuidv4 } from 'uuid';
import { IAttemptRepository } from '../domain/interfaces/IAttemptRepository';
import { IProblemRepository } from '../domain/interfaces/IProblemRepository';
import { Attempt } from '../domain/entities/Attempt';
import { Submission, ISubmissionPayload } from '../domain/entities/Submission';
import { CompositeEvaluationPipeline } from './evaluators/CompositeEvaluationPipeline';
import { AttemptStatus } from '../domain/enums/AttemptStatus';

export interface IAttemptComparison {
  attempt1: any;
  attempt2: any;
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

export class AttemptService {
  constructor(
    private attemptRepo: IAttemptRepository,
    private problemRepo: IProblemRepository,
    private pipeline: CompositeEvaluationPipeline
  ) {}

  public async createAttempt(problemId: string, learnerId: string = 'default-learner'): Promise<Attempt> {
    const problem = await this.problemRepo.findById(problemId);
    if (!problem) {
      throw new Error(`Problem ${problemId} does not exist.`);
    }

    const attemptNumber = await this.attemptRepo.getNextAttemptNumber(problemId, learnerId);
    const attempt = new Attempt({
      id: uuidv4(),
      problemId,
      learnerId,
      attemptNumber,
      status: AttemptStatus.CREATED,
    });

    return this.attemptRepo.save(attempt);
  }

  public async getAttempt(id: string): Promise<Attempt> {
    const attempt = await this.attemptRepo.findById(id);
    if (!attempt) {
      throw new Error(`Attempt with ID ${id} not found.`);
    }
    return attempt;
  }

  public async getAttemptsForProblem(problemId: string, learnerId: string = 'default-learner'): Promise<Attempt[]> {
    return this.attemptRepo.findByProblemAndLearner(problemId, learnerId);
  }

  public async getAttemptsForLearner(learnerId: string = 'default-learner'): Promise<Attempt[]> {
    return this.attemptRepo.findByLearner(learnerId);
  }

  public async submitAttempt(
    attemptId: string,
    payload: ISubmissionPayload,
    isAsync: boolean = false
  ): Promise<Attempt> {
    const attempt = await this.getAttempt(attemptId);
    const problem = await this.problemRepo.findById(attempt.problemId);
    if (!problem) {
      throw new Error(`Problem associated with attempt ${attemptId} not found.`);
    }

    // Step 1: Create domain submission
    const submission = new Submission(payload);

    // Step 2: Validate transition and update attempt state to SUBMITTED
    attempt.submit(submission);
    await this.attemptRepo.save(attempt);

    // Step 3: Run evaluation (synchronously or background task)
    if (isAsync) {
      // Trigger evaluation in background and return immediate submitted state
      this.executeEvaluationAsync(attempt, submission, problem);
      return attempt;
    } else {
      await this.executeEvaluation(attempt, submission, problem);
      return attempt;
    }
  }

  private async executeEvaluation(attempt: Attempt, submission: Submission, problem: any): Promise<void> {
    try {
      attempt.startEvaluation();
      await this.attemptRepo.save(attempt);

      const evaluationResult = await this.pipeline.evaluate(submission, problem);
      attempt.completeEvaluation(evaluationResult);
      await this.attemptRepo.save(attempt);
    } catch (error: any) {
      const errorMessage = error?.message || 'An unexpected evaluation error occurred.';
      attempt.failEvaluation(errorMessage);
      await this.attemptRepo.save(attempt);
      throw error;
    }
  }

  private executeEvaluationAsync(attempt: Attempt, submission: Submission, problem: any): void {
    setImmediate(async () => {
      try {
        await this.executeEvaluation(attempt, submission, problem);
      } catch (err) {
        console.error(`Async evaluation failed for attempt ${attempt.id}:`, err);
      }
    });
  }

  public async retryEvaluation(attemptId: string): Promise<Attempt> {
    const attempt = await this.getAttempt(attemptId);
    if (!attempt.submission) {
      throw new Error(`Cannot retry evaluation for attempt ${attemptId} without an existing submission.`);
    }

    const problem = await this.problemRepo.findById(attempt.problemId);
    if (!problem) {
      throw new Error(`Problem not found.`);
    }

    await this.executeEvaluation(attempt, attempt.submission, problem);
    return attempt;
  }

  public async compareAttempts(attemptId1: string, attemptId2: string): Promise<IAttemptComparison> {
    const a1 = await this.getAttempt(attemptId1);
    const a2 = await this.getAttempt(attemptId2);

    if (!a1.evaluation || !a2.evaluation) {
      throw new Error('Both attempts must be completed with valid evaluations to generate a comparison.');
    }

    const score1 = a1.evaluation.overallScore;
    const score2 = a2.evaluation.overallScore;
    const scoreDelta = score2 - score1;
    const percentageChange = score1 > 0 ? Math.round(((score2 - score1) / score1) * 100) : 0;

    const dimensionDeltas = a1.evaluation.criteria.map((c1) => {
      const c2 = a2.evaluation?.criteria.find((c) => c.dimension === c1.dimension);
      const s2 = c2 ? c2.score : 0;
      return {
        dimension: c1.dimension,
        criterion: c1.criterion,
        score1: c1.score,
        score2: s2,
        delta: s2 - c1.score,
      };
    });

    let improvementSummary = '';
    if (scoreDelta > 0) {
      improvementSummary = `Great progress! Attempt ${a2.attemptNumber} achieved a ${scoreDelta} point improvement (+${percentageChange}%) over Attempt ${a1.attemptNumber}. Strongest gains were made in ${
        dimensionDeltas.sort((a, b) => b.delta - a.delta)[0]?.criterion || 'design structure'
      }.`;
    } else if (scoreDelta === 0) {
      improvementSummary = `Attempt ${a2.attemptNumber} maintained the same overall score (${score2}/100) as Attempt ${a1.attemptNumber}. Review the specific dimension deltas below.`;
    } else {
      improvementSummary = `Attempt ${a2.attemptNumber} scored ${Math.abs(scoreDelta)} points lower than Attempt ${a1.attemptNumber}. Verify that previous architectural strengths were not omitted.`;
    }

    return {
      attempt1: a1.toJSON(),
      attempt2: a2.toJSON(),
      scoreDelta,
      percentageChange,
      dimensionDeltas,
      improvementSummary,
    };
  }
}
