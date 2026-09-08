import { Attempt } from '../../src/domain/entities/Attempt';
import { AttemptStatus } from '../../src/domain/enums/AttemptStatus';
import { Submission } from '../../src/domain/entities/Submission';
import { EvaluationResult, CriterionEvaluation } from '../../src/domain/entities/Evaluation';
import { RubricDimension } from '../../src/domain/enums/RubricDimension';

describe('Attempt Domain Entity & State Machine', () => {
  const dummySubmission = new Submission({
    requirementsAndAssumptions: 'Multi-floor parking lot with 3 floors.',
    classModelTextOrDiagram: 'class ParkingLot { List<Floor> floors; }',
    designPatternsRationale: 'Strategy pattern for pricing algorithm.',
    implementationCode: 'public class ParkingLot {}',
    tradeoffsAndEdgeCases: 'Tradeoff between in-memory lock vs distributed redis lock.',
  });

  const dummyEvaluation = new EvaluationResult({
    overallScore: 85,
    summary: 'Great design',
    criteria: [
      new CriterionEvaluation({
        dimension: RubricDimension.REQUIREMENT_ANALYSIS,
        criterion: 'Requirement Understanding',
        score: 85,
        weight: 15,
        evidence: 'Multi-floor parking lot with 3 floors.',
        concern: 'None',
        suggestion: 'None',
        confidence: 0.9,
      }),
    ],
    strengths: ['Clear class design'],
    keyAreasForImprovement: ['Add error boundaries'],
    evaluatedBy: 'heuristic',
  });

  it('should initialize in CREATED state with attempt number', () => {
    const attempt = new Attempt({
      id: 'att-1',
      problemId: 'prob-1',
      learnerId: 'learner-1',
      attemptNumber: 1,
    });

    expect(attempt.status).toBe(AttemptStatus.CREATED);
    expect(attempt.submission).toBeNull();
    expect(attempt.evaluation).toBeNull();
    expect(attempt.attemptNumber).toBe(1);
  });

  it('should transition from CREATED to SUBMITTED upon submission', () => {
    const attempt = new Attempt({
      id: 'att-1',
      problemId: 'prob-1',
      learnerId: 'learner-1',
      attemptNumber: 1,
    });

    attempt.submit(dummySubmission);

    expect(attempt.status).toBe(AttemptStatus.SUBMITTED);
    expect(attempt.submission).toBe(dummySubmission);
    expect(attempt.submittedAt).toBeInstanceOf(Date);
  });

  it('should transition from SUBMITTED to EVALUATING to COMPLETED', () => {
    const attempt = new Attempt({
      id: 'att-1',
      problemId: 'prob-1',
      learnerId: 'learner-1',
      attemptNumber: 1,
    });

    attempt.submit(dummySubmission);
    attempt.startEvaluation();
    expect(attempt.status).toBe(AttemptStatus.EVALUATING);

    attempt.completeEvaluation(dummyEvaluation);
    expect(attempt.status).toBe(AttemptStatus.COMPLETED);
    expect(attempt.evaluation).toBe(dummyEvaluation);
    expect(attempt.completedAt).toBeInstanceOf(Date);
  });

  it('should handle failure during evaluation and record failureReason', () => {
    const attempt = new Attempt({
      id: 'att-1',
      problemId: 'prob-1',
      learnerId: 'learner-1',
      attemptNumber: 1,
    });

    attempt.submit(dummySubmission);
    attempt.startEvaluation();
    attempt.failEvaluation('Network timeout contacting evaluation engine');

    expect(attempt.status).toBe(AttemptStatus.FAILED);
    expect(attempt.failureReason).toBe('Network timeout contacting evaluation engine');
  });

  it('should prevent illegal state transitions (e.g. completing before evaluating)', () => {
    const attempt = new Attempt({
      id: 'att-1',
      problemId: 'prob-1',
      learnerId: 'learner-1',
      attemptNumber: 1,
    });

    expect(() => attempt.completeEvaluation(dummyEvaluation)).toThrow();
  });
});
