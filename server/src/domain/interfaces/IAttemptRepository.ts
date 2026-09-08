import { Attempt } from '../entities/Attempt';

export interface IAttemptRepository {
  findById(id: string): Promise<Attempt | null>;
  findByProblemAndLearner(problemId: string, learnerId: string): Promise<Attempt[]>;
  findByLearner(learnerId: string): Promise<Attempt[]>;
  save(attempt: Attempt): Promise<Attempt>;
  getNextAttemptNumber(problemId: string, learnerId: string): Promise<number>;
  count(): Promise<number>;
}
