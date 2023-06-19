import { QuestionEntry } from "~/lib/db/types";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const gameRouter = createTRPCRouter({
  requestAddNewQuestion: publicProcedure.input(QuestionEntry).mutation(async ({ ctx, input }) => {
    try {
      await ctx.prisma.question.create({ data: input });
    } catch (error: any) {
      if (error?.code === "P2002") {
        // question already exists
        return {
          success: false,
          error: "Duplicate question",
          field: error?.meta?.target?.[0],
        } as const;
      }
      throw error;
    }
    return { success: true };
  }),
});
