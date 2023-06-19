import { RecordEntry } from "~/lib/db/types";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { revalidatePathAPI } from "~/utils/revalidatePathAPI";

export const recordsRouter = createTRPCRouter({
  isTopRank: publicProcedure
    .input(RecordEntry.pick({ score: true }))
    .query(async ({ ctx, input }) => {
      const currentRecords = await ctx.prisma.record.findFirst({
        where: { score: { lt: input.score } },
      });
      return currentRecords !== null;
    }),

  addNewTopRecord: publicProcedure.input(RecordEntry).mutation(async ({ ctx, input }) => {
    const lowestRecord = await ctx.prisma.record.findFirst({
      where: { score: { lt: input.score } },
      orderBy: { score: "desc" },
      take: 1,
      select: { id: true, score: true },
    });
    if (lowestRecord !== null && input.score <= lowestRecord.score) {
      return { success: false, message: "Not In Top Rank!" };
    }

    await ctx.prisma.record.upsert({
      where: lowestRecord ? { id: lowestRecord.id } : {},
      update: input,
      create: input,
    });
    revalidatePathAPI(["/records"]);

    return { success: true, data: input };
  }),

  getRecordPosition: publicProcedure
    .input(RecordEntry.pick({ score: true }))
    .query(async ({ ctx, input: { score } }) => {
      const {
        _sum: { count: sumTotalPlayed },
      } = await ctx.prisma.scoreCount.aggregate({
        _sum: { count: true },
      });
      const {
        _sum: { count: sumBetterScore },
      } = await ctx.prisma.scoreCount.aggregate({
        _sum: { count: true },
        where: { score: { gte: score } },
      });
      const position = (sumBetterScore || 0) + 1;

      return { position, totalPlayed: sumTotalPlayed };
    }),

  getSumTotalPlayed: publicProcedure.query(async ({ ctx }) => {
    const {
      _sum: { count: sumTotalPlayed },
    } = await ctx.prisma.scoreCount.aggregate({
      _sum: { count: true },
    });
    return sumTotalPlayed || 0;
  }),

  addAnotherPlayed: publicProcedure
    .input(RecordEntry.pick({ score: true }))
    .query(async ({ ctx, input: { score } }) => {
      await ctx.prisma.scoreCount.upsert({
        where: { score },
        update: { count: { increment: 1 } },
        create: { score, count: 1 },
      });
      return { success: true };
    }),
});
