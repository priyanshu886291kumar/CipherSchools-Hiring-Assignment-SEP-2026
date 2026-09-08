import { InMemoryProblemRepository } from '../../src/repositories/InMemoryProblemRepository';
import { InMemoryAttemptRepository } from '../../src/repositories/InMemoryAttemptRepository';
import { ProblemService } from '../../src/services/ProblemService';
import { AttemptService } from '../../src/services/AttemptService';
import { CompositeEvaluationPipeline } from '../../src/services/evaluators/CompositeEvaluationPipeline';
import { sampleProblems } from '../../src/data/sampleProblems';
import { AttemptStatus } from '../../src/domain/enums/AttemptStatus';

describe('End-to-End Attempt Lifecycle & Iteration Integration Flow', () => {
  let attemptService: AttemptService;
  let problemRepo: InMemoryProblemRepository;
  let attemptRepo: InMemoryAttemptRepository;

  beforeEach(() => {
    problemRepo = new InMemoryProblemRepository(sampleProblems);
    attemptRepo = new InMemoryAttemptRepository();
    const pipeline = new CompositeEvaluationPipeline();
    const problemService = new ProblemService(problemRepo);
    attemptService = new AttemptService(attemptRepo, problemRepo, pipeline);
  });

  it('should complete a multi-attempt iterative learning loop: Attempt 1 -> Feedback -> Attempt 2 -> Comparison', async () => {
    const problemId = 'prob-1'; // Parking Lot

    // Step 1: Start Attempt 1
    const attempt1 = await attemptService.createAttempt(problemId, 'learner-101');
    expect(attempt1.status).toBe(AttemptStatus.CREATED);
    expect(attempt1.attemptNumber).toBe(1);

    // Step 2: Submit basic Attempt 1
    const completedAttempt1 = await attemptService.submitAttempt(attempt1.id, {
      requirementsAndAssumptions: 'Parking lot system with 3 floors.',
      classModelTextOrDiagram: 'class ParkingLot { park() {} } class Spot {}',
      designPatternsRationale: 'No patterns applied.',
      implementationCode: 'public class ParkingLot { public void park() {} }',
      tradeoffsAndEdgeCases: 'None analyzed.',
    });

    expect(completedAttempt1.status).toBe(AttemptStatus.COMPLETED);
    expect(completedAttempt1.evaluation).toBeDefined();
    const score1 = completedAttempt1.evaluation!.overallScore;

    // Step 3: Learner creates Attempt 2 addressing feedback
    const attempt2 = await attemptService.createAttempt(problemId, 'learner-101');
    expect(attempt2.attemptNumber).toBe(2);

    // Step 4: Submit refined Attempt 2
    const completedAttempt2 = await attemptService.submitAttempt(attempt2.id, {
      requirementsAndAssumptions: 'Multi-floor parking lot with 3 floors, supporting Motorcycle, Car, Truck, and EV. Nearest spot allocation.',
      classModelTextOrDiagram: `
        class ParkingLot { -List<ParkingFloor> floors; +Ticket park(Vehicle v); }
        class ParkingFloor { -List<ParkingSpot> spots; }
        class ParkingSpot { -boolean occupied; -SpotType type; }
        interface IPricingStrategy { double calculateFee(Ticket t); }
      `,
      designPatternsRationale: 'Used Strategy Pattern for IPricingStrategy and Factory Pattern for Vehicle instantiation.',
      implementationCode: `
        public interface IPricingStrategy { double calculateFee(Ticket t); }
        public class HourlyPricingStrategy implements IPricingStrategy {
          public double calculateFee(Ticket t) { return 5.0; }
        }
        public class ParkingSpot {
          private boolean occupied;
          public synchronized boolean park(Vehicle v) {
            if (occupied) return false;
            this.occupied = true;
            return true;
          }
        }
      `,
      tradeoffsAndEdgeCases: 'Thread-safety handled with synchronized methods on ParkingSpot. Extensibility achieved through IPricingStrategy.',
    });

    expect(completedAttempt2.status).toBe(AttemptStatus.COMPLETED);
    const score2 = completedAttempt2.evaluation!.overallScore;

    // Verify improvement
    expect(score2).toBeGreaterThan(score1);

    // Step 5: Run Comparison Analytics
    const comparison = await attemptService.compareAttempts(attempt1.id, attempt2.id);
    expect(comparison.scoreDelta).toBe(score2 - score1);
    expect(comparison.scoreDelta).toBeGreaterThan(0);
    expect(comparison.dimensionDeltas.length).toBe(6);
    expect(comparison.improvementSummary).toContain('Great progress');
  });
});
