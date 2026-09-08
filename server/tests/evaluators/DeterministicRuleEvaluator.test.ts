import { DeterministicSubmissionValidator } from '../../src/services/validators/DeterministicSubmissionValidator';
import { Submission } from '../../src/domain/entities/Submission';
import { sampleProblems } from '../../src/data/sampleProblems';

describe('DeterministicSubmissionValidator', () => {
  const validator = new DeterministicSubmissionValidator();
  const problem = sampleProblems[0];

  it('should reject empty or extremely short submissions', () => {
    const emptySub = new Submission({
      requirementsAndAssumptions: '',
      classModelTextOrDiagram: '',
      designPatternsRationale: '',
      implementationCode: '',
    });

    const result = validator.validate(emptySub, problem);
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('should reject submissions with placeholder dummy text', () => {
    const dummySub = new Submission({
      requirementsAndAssumptions: 'Lorem ipsum dolor sit amet',
      classModelTextOrDiagram: 'asdf asdf asdf asdf asdf asdf asdf',
      designPatternsRationale: 'TODO: add code later',
      implementationCode: 'TODO: add code',
    });

    const result = validator.validate(dummySub, problem);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes('dummy'))).toBe(true);
  });

  it('should accept well-structured submissions and provide warnings for omitted optional context', () => {
    const validSub = new Submission({
      requirementsAndAssumptions: 'Assumptions: 3 floors, 150 spots total. Concurrent gates.',
      classModelTextOrDiagram: 'class ParkingLot { List<ParkingFloor> floors; } class ParkingFloor {}',
      designPatternsRationale: 'Strategy pattern for pricing.',
      implementationCode: 'public class ParkingLot { private List<ParkingFloor> floors; }',
      tradeoffsAndEdgeCases: 'Tradeoffs between sync lock vs concurrent maps.',
    });

    const result = validator.validate(validSub, problem);
    expect(result.isValid).toBe(true);
    expect(result.errors.length).toBe(0);
  });
});
