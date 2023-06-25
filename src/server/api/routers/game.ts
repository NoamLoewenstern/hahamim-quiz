import { z } from "zod";
import { QuestionEntry } from "~/lib/db/types";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { cache } from "~/setupCache";

export const gameRouter = createTRPCRouter({
  requestAddNewQuestion: publicProcedure.input(QuestionEntry).mutation(async ({ ctx, input }) => {
    try {
      await ctx.prisma.question.create({ data: input });
    } catch (error: any) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (error?.code === "P2002") {
        // question already exists
        return {
          success: false,
          error: "Duplicate question",
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          field: error?.meta?.target?.[0] as string,
        } as const;
      }
      throw error;
    }
    return { success: true };
  }),
  getRandomQuestionsByDifficulty: publicProcedure
    .input(z.object({ difficulty: QuestionEntry.shape.difficulty, count: z.number().min(1) }))
    .mutation(({ input: { count, difficulty } }) => {
      const questions = cache.questions.getRandomByDifficulty({ difficulty, count });
      return questions;
    }),
});
