# AI Usage Report: Engineering Decisions & Architectural Trade-offs
**Project:** LLD Practice Platform  
**Author:** Priyanshu  
**Date:** September 2026  

---

## Overview
During the design and construction of this Low-Level Design (LLD) practice platform, AI tools (ChatGPT, Claude, Cursor, and Gemini) were utilized as pair-programming and design brainstorming partners. Below are **5 meaningful AI-assisted decisions**, detailing what the AI suggested, what was accepted vs. rejected, and the technical justification behind each choice.

---

### Decision 1: Single Blank Code Textarea vs. Multi-Section Structured Submission Canvas
- **AI Suggestion**:  
  The AI initially suggested a simple single-page editor with a large Monaco code editor, arguing that learners are most accustomed to IDE-like single-file code entry (similar to LeetCode).
- **Accepted / Rejected**:  
  **Rejected single textarea; Accepted Multi-Section Structured Canvas.**
- **Rationale & Trade-off**:  
  Low-Level Design is fundamentally about *requirements modeling, relationship topology, and architectural trade-offs*—not just writing executable code. A single blank code window encourages learners to dive immediately into implementation details, skipping clarifying assumptions and pattern selection. We built a 5-part structured canvas:
  1. Requirements & Assumptions
  2. Class Structure / Diagram
  3. Design Patterns & Rationale
  4. Core Implementation Code
  5. Trade-offs & Concurrency

---

### Decision 2: Feedback Generation Strategy — Raw Prompt vs. Fixed 6-Dimensional Rubric Schema
- **AI Suggestion**:  
  The AI suggested an open-ended prompt asking the model: *"Analyze this LLD solution and give a rating out of 100 with general tips."*
- **Accepted / Rejected**:  
  **Rejected unconstrained prompt; Accepted Strict JSON-Schema Rubric.**
- **Rationale & Trade-off**:  
  Unconstrained LLM prompts produce inconsistent, non-reproducible evaluations with sycophantic praise and generic advice. We enforced a strict JSON schema where every single criterion must output:
  `criterion → score → evidence → concern → suggestion → confidence`.
  Furthermore, overall scores are calculated deterministically by multiplying criterion scores with pre-set rubric weights (`Rubric.ts`), eliminating mathematical hallucination.

---

### Decision 3: Evaluator Pipeline Extensibility (Change Test B)
- **AI Suggestion**:  
  The AI proposed embedding the evaluation logic directly inside `AttemptService.submit()` using an `if-else` block for LLM vs. mock evaluation.
- **Accepted / Rejected**:  
  **Rejected inline procedural logic; Accepted Strategy Pattern + Composite Pipeline.**
- **Rationale & Trade-off**:  
  Hardcoding evaluator conditionals in the service violates the Open-Closed Principle and fails Change Test B. We extracted the `IEvaluationStrategy` interface and built `CompositeEvaluationPipeline`. This allows registering future strategies (e.g. AST syntax checkers, external APIs, or human peer review) without changing a single line of the attempt state machine or service orchestration.

---

### Decision 4: Resilience & Offline Fallback Architecture
- **AI Suggestion**:  
  The AI suggested failing the submission and returning an HTTP 500 error if external LLM API tokens (`OPENAI_API_KEY`, `GEMINI_API_KEY`) are missing or if the API request times out.
- **Accepted / Rejected**:  
  **Rejected hard failure; Accepted Graceful Fallback to Intelligent Heuristic Evaluator.**
- **Rationale & Trade-off**:  
  For an assessment prototype, an evaluator must work reliably out-of-the-box without requiring the reviewer to configure private API keys or risk rate limits. We built `HeuristicRubricEvaluator` as a first-class strategy that parses classes, interfaces, access modifiers, GoF pattern keywords, and concurrency primitives deterministically. The pipeline tries LLM first (if configured) with an automated timeout fallback to heuristic evaluation.

---

### Decision 5: Multi-Attempt Iterative Progression & Delta Analytics
- **AI Suggestion**:  
  The AI suggested a simple history list displaying past attempt timestamps and scores.
- **Accepted / Rejected**:  
  **Extended with Interactive Attempt Comparison & Dimension-by-Dimension Delta.**
- **Rationale & Trade-off**:  
  The core value of the platform is the **practice loop** ($\text{Practice} \rightarrow \text{Feedback} \rightarrow \text{Review} \rightarrow \text{Iterate}$). Showing just a timestamp does not help learners understand if they fixed specific flaws. We implemented `compareAttempts(att1, att2)` on the backend and an `AttemptComparisonModal` on the frontend that displays side-by-side dimensional score shifts ($\Delta \text{Score}$), highlighting whether coupling, cohesion, or concurrency improved between attempts.

---

## Summary Table

| # | Architectural Decision | AI Proposal | Final Choice | Key Engineering Benefit |
| :--- | :--- | :--- | :--- | :--- |
| **1** | Submission Model | Single code window | 5-Section Canvas | Enforces holistic design thinking over syntax |
| **2** | Evaluation Format | Freeform prompt | Fixed Rubric Schema | Evidence-based, explainable, zero hallucination |
| **3** | Evaluator Architecture | Inline `if-else` | Strategy + Pipeline | 100% Extensible (passes Change Test B) |
| **4** | Failure Resilience | Fail on missing API key | Heuristic Fallback | Zero-dependency, 100% reliable execution |
| **5** | Learner Progression | Timestamp list | Visual Delta Modal | Closes the iterative learning loop |
