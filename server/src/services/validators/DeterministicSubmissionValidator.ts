import { ISubmissionValidator, ValidationResult } from '../../domain/interfaces/ISubmissionValidator';
import { Submission } from '../../domain/entities/Submission';
import { Problem } from '../../domain/entities/Problem';

export class DeterministicSubmissionValidator implements ISubmissionValidator {
  public validate(submission: Submission, problem: Problem): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!submission) {
      errors.push('Submission payload is missing.');
      return { isValid: false, errors, warnings };
    }

    const totalLength = submission.getTotalLength();
    if (totalLength < 30) {
      errors.push('Submission is too brief. Please provide meaningful content in at least 2 sections.');
    }

    const completeness = submission.getSectionCompleteness();

    if (!completeness.hasClassModel && !completeness.hasCode) {
      errors.push('Submission must include either a Class Model (structure/entities) or Implementation Code.');
    }

    if (!completeness.hasRequirements) {
      warnings.push('Clarifying requirements & assumptions were omitted. Adding assumptions helps justify design choices.');
    }

    if (!completeness.hasPatterns) {
      warnings.push('No design pattern rationale provided. Explicitly naming your patterns helps justify architectural structure.');
    }

    if (!completeness.hasTradeoffs) {
      warnings.push('Trade-offs and edge cases section was left brief. Mentioning trade-offs demonstrates senior engineering judgement.');
    }

    // Check for placeholder dummy text
    const combinedText = (
      submission.requirementsAndAssumptions +
      submission.classModelTextOrDiagram +
      submission.designPatternsRationale +
      submission.implementationCode +
      submission.tradeoffsAndEdgeCases
    ).toLowerCase();

    if (
      combinedText.includes('lorem ipsum') ||
      combinedText.includes('todo: add code') ||
      combinedText.includes('asdf') ||
      combinedText.trim() === 'test'
    ) {
      errors.push('Submission contains placeholder or dummy text. Please provide an actual Low-Level Design.');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }
}
