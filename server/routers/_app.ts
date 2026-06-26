import { router } from '@/lib/trpc/init';
import { projectRouter } from './project';

export const appRouter = router({
  project: projectRouter,
});

export type AppRouter = typeof appRouter;
