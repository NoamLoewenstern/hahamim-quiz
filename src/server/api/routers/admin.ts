import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const adminRouter = createTRPCRouter({
  getPendingQuestions: protectedProcedure.query(async ({ ctx }) => {
    const pendingQuestions = await ctx.prisma.question.findMany({
      where: { approved: false },
      select: {
        id: true,
        question: true,
        answer: true,
        difficulty: true,
      },
    });
    return pendingQuestions;
  }),
  approveQuestion: protectedProcedure.input(z.string()).mutation(async ({ ctx, input }) => {
    await ctx.prisma.question.update({
      where: { id: input },
      data: { approved: true },
    });
    return true;
  }),
  deleteQuestion: protectedProcedure.input(z.string()).mutation(async ({ ctx, input }) => {
    await ctx.prisma.question.delete({ where: { id: input } });
    return true;
  }),
});
