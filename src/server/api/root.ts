import { createTRPCRouter } from "~/server/api/trpc";
import { gameRouter } from "./routers/game";
import { recordsRouter } from "./routers/records";
import { adminRouter } from "./routers/admin";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  game: gameRouter,
  records: recordsRouter,
  admin: adminRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
