# Research Note: Rethinking Low-Level Design (LLD) Practice & Evaluation
**Author:** Priyanshu (Candidate Submission)  
**Date:** September 2026  
**Assignment:** CipherSchools Hiring Assignment - LLD Practice Platform  

---

## 1. Executive Summary & Problem Analysis
Low-Level Design (LLD) and Object-Oriented Domain Modeling are core components of senior software engineering assessments. However, while **Data Structures & Algorithms (DSA)** benefits from deterministic automated test fixtures (e.g. LeetCode, HackerRank) and **System Design (HLD)** benefits from high-level capacity calculations and block architecture diagrams, **Low-Level Design suffers from an acute evaluation gap**.

When a learner designs a *Parking Lot*, *Elevator Controller*, or *Rate Limiter*, they face fundamental uncertainty:
- *Are my class responsibilities cohesive (Single Responsibility Principle)?*
- *Did I over-engineer with unnecessary design patterns, or did I hardcode logic that violates the Open-Closed Principle?*
- *Is my concurrency handling sound, or will it deadlock under multi-threaded gate access?*
- *How does my solution compare to alternative valid architectural paradigms?*

Without targeted, explainable, and iterative feedback, learners default to passive memorization of static GitHub repositories, which fails to develop real engineering judgement.

---

## 2. Competitive Landscape & Existing Approaches Researched

We analyzed four prevailing methods candidates use to practice LLD:

| Approach / Platform | Workflow & Submission Model | Feedback Mechanism | Critical Gaps & Failure Modes |
| :--- | :--- | :--- | :--- |
| **1. Static GitHub Repositories** *(e.g., ts-lld, awesome-low-level-design)* | Learner reads pre-written Java/C++ classes and attempts to recreate them. | Binary self-comparison against a single "golden" reference solution. | **Dogmatic Reference Bias**: Penalizes valid alternative designs (e.g., using Strategy vs State pattern). Fails to explain *why* trade-offs were made. |
| **2. DSA Platforms with LLD Tags** *(e.g., LeetCode Design Problems)* | Learner submits code to pass unit tests and I/O test cases. | Binary unit test pass/fail + execution runtime percentile. | **Over-Indexes on I/O Syntax**: A learner can pass LeetCode's *Design Underground System* with a monolithic 500-line God-class full of nested hash maps, learning completely anti-OOP habits. |
| **3. Generic LLM Prompting** *(e.g., ChatGPT / Claude raw chats)* | Learner pastes code and asks "Review my LLD design". | Unstructured narrative text with generic praise and arbitrary nitpicks. | **Subjectivity & Hallucination**: Lacks a standardized rubric. Fails to cite verbatim evidence or track iterative delta across attempts. |
| **4. Live Human Mock Interviews** *(e.g., Pramp, Interviewing.io)* | 45-minute verbal & whiteboard session with an engineer. | Qualitative rubric and conversational feedback. | **High Friction & Inconsistency**: Extremely expensive, difficult to schedule, and highly variable depending on interviewer bias. |

---

## 3. Key Gaps in Current Practice

From our research, three fundamental gaps prevent effective LLD learning:

1. **Absence of Evidence-Based Evaluation:** Feedback often makes sweeping generalizations ("Your design is not extensible") without citing concrete code or class structures from the learner's submission.
2. **The "Single Right Answer" Fallacy:** Existing tools grade against one rigid class hierarchy. In real software engineering, multiple valid designs exist with distinct trade-offs (e.g. memory efficiency vs polymorphism). Feedback must evaluate *fitness for constraints*, not template matching.
3. **Broken Improvement Loop:** Current platforms treat practice as a one-shot exam rather than an iterative cycle:
   $$\text{Choose Problem} \longrightarrow \text{Design} \longrightarrow \text{Submit} \longrightarrow \text{Evaluate} \longrightarrow \text{Reflect} \longrightarrow \text{Re-attempt}$$
   Learners rarely have visibility into how Attempt #2 improved upon the specific design flaws identified in Attempt #1.

---

## 4. Proposed Product Direction & Architectural Philosophy

To solve this, we designed the **LLD Practice Platform** around three core product principles:

### A. Structured Multi-Modal Submission Canvas
Rather than forcing a blank code box, we guide the learner to think like a Software Architect by decomposing their submission into 5 essential artifacts:
1. **Requirements & Clarifying Assumptions** (Defining scope, actors, and constraints)
2. **Class Structure / Model** (Entities, attributes, methods, and relationships)
3. **Design Pattern Rationale** (Justifying why specific GoF patterns were chosen)
4. **Core Implementation Code** (Demonstrating interfaces, encapsulation, and type safety)
5. **Trade-offs & Concurrency** (Addressing thread-safety, race conditions, and OCP extension points)

### B. Standardized 6-Dimension Evaluation Rubric
We evaluate all submissions against an objective, 100-point dimensional rubric:
$$\text{Total Score} = \sum_{i=1}^{6} (\text{Score}_i \times \text{Weight}_i)$$

Each criterion strictly adheres to the schema:
$$\mathbf{Criterion} \longrightarrow \mathbf{Score} \longrightarrow \mathbf{Evidence} \longrightarrow \mathbf{Concern} \longrightarrow \mathbf{Suggestion} \longrightarrow \mathbf{Confidence}$$

### C. First-Class Multi-Attempt Delta Analytics
The platform retains attempt history, enabling learners to re-attempt problems and instantly visualize dimensional score shifts ($\Delta \text{Score}$), verifying that previous architectural weaknesses were systematically resolved.

---

## 5. Conclusion
By separating deterministic structural checks from rubric-driven evaluation, providing evidence-backed suggestions, and tracking iterative progress, the LLD Practice Platform transforms Low-Level Design from a subjective guessing game into a rigorous, learnable engineering discipline.
