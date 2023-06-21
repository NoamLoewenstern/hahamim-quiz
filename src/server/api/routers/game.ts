import { z } from "zod";
import { QuestionEntry } from "~/lib/db/types";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

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
    .mutation(async ({ ctx, input: { count, difficulty } }) => {
      const totalQuestionsCount = await ctx.prisma.question.count({
        where: { difficulty: difficulty, approved: true },
      });
      let skip = Math.floor(Math.random() * totalQuestionsCount);
      if (skip + count > totalQuestionsCount) {
        skip = totalQuestionsCount - count;
      }
      const questions = await ctx.prisma.question.findMany({
        where: { difficulty: difficulty, approved: true },
        take: count,
        skip,
        select: { question: true, answer: true, difficulty: true, approved: true },
        // orderBy: { id: "asc" },
      });
      return questions;

      // const questions: any[] | null = await ctx.prisma
      //   .$queryRaw`SELECT question, answer, approved, difficulty FROM "Question" WHERE "difficulty" = ${difficulty} AND "approved" = true ORDER BY RANDOM() LIMIT ${count}`;
      // if (!questions) throw new Error("No questions found");
      // return questions.map((question) => QuestionEntry.parse(question));
    }),
});
