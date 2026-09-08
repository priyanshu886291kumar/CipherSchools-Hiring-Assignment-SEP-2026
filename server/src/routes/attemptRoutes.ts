import { Router, Request, Response } from 'express';
import { AttemptService } from '../services/AttemptService';

export function createAttemptRoutes(attemptService: AttemptService): Router {
  const router = Router();

  // GET /api/attempts/:id
  router.get('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const attempt = await attemptService.getAttempt(id);
      res.json({
        success: true,
        data: attempt.toJSON(),
      });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
    }
  });

  // POST /api/attempts/:id/submit
  router.post('/:id/submit', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const {
        requirementsAndAssumptions = '',
        classModelTextOrDiagram = '',
        designPatternsRationale = '',
        implementationCode = '',
        tradeoffsAndEdgeCases = '',
        format = 'structured_hybrid',
        async = false,
      } = req.body;

      const attempt = await attemptService.submitAttempt(
        id,
        {
          requirementsAndAssumptions,
          classModelTextOrDiagram,
          designPatternsRationale,
          implementationCode,
          tradeoffsAndEdgeCases,
          format,
        },
        Boolean(async)
      );

      res.json({
        success: true,
        data: attempt.toJSON(),
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  });

  // POST /api/attempts/:id/retry
  router.post('/:id/retry', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const attempt = await attemptService.retryEvaluation(id);
      res.json({
        success: true,
        data: attempt.toJSON(),
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  });

  // GET /api/attempts/:id1/compare/:id2
  router.get('/:id1/compare/:id2', async (req: Request, res: Response) => {
    try {
      const { id1, id2 } = req.params;
      const comparison = await attemptService.compareAttempts(id1, id2);
      res.json({
        success: true,
        data: comparison,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  });

  // GET /api/attempts?learnerId=xxx
  router.get('/', async (req: Request, res: Response) => {
    try {
      const { learnerId = 'learner-1' } = req.query;
      const attempts = await attemptService.getAttemptsForLearner(String(learnerId));
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
