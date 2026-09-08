import { Submission } from '../entities/Submission';
import { Problem } from '../entities/Problem';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ISubmissionValidator {
  validate(submission: Submission, problem: Problem): ValidationResult;
}
