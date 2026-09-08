import { IProblemRepository } from '../domain/interfaces/IProblemRepository';
import { Problem } from '../domain/entities/Problem';

export class ProblemService {
  constructor(private problemRepo: IProblemRepository) {}

  public async getAllProblems(): Promise<Problem[]> {
    return this.problemRepo.findAll();
  }

  public async getProblemById(id: string): Promise<Problem> {
    const problem = await this.problemRepo.findById(id);
    if (!problem) {
      throw new Error(`Problem with ID ${id} not found.`);
    }
    return problem;
  }

  public async getProblemBySlug(slug: string): Promise<Problem> {
    const problem = await this.problemRepo.findBySlug(slug);
    if (!problem) {
      throw new Error(`Problem with slug ${slug} not found.`);
    }
    return problem;
  }
}
