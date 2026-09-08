# LLD Practice Platform 🚀
> A focused, extensible platform for practicing Low-Level Design (LLD), submitting multi-part architectural solutions, and receiving explainable, evidence-based rubric feedback.

**CipherSchools Hiring Assignment — September 2026**  
**Author:** Priyanshu  
**Email:** priyanshu886291@gmail.com  

---

## 🌟 Key Highlights

- **🎯 Closed-Loop Practice Journey**: Choose Problem $\rightarrow$ Model & Code $\rightarrow$ Submit $\rightarrow$ Receive Rubric Feedback $\rightarrow$ Review History $\rightarrow$ Iterate & Compare.
- **🧩 5 Curated Real-World LLD Problems**: Multi-Floor Parking Lot, Elevator Dispatch Controller, Vending Machine State Machine, Distributed Rate Limiter, and Splitwise Expense Sharing.
- **📝 Structured 5-Part Architectural Canvas**: Guides learners to articulate *Assumptions & Scope*, *Class Model / UML*, *Design Patterns Rationale*, *Implementation Code*, and *Trade-offs & Concurrency*.
- **📊 6-Dimension Objective Rubric**: Evaluates Single Responsibility Principle (SRP), Coupling & Encapsulation, Design Patterns, Extensibility, and Thread-Safety with direct quotes as evidence.
- **📈 Iterative Delta Comparison**: Side-by-side comparison modal displaying score shifts ($\Delta \text{Score}$) between Attempt #1 and Attempt #2 across all rubric criteria.
- **🛡️ Resilient Hybrid Evaluator Pipeline**: Combines deterministic pre-flight validation with structured LLM schema evaluation and instant heuristic fallback (runs 100% offline out-of-the-box).

---

## 🏗️ Architecture & Domain Design

The domain model follows pure **Domain-Driven Design (DDD)** and Object-Oriented Principles:

```
server/src/
├── domain/
│   ├── entities/
│   │   ├── Problem.ts           # Aggregate root with requirements, constraints & rubric
│   │   ├── Attempt.ts           # State machine managing lifecycle transitions
│   │   ├── Submission.ts        # Encapsulates multi-section design input
│   │   ├── Rubric.ts            # Dimensional criteria & weights (normalized to 100%)
│   │   └── Evaluation.ts        # Structured CriterionEvaluation & EvaluationResult
│   ├── enums/
│   │   ├── AttemptStatus.ts     # CREATED -> SUBMITTED -> EVALUATING -> COMPLETED / FAILED
│   │   ├── Difficulty.ts        # EASY, MEDIUM, HARD
│   │   └── RubricDimension.ts   # 6 core architectural dimensions
│   └── interfaces/
│       ├── IEvaluationStrategy.ts   # Strategy pattern for swappable evaluators (Change Test B)
│       ├── ISubmissionValidator.ts  # Pre-flight input validation contract
│       └── IAttemptRepository.ts    # Repository persistence abstraction
├── services/
│   ├── evaluators/
│   │   ├── DeterministicRuleEvaluator.ts  # Pre-flight validator
│   │   ├── HeuristicRubricEvaluator.ts    # Zero-dependency deterministic evaluator
│   │   ├── LlmRubricEvaluator.ts          # Structured schema LLM evaluator
│   │   └── CompositeEvaluationPipeline.ts # Priority pipeline & fallback runner
│   ├── ProblemService.ts
│   └── AttemptService.ts
└── repositories/
    ├── InMemoryProblemRepository.ts
    └── InMemoryAttemptRepository.ts
```

### State Machine Lifecycle
```
[CREATED] ──(submit)──> [SUBMITTED] ──(startEvaluation)──> [EVALUATING] 
                                                                │
                                    ┌───────────────────────────┴───────────────────────────┐
                                    ▼                                                       ▼
                              [COMPLETED]                                                [FAILED]
                                                                                            │
                                                                                            └──(retry)──> [EVALUATING]
```

---

## ⚡ Extensibility Verification

### Change Test A: New Submission Format
*If tomorrow we support Interactive Visual UML or AST submissions:*
- `Problem`, `Attempt`, `EvaluationResult`, and `AttemptService` require **ZERO** changes.
- Add the format discriminator to `Submission.ts` and attach the parser to `IEvaluationStrategy`.

### Change Test B: New Evaluation Strategies
*If tomorrow we add an AST Linter, Python-specific analyzer, or Human Peer Reviewer:*
- Create a class implementing `IEvaluationStrategy`.
- Register it into `CompositeEvaluationPipeline.registerStrategy()`.
- The entire attempt execution flow remains completely untouched.

---

## 🚀 Quickstart & Setup

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)

### 1. Install All Dependencies
From the repository root:
```bash
npm run install:all
```
*(Or install individually in `./server` and `./client`)*

### 2. Start Backend & Frontend Concurrently
```bash
npm run dev
```
- **Backend API**: `http://localhost:5000` (Health check: `http://localhost:5000/health`)
- **Frontend Studio UI**: `http://localhost:3000`

### 3. (Optional) Configure OpenAI / Gemini Key for LLM Evaluation
The platform runs **100% offline** with zero configuration using the built-in `HeuristicRubricEvaluator`. If you wish to enable the LLM strategy, set your API key in `server/.env`:
```env
OPENAI_API_KEY=your_openai_api_key_here
PORT=5000
```

---

## 🧪 Running Automated Tests

Run the comprehensive unit and integration test suite:
```bash
npm run test:server
```
### Test Coverage:
- `tests/domain/Attempt.test.ts` (State machine invariants, transition guards, error handling)
- `tests/domain/Submission.test.ts` (Completeness ratio, multi-part payload metrics)
- `tests/evaluators/DeterministicRuleEvaluator.test.ts` (Empty/placeholder detection)
- `tests/evaluators/HeuristicRubricEvaluator.test.ts` (6-dimension scoring, evidence quotes)
- `tests/evaluators/CompositeEvaluationPipeline.test.ts` (Extensibility Change Test B & fallback)
- `tests/integration/attemptFlow.test.ts` (Full Attempt 1 $\rightarrow$ Attempt 2 $\rightarrow$ Comparison workflow)

---

## 📡 REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/problems` | List all available LLD practice problems |
| `GET` | `/api/problems/:idOrSlug` | Fetch problem requirements, hints, constraints & rubric |
| `POST` | `/api/problems/:id/attempts` | Create a new attempt session for a problem |
| `GET` | `/api/problems/:id/attempts` | List all historical attempts for a problem |
| `GET` | `/api/attempts/:id` | Fetch specific attempt details and evaluation result |
| `POST` | `/api/attempts/:id/submit` | Submit design solution and trigger evaluation pipeline |
| `POST` | `/api/attempts/:id/retry` | Retry failed evaluation |
| `GET` | `/api/attempts/:id1/compare/:id2` | Compute dimensional delta and improvement analytics |

---

## 📄 Deliverables & Documents

1. **[Research Note](docs/Research_Note.md)** (PDF available in `docs/Research_Note.pdf`): 1–2 page analysis of the learner problem, competitive review, and product direction.
2. **[Design Note](docs/Design_Note.md)** (PDF available in `docs/Design_Note.pdf`): Concise technical document covering domain models, class responsibilities, Change Tests A/B, and scaling.
3. **[AI Usage Report](AI_USAGE.md)**: 5 concrete AI-assisted architectural decisions with accepted/rejected justifications.
4. **Automated PDF Generator**: Run `npm run generate:docs` to produce clean PDF exports of the research and design notes.
