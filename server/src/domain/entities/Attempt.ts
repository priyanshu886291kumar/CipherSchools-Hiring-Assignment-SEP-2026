import { AttemptStatus } from '../enums/AttemptStatus';
import { Submission } from './Submission';
import { EvaluationResult } from './Evaluation';

export interface IAttemptPayload {
  id: string;
  problemId: string;
  learnerId: string;
  attemptNumber: number;
  status: AttemptStatus;
  submission: Submission | null;
  evaluation: EvaluationResult | null;
  failureReason: string | null;
  createdAt: Date;
  updatedAt: Date;
  submittedAt: Date | null;
  completedAt: Date | null;
}

export class Attempt {
  public readonly id: string;
  public readonly problemId: string;
  public readonly learnerId: string;
  public readonly attemptNumber: number;
  private _status: AttemptStatus;
  private _submission: Submission | null;
  private _evaluation: EvaluationResult | null;
  private _failureReason: string | null;
  public readonly createdAt: Date;
  private _updatedAt: Date;
  private _submittedAt: Date | null;
  private _completedAt: Date | null;

  constructor(payload: {
    id: string;
    problemId: string;
    learnerId: string;
    attemptNumber: number;
    status?: AttemptStatus;
    submission?: Submission | null;
    evaluation?: EvaluationResult | null;
    failureReason?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    submittedAt?: Date | string | null;
    completedAt?: Date | string | null;
  }) {
    this.id = payload.id;
    this.problemId = payload.problemId;
    this.learnerId = payload.learnerId;
    this.attemptNumber = payload.attemptNumber;
    this._status = payload.status || AttemptStatus.CREATED;
    this._submission = payload.submission || null;
    this._evaluation = payload.evaluation || null;
    this._failureReason = payload.failureReason || null;
    this.createdAt = payload.createdAt ? new Date(payload.createdAt) : new Date();
    this._updatedAt = payload.updatedAt ? new Date(payload.updatedAt) : new Date();
    this._submittedAt = payload.submittedAt ? new Date(payload.submittedAt) : null;
    this._completedAt = payload.completedAt ? new Date(payload.completedAt) : null;
  }

  public get status(): AttemptStatus {
    return this._status;
  }

  public get submission(): Submission | null {
    return this._submission;
  }

  public get evaluation(): EvaluationResult | null {
    return this._evaluation;
  }

  public get failureReason(): string | null {
    return this._failureReason;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }

  public get submittedAt(): Date | null {
    return this._submittedAt;
  }

  public get completedAt(): Date | null {
    return this._completedAt;
  }

  public canTransitionTo(targetStatus: AttemptStatus): boolean {
    switch (this._status) {
      case AttemptStatus.CREATED:
        return targetStatus === AttemptStatus.SUBMITTED;
      case AttemptStatus.SUBMITTED:
        return targetStatus === AttemptStatus.EVALUATING || targetStatus === AttemptStatus.FAILED;
      case AttemptStatus.EVALUATING:
        return targetStatus === AttemptStatus.COMPLETED || targetStatus === AttemptStatus.FAILED;
      case AttemptStatus.FAILED:
        return targetStatus === AttemptStatus.SUBMITTED || targetStatus === AttemptStatus.EVALUATING;
      case AttemptStatus.COMPLETED:
        return false; // Terminal state for this specific attempt instance
      default:
        return false;
    }
  }

  public submit(submission: Submission): void {
    if (this._status !== AttemptStatus.CREATED && this._status !== AttemptStatus.FAILED) {
      throw new Error(`Cannot submit attempt in state: ${this._status}`);
    }
    this._submission = submission;
    this._status = AttemptStatus.SUBMITTED;
    this._submittedAt = new Date();
    this._updatedAt = new Date();
    this._failureReason = null;
  }

  public startEvaluation(): void {
    if (this._status !== AttemptStatus.SUBMITTED && this._status !== AttemptStatus.FAILED) {
      throw new Error(`Cannot start evaluation from state: ${this._status}`);
    }
    this._status = AttemptStatus.EVALUATING;
    this._updatedAt = new Date();
  }

  public completeEvaluation(result: EvaluationResult): void {
    if (this._status !== AttemptStatus.EVALUATING) {
      throw new Error(`Cannot complete evaluation from state: ${this._status}`);
    }
    this._evaluation = result;
    this._status = AttemptStatus.COMPLETED;
    this._completedAt = new Date();
    this._updatedAt = new Date();
    this._failureReason = null;
  }

  public failEvaluation(reason: string): void {
    this._status = AttemptStatus.FAILED;
    this._failureReason = reason;
    this._updatedAt = new Date();
  }

  public toJSON(): any {
    return {
      id: this.id,
      problemId: this.problemId,
      learnerId: this.learnerId,
      attemptNumber: this.attemptNumber,
      status: this._status,
      submission: this._submission ? this._submission.toJSON() : null,
      evaluation: this._evaluation ? this._evaluation.toJSON() : null,
      failureReason: this._failureReason,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
      submittedAt: this._submittedAt ? this._submittedAt.toISOString() : null,
      completedAt: this._completedAt ? this._completedAt.toISOString() : null,
    };
  }

  public static fromJSON(json: any): Attempt {
    return new Attempt({
      id: json.id,
      problemId: json.problemId,
      learnerId: json.learnerId,
      attemptNumber: json.attemptNumber,
      status: json.status,
      submission: json.submission ? Submission.fromJSON(json.submission) : null,
      evaluation: json.evaluation ? EvaluationResult.fromJSON(json.evaluation) : null,
      failureReason: json.failureReason,
      createdAt: json.createdAt,
      updatedAt: json.updatedAt,
      submittedAt: json.submittedAt,
      completedAt: json.completedAt,
    });
  }
}
