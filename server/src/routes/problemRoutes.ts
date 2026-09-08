import { Router, Request, Response } from 'express';
import { ProblemService } from '../services/ProblemService';
import { AttemptService } from '../services/AttemptService';

export function createProblemRoutes(
  problemService: ProblemService,
  attemptService: AttemptService
): Router {
  const router = Router();

  // GET /api/problems
  router.get('/', async (req: Request, res: Response) => {
    try {
      const problems = await problemService.getAllProblems();
      res.json({
        success: true,
        count: problems.length,
        data: problems.map((p) => p.toJSON()),
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // GET /api/problems/:idOrSlug
  router.get('/:idOrSlug', async (req: Request, res: Response) => {
    try {
      const { idOrSlug } = req.params;
      let problem;
      try {
        problem = await problemService.getProblemById(idOrSlug);
      } catch {
        problem = await problemService.getProblemBySlug(idOrSlug);
      }

      res.json({
        success: true,
        data: problem.toJSON(),
      });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
    }
  });

  // POST /api/problems/:id/attempts - Start a new attempt
  router.post('/:id/attempts', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { learnerId = 'learner-1' } = req.body;
      const attempt = await attemptService.createAttempt(id, learnerId);
      res.status(201).json({
        success: true,
        data: attempt.toJSON(),
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  });

  // GET /api/problems/:id/attempts - List attempts for this problem
  router.get('/:id/attempts', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { learnerId = 'learner-1' } = req.query;
      const attempts = await attemptService.getAttemptsForProblem(id, String(learnerId));
      res.json({
        success: true,
        count: attempts.length,
        data: attempts.map((a) => a.toJSON()),
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  return router;
}
