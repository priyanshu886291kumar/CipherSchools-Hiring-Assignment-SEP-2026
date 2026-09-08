import { Submission } from '../../src/domain/entities/Submission';

describe('Submission Entity', () => {
  it('should accurately calculate completeness ratios', () => {
    const fullSubmission = new Submission({
      requirementsAndAssumptions: 'Detailed functional and non-functional requirements with assumptions.',
      classModelTextOrDiagram: 'class ParkingLot { List<Floor> floors; Spot findSpot(); }',
      designPatternsRationale: 'Strategy pattern for pricing algorithms and Factory for vehicle creation.',
      implementationCode: 'public class ParkingLot { private List<Floor> floors; }',
      tradeoffsAndEdgeCases: 'Concurrency vs simplicity trade-offs and handling spot exhaustion.',
    });

    const completeness = fullSubmission.getSectionCompleteness();
    expect(completeness.hasRequirements).toBe(true);
    expect(completeness.hasClassModel).toBe(true);
    expect(completeness.hasPatterns).toBe(true);
    expect(completeness.hasCode).toBe(true);
    expect(completeness.hasTradeoffs).toBe(true);
    expect(completeness.completenessRatio).toBe(1.0);
  });

  it('should detect partial submissions', () => {
    const partialSubmission = new Submission({
      requirementsAndAssumptions: 'Short reqs',
      classModelTextOrDiagram: '',
      designPatternsRationale: '',
      implementationCode: 'class X {}',
      tradeoffsAndEdgeCases: '',
    });

    const completeness = partialSubmission.getSectionCompleteness();
    expect(completeness.hasClassModel).toBe(false);
    expect(completeness.hasPatterns).toBe(false);
    expect(completeness.completenessRatio).toBeLessThan(0.5);
  });
});
