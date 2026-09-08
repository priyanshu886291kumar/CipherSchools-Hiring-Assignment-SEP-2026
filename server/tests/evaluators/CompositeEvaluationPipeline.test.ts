import { CompositeEvaluationPipeline } from '../../src/services/evaluators/CompositeEvaluationPipeline';
import { HeuristicRubricEvaluator } from '../../src/services/evaluators/HeuristicRubricEvaluator';
import { IEvaluationStrategy } from '../../src/domain/interfaces/IEvaluationStrategy';
import { Submission } from '../../src/domain/entities/Submission';
import { sampleProblems } from '../../src/data/sampleProblems';

describe('CompositeEvaluationPipeline & Extensibility (Change Test B)', () => {
  const problem = sampleProblems[0];

  const validSubmission = new Submission({
    requirementsAndAssumptions: 'Multi-floor parking lot with spots for cars and trucks.',
    classModelTextOrDiagram: 'class ParkingLot { List<Floor> floors; }',
    designPatternsRationale: 'Strategy pattern for pricing.',
    implementationCode: 'public class ParkingLot {}',
    tradeoffsAndEdgeCases: 'Concurrency handled via mutex locks.',
  });

  it('should successfully evaluate using default strategies', async () => {
    const pipeline = new CompositeEvaluationPipeline();
    const result = await pipeline.evaluate(validSubmission, problem);

    expect(result).toBeDefined();
    expect(result.overallScore).toBeGreaterThan(0);
    expect(result.criteria.length).toBe(6);
  });

  it('should allow registering custom evaluation strategies without breaking the pipeline', async () => {
    const pipeline = new CompositeEvaluationPipeline();

    // Mock custom evaluator (e.g. AST analyzer or Peer Review)
    const mockCustomStrategy: IEvaluationStrategy = {
      name: 'CustomAstEvaluator',
      supports: (format: string) => true,
      evaluate: async (sub, prob) => {
        const heuristic = new HeuristicRubricEvaluator();
        const base = await heuristic.evaluate(sub, prob);
        return {
          ...base,
          evaluatedBy: 'deterministic' as any,
          summary: 'Evaluated by CustomAstEvaluator plugin',
        } as any;
      },
    };

    pipeline.registerStrategy(mockCustomStrategy);
    const result = await pipeline.evaluate(validSubmission, problem);

    expect(result.summary).toBe('Evaluated by CustomAstEvaluator plugin');
  });

  it('should fail gracefully if submission fails validation', async () => {
    const pipeline = new CompositeEvaluationPipeline();
    const invalidSubmission = new Submission({
      requirementsAndAssumptions: '',
      classModelTextOrDiagram: '',
      designPatternsRationale: '',
      implementationCode: '',
    });

    await expect(pipeline.evaluate(invalidSubmission, problem)).rejects.toThrow('Submission failed pre-flight validation');
  });
});
