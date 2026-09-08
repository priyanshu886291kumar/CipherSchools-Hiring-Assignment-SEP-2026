import { IEvaluationStrategy } from '../../domain/interfaces/IEvaluationStrategy';
import { Problem } from '../../domain/entities/Problem';
import { Submission } from '../../domain/entities/Submission';
import { CriterionEvaluation, EvaluationResult } from '../../domain/entities/Evaluation';
import { RubricDimension, RubricDimensionMetadata } from '../../domain/enums/RubricDimension';

export class HeuristicRubricEvaluator implements IEvaluationStrategy {
  public readonly name = 'HeuristicRubricEvaluator';

  public supports(format: string): boolean {
    return ['structured_hybrid', 'code_only', 'text_only'].includes(format);
  }

  public async evaluate(submission: Submission, problem: Problem): Promise<EvaluationResult> {
    const startTime = Date.now();
    const criteria: CriterionEvaluation[] = [];
    const strengths: string[] = [];
    const weaknesses: string[] = [];

    const reqEval = this.evaluateRequirements(submission, problem);
    criteria.push(reqEval);

    const respEval = this.evaluateResponsibilities(submission, problem);
    criteria.push(respEval);

    const coupEval = this.evaluateCoupling(submission, problem);
    criteria.push(coupEval);

    const patEval = this.evaluatePatterns(submission, problem);
    criteria.push(patEval);

    const extEval = this.evaluateExtensibility(submission, problem);
    criteria.push(extEval);

    const edgeEval = this.evaluateEdgeCases(submission, problem);
    criteria.push(edgeEval);

    criteria.forEach((c) => {
      if (c.score >= 80) {
        strengths.push(`${c.criterion}: Strong execution (${c.evidence.slice(0, 70)}...)`);
      } else if (c.score <= 65) {
        weaknesses.push(`${c.criterion}: ${c.suggestion}`);
      }
    });

    if (strengths.length === 0) {
      strengths.push('Provided a structured submission covering multiple design sections.');
    }
    if (weaknesses.length === 0) {
      weaknesses.push('Consider detailing more complex multi-threading concurrency race conditions.');
    }

    const calculatedScore = criteria.reduce((sum, c) => sum + c.getWeightedScore(), 0);
    const overallScore = Math.round(calculatedScore);

    const summary = this.generateSummary(overallScore, strengths.length, weaknesses.length, problem.title);

    return new EvaluationResult({
      overallScore,
      summary,
      criteria,
      strengths: strengths.slice(0, 4),
      keyAreasForImprovement: weaknesses.slice(0, 4),
      evaluatedBy: 'heuristic',
      durationMs: Date.now() - startTime,
    });
  }

  private evaluateRequirements(submission: Submission, problem: Problem): CriterionEvaluation {
    const weight = problem.rubric.getWeightForDimension(RubricDimension.REQUIREMENT_ANALYSIS);
    const reqText = (submission.requirementsAndAssumptions + ' ' + submission.classModelTextOrDiagram).toLowerCase();

    // Check entity matches
    const matchedEntities = problem.keyEntitiesExpected.filter((entity) =>
      reqText.includes(entity.toLowerCase())
    );

    const matchRatio = matchedEntities.length / Math.max(1, problem.keyEntitiesExpected.length);
    let score = Math.round(50 + matchRatio * 45);

    let evidence = '';
    let concern = '';
    let suggestion = '';

    if (matchedEntities.length > 0) {
      evidence = `Identified core domain entities: [${matchedEntities.join(', ')}].`;
    } else {
      evidence = submission.requirementsAndAssumptions.slice(0, 100) || 'Minimal requirements text provided.';
    }

    if (matchRatio < 0.5) {
      score = Math.max(40, score - 20);
      concern = `Missed several key domain entities expected for ${problem.title} (e.g. ${problem.keyEntitiesExpected.slice(0, 3).join(', ')}).`;
      suggestion = `Explicitly list core domain nouns and define assumptions on capacity, concurrency, and actor boundaries before coding.`;
    } else if (submission.requirementsAndAssumptions.length < 30) {
      score = Math.max(55, score - 15);
      concern = `Requirements & assumptions section was very brief, making it unclear what edge constraints were scoped out.`;
      suggestion = `Document explicit assumptions (e.g. single vs multi-threaded, in-memory vs persisted, sync vs async).`;
    } else {
      concern = `Good coverage of primary problem scope.`;
      suggestion = `Refine non-functional constraints (e.g., SLA latency, peak throughput) in your assumptions.`;
    }

    return new CriterionEvaluation({
      dimension: RubricDimension.REQUIREMENT_ANALYSIS,
      criterion: RubricDimensionMetadata[RubricDimension.REQUIREMENT_ANALYSIS].label,
      score,
      weight,
      evidence,
      concern,
      suggestion,
      confidence: 0.9,
    });
  }

  private evaluateResponsibilities(submission: Submission, problem: Problem): CriterionEvaluation {
    const weight = problem.rubric.getWeightForDimension(RubricDimension.CLASS_RESPONSIBILITY);
    const fullText = (
      submission.classModelTextOrDiagram +
      '\n' +
      submission.implementationCode
    );

    // Count classes or interfaces
    const classMatches = fullText.match(/(?:class|interface|type|struct)\s+([A-Za-z0-9_]+)/g) || [];
    const classCount = classMatches.length;

    let score = 60;
    let evidence = '';
    let concern = '';
    let suggestion = '';

    if (classCount >= 4) {
      score = 85;
      evidence = `Defined ${classCount} distinct domain classes/interfaces: ${classMatches.slice(0, 5).join(', ')}.`;
      concern = `Ensure domain entities do not manage their own persistence or presentation logic.`;
      suggestion = `Keep data models pure and move stateful mutation logic into dedicated orchestrators/managers.`;
    } else if (classCount >= 2) {
      score = 70;
      evidence = `Defined classes: ${classMatches.join(', ')}.`;
      concern = `Relatively few classes declared. Risk of monolithic 'Manager' / God-classes absorbing too many distinct responsibilities.`;
      suggestion = `Break monolithic coordinator classes into smaller single-purpose classes (e.g. strategy evaluators, pricing calculators).`;
    } else {
      score = 45;
      evidence = fullText.slice(0, 90) || 'No explicit class or structure definitions found.';
      concern = `Lack of clear class breakdown and Single Responsibility Principle (SRP) separation.`;
      suggestion = `Define explicit classes with specific attributes and methods rather than procedural functions.`;
    }

    return new CriterionEvaluation({
      dimension: RubricDimension.CLASS_RESPONSIBILITY,
      criterion: RubricDimensionMetadata[RubricDimension.CLASS_RESPONSIBILITY].label,
      score,
      weight,
      evidence,
      concern,
      suggestion,
      confidence: 0.88,
    });
  }

  private evaluateCoupling(submission: Submission, problem: Problem): CriterionEvaluation {
    const weight = problem.rubric.getWeightForDimension(RubricDimension.COUPLING_ENCAPSULATION);
    const codeAndModel = (
      submission.classModelTextOrDiagram +
      '\n' +
      submission.implementationCode
    ).toLowerCase();

    const hasInterfaces = /interface|implements|abstract|protocol|trait/.test(codeAndModel);
    const hasEncapsulation = /private|protected|get|set|#/.test(codeAndModel);
    const hasDependencyInjection = /constructor\s*\([^)]*:[^)]*\)|public\s+[A-Za-z0-9_]+\s*\([^)]+\)/.test(
      submission.implementationCode
    );

    let score = 55;
    let evidenceParts: string[] = [];

    if (hasInterfaces) {
      score += 20;
      evidenceParts.push('Uses interfaces/abstractions for polymorphic contracts');
    }
    if (hasEncapsulation) {
      score += 15;
      evidenceParts.push('Applies access modifiers (private/protected) for encapsulation');
    }
    if (hasDependencyInjection) {
      score += 10;
      evidenceParts.push('Passes dependencies through constructors');
    }

    score = Math.min(100, score);
    const evidence = evidenceParts.length > 0 ? evidenceParts.join('; ') : 'Direct concrete class coupling without interface contracts.';

    let concern = '';
    let suggestion = '';

    if (!hasInterfaces) {
      concern = `High coupling to concrete classes without interface boundaries, violating Dependency Inversion Principle.`;
      suggestion = `Introduce interfaces for external strategies, dispatchers, or storage engines so components can be mocked and swapped.`;
    } else if (!hasEncapsulation) {
      concern = `Internal state is exposed directly without accessor methods or private modifiers.`;
      suggestion = `Encapsulate entity fields (e.g. make spots or account balances private) and expose domain-driven methods.`;
    } else {
      concern = `Tight coupling risk is low.`;
      suggestion = `Consider using Factory or Dependency Injection containers to decouple object creation from execution.`;
    }

    return new CriterionEvaluation({
      dimension: RubricDimension.COUPLING_ENCAPSULATION,
      criterion: RubricDimensionMetadata[RubricDimension.COUPLING_ENCAPSULATION].label,
      score,
      weight,
      evidence,
      concern,
      suggestion,
      confidence: 0.85,
    });
  }

  private evaluatePatterns(submission: Submission, problem: Problem): CriterionEvaluation {
    const weight = problem.rubric.getWeightForDimension(RubricDimension.DESIGN_PATTERNS);
    const text = (
      submission.designPatternsRationale +
      '\n' +
      submission.classModelTextOrDiagram +
      '\n' +
      submission.implementationCode
    ).toLowerCase();

    const knownPatterns = [
      'strategy',
      'factory',
      'singleton',
      'observer',
      'state',
      'decorator',
      'command',
      'builder',
      'template method',
      'chain of responsibility',
    ];

    const detected = knownPatterns.filter((p) => text.includes(p));

    let score = 50;
    let evidence = '';
    let concern = '';
    let suggestion = '';

    if (detected.length >= 2) {
      score = 88;
      evidence = `Applied design patterns: [${detected.join(', ')}] with rationale.`;
      concern = `Verify pattern isn't over-engineered for simple operations.`;
      suggestion = `Clearly articulate the trade-off of why each pattern was selected over simpler inline logic.`;
    } else if (detected.length === 1) {
      score = 72;
      evidence = `Applied pattern: ${detected[0]}.`;
      concern = `Only single pattern identified. The problem has multiple distinct extension points.`;
      suggestion = `Consider using Strategy for interchangeable algorithms (pricing/scheduling) or State pattern for multi-phase workflows.`;
    } else {
      score = 45;
      evidence = submission.designPatternsRationale.slice(0, 90) || 'No standard design patterns explicitly referenced.';
      concern = `Absence of recognized design patterns may lead to switch/if-else proliferation as requirements grow.`;
      suggestion = `Apply Strategy Pattern for variable algorithms and Factory Pattern for dynamic subclass instantiation.`;
    }

    return new CriterionEvaluation({
      dimension: RubricDimension.DESIGN_PATTERNS,
      criterion: RubricDimensionMetadata[RubricDimension.DESIGN_PATTERNS].label,
      score,
      weight,
      evidence,
      concern,
      suggestion,
      confidence: 0.89,
    });
  }

  private evaluateExtensibility(submission: Submission, problem: Problem): CriterionEvaluation {
    const weight = problem.rubric.getWeightForDimension(RubricDimension.EXTENSIBILITY_TRADEOFFS);
    const text = (
      submission.tradeoffsAndEdgeCases +
      '\n' +
      submission.designPatternsRationale
    ).toLowerCase();

    const hasTradeoffs = /trade-off|tradeoff|versus|vs|complexity|latency|memory|simplicity/.test(text);
    const hasExtensionPoints = /extend|open-closed|plugin|new type|future requirement/.test(text);

    let score = 55;
    let evidence = '';
    let concern = '';
    let suggestion = '';

    if (hasTradeoffs && hasExtensionPoints) {
      score = 90;
      evidence = `Discussed trade-offs and extension points for future modifications (${submission.tradeoffsAndEdgeCases.slice(0, 80)}...).`;
      concern = `None critical.`;
      suggestion = `Quantify the space/time complexity trade-offs under peak concurrent usage.`;
    } else if (hasTradeoffs || hasExtensionPoints) {
      score = 72;
      evidence = `Mentioned architectural choices (${submission.tradeoffsAndEdgeCases.slice(0, 70) || 'Discussed pattern trade-offs'}).`;
      concern = `Trade-off discussion was brief and did not explore alternative design choices.`;
      suggestion = `Discuss: What happens if a new requirement arrives tomorrow (e.g. VIP pricing, dynamic floor allocation)? How does your design support it?`;
    } else {
      score = 48;
      evidence = submission.tradeoffsAndEdgeCases.slice(0, 80) || 'No trade-offs or extension discussion.';
      concern = `Little evidence showing how the design accommodates evolving requirements without modifying core code (OCP violation).`;
      suggestion = `Add a section on Open-Closed Principle: explain which classes remain untouched when new vehicle types/algorithms are added.`;
    }

    return new CriterionEvaluation({
      dimension: RubricDimension.EXTENSIBILITY_TRADEOFFS,
      criterion: RubricDimensionMetadata[RubricDimension.EXTENSIBILITY_TRADEOFFS].label,
      score,
      weight,
      evidence,
      concern,
      suggestion,
      confidence: 0.85,
    });
  }

  private evaluateEdgeCases(submission: Submission, problem: Problem): CriterionEvaluation {
    const weight = problem.rubric.getWeightForDimension(RubricDimension.EDGE_CASES_TESTABILITY);
    const text = (
      submission.implementationCode +
      '\n' +
      submission.tradeoffsAndEdgeCases
    ).toLowerCase();

    const hasConcurrency = /lock|sync|atomic|mutex|thread|concurrent|race condition/.test(text);
    const hasErrorHandling = /throw|error|exception|try|catch|null|invalid|boundary/.test(text);
    const hasTestingMention = /test|mock|unit test|assert|coverage/.test(text);

    let score = 50;
    const evidenceParts: string[] = [];

    if (hasConcurrency) {
      score += 20;
      evidenceParts.push('Includes concurrency/thread-safety considerations');
    }
    if (hasErrorHandling) {
      score += 15;
      evidenceParts.push('Includes error throwing/boundary validation');
    }
    if (hasTestingMention) {
      score += 10;
      evidenceParts.push('Mentions testability and mocking');
    }

    score = Math.min(100, score);
    const evidence = evidenceParts.length > 0 ? evidenceParts.join('; ') : 'Basic happy-path flow without explicit edge case or concurrency handling.';

    let concern = '';
    let suggestion = '';

    if (!hasConcurrency) {
      concern = `No concurrency or synchronization safety mechanisms defined for shared state.`;
      suggestion = `Address multi-threaded race conditions (e.g. multiple threads attempting to book the same spot/ticket simultaneously).`;
    } else if (!hasErrorHandling) {
      concern = `Missing input boundary checks and explicit domain error hierarchies.`;
      suggestion = `Define custom domain exceptions (e.g., ParkingLotFullException, InsufficientBalanceException).`;
    } else {
      concern = `Edge case considerations are solid.`;
      suggestion = `Provide unit test stub examples demonstrating how dependency injection makes testing straightforward.`;
    }

    return new CriterionEvaluation({
      dimension: RubricDimension.EDGE_CASES_TESTABILITY,
      criterion: RubricDimensionMetadata[RubricDimension.EDGE_CASES_TESTABILITY].label,
      score,
      weight,
      evidence,
      concern,
      suggestion,
      confidence: 0.88,
    });
  }

  private generateSummary(score: number, strengthsCount: number, weaknessesCount: number, problemTitle: string): string {
    if (score >= 85) {
      return `Excellent Low-Level Design for ${problemTitle}! Demonstrates solid Single Responsibility, low coupling via interfaces, and well-chosen design patterns with actionable edge case awareness.`;
    } else if (score >= 70) {
      return `Good design foundation for ${problemTitle}. Core domain entities and primary relationships are established, but further refinement in interface decoupling and concurrency handling will elevate the design.`;
    } else if (score >= 55) {
      return `Competent initial attempt for ${problemTitle}. The solution captures basic requirements, but exhibits high coupling and lacks formal design pattern abstractions. Review suggestions to improve modularity.`;
    } else {
      return `Early-stage design for ${problemTitle}. Needs clearer entity separation, interface abstractions, and explicit design pattern selection to satisfy Low-Level Design interview standards.`;
    }
  }
}
