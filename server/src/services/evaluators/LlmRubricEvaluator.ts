import { IEvaluationStrategy } from '../../domain/interfaces/IEvaluationStrategy';
import { Problem } from '../../domain/entities/Problem';
import { Submission } from '../../domain/entities/Submission';
import { CriterionEvaluation, EvaluationResult } from '../../domain/entities/Evaluation';
import { HeuristicRubricEvaluator } from './HeuristicRubricEvaluator';
import { RubricDimension } from '../../domain/enums/RubricDimension';

export class LlmRubricEvaluator implements IEvaluationStrategy {
  public readonly name = 'LlmRubricEvaluator';
  private fallbackEvaluator: HeuristicRubricEvaluator;
  private apiKey?: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY;
    this.fallbackEvaluator = new HeuristicRubricEvaluator();
  }

  public supports(format: string): boolean {
    return ['structured_hybrid', 'code_only', 'text_only'].includes(format);
  }

  public async evaluate(submission: Submission, problem: Problem): Promise<EvaluationResult> {
    // If no API key is configured, immediately fall back to the heuristic strategy
    if (!this.apiKey) {
      const result = await this.fallbackEvaluator.evaluate(submission, problem);
      return result;
    }

    try {
      const startTime = Date.now();
      const prompt = this.buildPrompt(submission, problem);

      // Attempt LLM call with a 12-second timeout
      const llmResponse = await this.callLlmWithTimeout(prompt, 12000);
      const parsed = JSON.parse(llmResponse);

      const criteria = (parsed.criteria || []).map(
        (c: any) =>
          new CriterionEvaluation({
            dimension: c.dimension as RubricDimension,
            criterion: c.criterion,
            score: c.score,
            weight: problem.rubric.getWeightForDimension(c.dimension),
            evidence: c.evidence,
            concern: c.concern,
            suggestion: c.suggestion,
            confidence: c.confidence ?? 0.95,
          })
      );

      return new EvaluationResult({
        overallScore: parsed.overallScore,
        grade: parsed.grade,
        summary: parsed.summary,
        criteria,
        strengths: parsed.strengths || [],
        keyAreasForImprovement: parsed.keyAreasForImprovement || [],
        evaluatedBy: 'llm-hybrid',
        durationMs: Date.now() - startTime,
      });
    } catch (error) {
      console.warn('LLM Evaluation failed or timed out. Falling back to HeuristicRubricEvaluator.', error);
      const result = await this.fallbackEvaluator.evaluate(submission, problem);
      return result;
    }
  }

  private buildPrompt(submission: Submission, problem: Problem): string {
    return `
You are an expert Principal Software Engineer and Low-Level Design (LLD) Interviewer evaluating a candidate's LLD attempt.

Problem: ${problem.title}
Difficulty: ${problem.difficulty}
Core Requirements:
${problem.functionalRequirements.map((r) => `- ${r}`).join('\n')}

Constraints:
${problem.constraints.map((c) => `- ${c}`).join('\n')}

Key Expected Entities:
${problem.keyEntitiesExpected.join(', ')}

Candidate Submission:
---
[REQUIREMENTS & ASSUMPTIONS]:
${submission.requirementsAndAssumptions}

[CLASS MODEL / DIAGRAM]:
${submission.classModelTextOrDiagram}

[DESIGN PATTERNS & RATIONALE]:
${submission.designPatternsRationale}

[IMPLEMENTATION CODE]:
${submission.implementationCode}

[TRADE-OFFS & EDGE CASES]:
${submission.tradeoffsAndEdgeCases}
---

Evaluate this submission strictly across the following 6 rubric dimensions:
1. REQUIREMENT_ANALYSIS
2. CLASS_RESPONSIBILITY
3. COUPLING_ENCAPSULATION
4. DESIGN_PATTERNS
5. EXTENSIBILITY_TRADEOFFS
6. EDGE_CASES_TESTABILITY

For EACH dimension, you MUST provide:
- dimension (the enum string)
- criterion (name of the dimension)
- score (0-100)
- evidence (verbatim snippet or class name from candidate's text/code)
- concern (specific architectural flaws, violations of SOLID, or omitted requirements)
- suggestion (actionable advice for their next attempt)
- confidence (0.0 to 1.0)

Output ONLY a valid JSON object with the following structure:
{
  "overallScore": number,
  "grade": "A" | "B" | "C" | "D" | "F",
  "summary": string,
  "strengths": string[],
  "keyAreasForImprovement": string[],
  "criteria": [
    {
      "dimension": "REQUIREMENT_ANALYSIS" | "CLASS_RESPONSIBILITY" | "COUPLING_ENCAPSULATION" | "DESIGN_PATTERNS" | "EXTENSIBILITY_TRADEOFFS" | "EDGE_CASES_TESTABILITY",
      "criterion": string,
      "score": number,
      "evidence": string,
      "concern": string,
      "suggestion": string,
      "confidence": number
    }
  ]
}
`;
  }

  private async callLlmWithTimeout(prompt: string, timeoutMs: number): Promise<string> {
    // If external call is enabled, use fetch with AbortController
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are an objective Low-Level Design evaluator that outputs only valid JSON conforming to the requested schema.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.2,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`LLM HTTP error: ${response.statusText}`);
      }

      const data: any = await response.json();
      return data.choices[0].message.content;
    } finally {
      clearTimeout(timer);
    }
  }
}
