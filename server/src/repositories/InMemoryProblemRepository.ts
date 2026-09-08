import { IProblemRepository } from '../domain/interfaces/IProblemRepository';
import { Problem } from '../domain/entities/Problem';

export class InMemoryProblemRepository implements IProblemRepository {
  private problems: Map<string, Problem> = new Map();

  constructor(initialProblems?: Problem[]) {
    if (initialProblems) {
      initialProblems.forEach((p) => this.save(p));
    }
  }

  public async findAll(): Promise<Problem[]> {
    return Array.from(this.problems.values());
  }

  public async findById(id: string): Promise<Problem | null> {
    return this.problems.get(id) || null;
  }

  public async findBySlug(slug: string): Promise<Problem | null> {
    const all = Array.from(this.problems.values());
    return all.find((p) => p.slug === slug) || null;
  }

  public async save(problem: Problem): Promise<Problem> {
    this.problems.set(problem.id, problem);
    return problem;
  }
}
