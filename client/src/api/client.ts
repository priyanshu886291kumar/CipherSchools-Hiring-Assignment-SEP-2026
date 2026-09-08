import { Problem, Attempt, SubmissionPayload, AttemptComparison } from '../types';

const API_BASE = '/api';

export const api = {
  async getProblems(): Promise<Problem[]> {
    const res = await fetch(`${API_BASE}/problems`);
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    return json.data;
  },

  async getProblem(idOrSlug: string): Promise<Problem> {
    const res = await fetch(`${API_BASE}/problems/${idOrSlug}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    return json.data;
  },

  async startAttempt(problemId: string, learnerId: string = 'learner-1'): Promise<Attempt> {
    const res = await fetch(`${API_BASE}/problems/${problemId}/attempts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ learnerId }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    return json.data;
  },

  async getAttemptsForProblem(problemId: string, learnerId: string = 'learner-1'): Promise<Attempt[]> {
    const res = await fetch(`${API_BASE}/problems/${problemId}/attempts?learnerId=${learnerId}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    return json.data;
  },

  async getAttempt(id: string): Promise<Attempt> {
    const res = await fetch(`${API_BASE}/attempts/${id}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    return json.data;
  },

  async submitAttempt(id: string, payload: SubmissionPayload): Promise<Attempt> {
    const res = await fetch(`${API_BASE}/attempts/${id}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    return json.data;
  },

  async retryAttempt(id: string): Promise<Attempt> {
    const res = await fetch(`${API_BASE}/attempts/${id}/retry`, {
      method: 'POST',
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    return json.data;
  },

  async compareAttempts(id1: string, id2: string): Promise<AttemptComparison> {
    const res = await fetch(`${API_BASE}/attempts/${id1}/compare/${id2}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    return json.data;
  },
};
