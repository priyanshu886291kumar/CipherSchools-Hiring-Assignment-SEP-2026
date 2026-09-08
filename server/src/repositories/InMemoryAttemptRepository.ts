import { IAttemptRepository } from '../domain/interfaces/IAttemptRepository';
import { Attempt } from '../domain/entities/Attempt';

export class InMemoryAttemptRepository implements IAttemptRepository {
  private attempts: Map<string, Attempt> = new Map();

  public async findById(id: string): Promise<Attempt | null> {
    return this.attempts.get(id) || null;
  }

  public async findByProblemAndLearner(problemId: string, learnerId: string): Promise<Attempt[]> {
    const all = Array.from(this.attempts.values());
    return all
      .filter((a) => a.problemId === problemId && a.learnerId === learnerId)
      .sort((a, b) => a.attemptNumber - b.attemptNumber);
  }

  public async findByLearner(learnerId: string): Promise<Attempt[]> {
    const all = Array.from(this.attempts.values());
    return all
      .filter((a) => a.learnerId === learnerId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  public async save(attempt: Attempt): Promise<Attempt> {
    this.attempts.set(attempt.id, attempt);
    return attempt;
  }

  public async getNextAttemptNumber(problemId: string, learnerId: string): Promise<number> {
    const existing = await this.findByProblemAndLearner(problemId, learnerId);
    return existing.length + 1;
  }

  public async count(): Promise<number> {
    return this.attempts.size;
  }
}
