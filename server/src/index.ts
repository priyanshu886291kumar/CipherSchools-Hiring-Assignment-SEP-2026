import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { InMemoryProblemRepository } from './repositories/InMemoryProblemRepository';
import { InMemoryAttemptRepository } from './repositories/InMemoryAttemptRepository';
import { ProblemService } from './services/ProblemService';
import { AttemptService } from './services/AttemptService';
import { CompositeEvaluationPipeline } from './services/evaluators/CompositeEvaluationPipeline';
import { createProblemRoutes } from './routes/problemRoutes';
import { createAttemptRoutes } from './routes/attemptRoutes';
import { sampleProblems } from './data/sampleProblems';

dotenv.config();

export function createApp(): Express {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: '5mb' }));

  // Dependency Injection & In-Memory Store Initialization
  const problemRepo = new InMemoryProblemRepository(sampleProblems);
  const attemptRepo = new InMemoryAttemptRepository();
  const pipeline = new CompositeEvaluationPipeline();

  const problemService = new ProblemService(problemRepo);
  const attemptService = new AttemptService(attemptRepo, problemRepo, pipeline);

  // Health check
  app.get('/health', (req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'LLD-Practice-Platform-Engine',
      version: '1.0.0',
    });
  });

  // API Routes
  app.use('/api/problems', createProblemRoutes(problemService, attemptService));
  app.use('/api/attempts', createAttemptRoutes(attemptService));

  // Global Error Handler
  app.use((err: any, req: Request, res: Response, next: any) => {
    console.error('Unhandled Server Error:', err);
    res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Internal Server Error',
    });
  });

  return app;
}

if (process.env.NODE_ENV !== 'test') {
  const port = process.env.PORT || 5000;
  const app = createApp();
  app.listen(port, () => {
    console.log(`🚀 LLD Practice Platform Server running on http://localhost:${port}`);
    console.log(`📚 Initialized with ${sampleProblems.length} curated LLD problems.`);
  });
}
