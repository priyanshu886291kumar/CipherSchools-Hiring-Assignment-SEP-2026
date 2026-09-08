export enum RubricDimension {
  REQUIREMENT_ANALYSIS = 'REQUIREMENT_ANALYSIS',
  CLASS_RESPONSIBILITY = 'CLASS_RESPONSIBILITY',
  COUPLING_ENCAPSULATION = 'COUPLING_ENCAPSULATION',
  DESIGN_PATTERNS = 'DESIGN_PATTERNS',
  EXTENSIBILITY_TRADEOFFS = 'EXTENSIBILITY_TRADEOFFS',
  EDGE_CASES_TESTABILITY = 'EDGE_CASES_TESTABILITY',
}

export const RubricDimensionMetadata: Record<
  RubricDimension,
  { label: string; description: string; defaultWeight: number }
> = {
  [RubricDimension.REQUIREMENT_ANALYSIS]: {
    label: 'Requirement Understanding & Scope',
    description: 'Accurate identification of functional scope, actors, and clear clarifying assumptions.',
    defaultWeight: 15,
  },
  [RubricDimension.CLASS_RESPONSIBILITY]: {
    label: 'Class Responsibilities & Cohesion (SRP)',
    description: 'Clean separation of concerns where each class/entity owns a single cohesive responsibility.',
    defaultWeight: 20,
  },
  [RubricDimension.COUPLING_ENCAPSULATION]: {
    label: 'Coupling, Interfaces & Encapsulation',
    description: 'Decoupled abstractions, use of interfaces/contracts, information hiding, and minimal direct dependencies.',
    defaultWeight: 20,
  },
  [RubricDimension.DESIGN_PATTERNS]: {
    label: 'Appropriate Use of Abstraction & Patterns',
    description: 'Judicious use of standard design patterns (Strategy, Factory, State, Observer, etc.) without over-engineering.',
    defaultWeight: 15,
  },
  [RubricDimension.EXTENSIBILITY_TRADEOFFS]: {
    label: 'Extensibility & Trade-off Articulation',
    description: 'Open-Closed Principle adherence, ease of adding future requirements, and articulation of design trade-offs.',
    defaultWeight: 15,
  },
  [RubricDimension.EDGE_CASES_TESTABILITY]: {
    label: 'Edge Cases, Concurrency & Testability',
    description: 'Handling failure modes, race conditions/concurrency considerations, and ease of writing unit tests.',
    defaultWeight: 15,
  },
};
