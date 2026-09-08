import { HeuristicRubricEvaluator } from '../../src/services/evaluators/HeuristicRubricEvaluator';
import { Submission } from '../../src/domain/entities/Submission';
import { sampleProblems } from '../../src/data/sampleProblems';
import { RubricDimension } from '../../src/domain/enums/RubricDimension';

describe('HeuristicRubricEvaluator', () => {
  const evaluator = new HeuristicRubricEvaluator();
  const problem = sampleProblems[0]; // Parking Lot

  it('should evaluate 6 rubric dimensions with evidence, concern, and suggestion', async () => {
    const submission = new Submission({
      requirementsAndAssumptions: 'In-memory parking lot with multiple floors, vehicle types: Motorcycle, Car, Truck. Tickets issued on entry.',
      classModelTextOrDiagram: `
        class ParkingLot { -List<ParkingFloor> floors; +Ticket park(Vehicle v); }
        class ParkingFloor { -List<ParkingSpot> spots; }
        class ParkingSpot { -boolean occupied; -SpotType type; }
        interface IPricingStrategy { double calculate(Ticket t); }
      `,
      designPatternsRationale: 'Applied Strategy pattern for IPricingStrategy and Factory pattern for Vehicle instances.',
      implementationCode: `
        public interface IPricingStrategy {
          double calculate(Ticket t);
        }
        public class HourlyPricingStrategy implements IPricingStrategy {
          public double calculate(Ticket t) { return 10.0; }
        }
        public class ParkingSpot {
          private boolean occupied;
          private String id;
          public synchronized boolean park(Vehicle v) {
            if (occupied) return false;
            this.occupied = true;
            return true;
          }
        }
      `,
      tradeoffsAndEdgeCases: 'Used synchronized methods for thread-safe spot locking to prevent double booking. Tradeoff: contention at high volume.',
    });

    const result = await evaluator.evaluate(submission, problem);

    expect(result.overallScore).toBeGreaterThanOrEqual(75);
    expect(result.criteria.length).toBe(6);

    const dims = result.criteria.map((c) => c.dimension);
    expect(dims).toContain(RubricDimension.REQUIREMENT_ANALYSIS);
    expect(dims).toContain(RubricDimension.CLASS_RESPONSIBILITY);
    expect(dims).toContain(RubricDimension.COUPLING_ENCAPSULATION);
    expect(dims).toContain(RubricDimension.DESIGN_PATTERNS);
    expect(dims).toContain(RubricDimension.EXTENSIBILITY_TRADEOFFS);
    expect(dims).toContain(RubricDimension.EDGE_CASES_TESTABILITY);

    // Verify structured shape
    result.criteria.forEach((criterion) => {
      expect(criterion.score).toBeGreaterThan(0);
      expect(criterion.evidence.length).toBeGreaterThan(0);
      expect(criterion.concern.length).toBeGreaterThan(0);
      expect(criterion.suggestion.length).toBeGreaterThan(0);
      expect(criterion.confidence).toBeGreaterThan(0);
    });

    expect(result.strengths.length).toBeGreaterThan(0);
    expect(result.keyAreasForImprovement.length).toBeGreaterThan(0);
    expect(result.evaluatedBy).toBe('heuristic');
  });

  it('should penalize designs that lack interfaces, lack patterns, and lack thread safety', async () => {
    const poorSubmission = new Submission({
      requirementsAndAssumptions: 'park cars in lot',
      classModelTextOrDiagram: 'class Lot { park() {} }',
      designPatternsRationale: 'none used',
      implementationCode: 'function park(c) { return "ok"; }',
      tradeoffsAndEdgeCases: 'none',
    });

    const result = await evaluator.evaluate(poorSubmission, problem);
    expect(result.overallScore).toBeLessThan(65);
    expect(result.keyAreasForImprovement.length).toBeGreaterThan(0);
  });
});
