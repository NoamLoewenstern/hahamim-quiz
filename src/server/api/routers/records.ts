import { revalidatePath } from "next/cache";
import { RecordEntry } from "~/lib/db/types";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

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
    revalidatePath("/records");

    return { success: true, data: input };
  }),

  getRecordPosition: publicProcedure
    .input(RecordEntry.pick({ score: true }))
    .query(async ({ ctx, input }) => {
      const {
        _sum: { count: sumTotalPlayed },
      } = await ctx.prisma.scoreCount.aggregate({
        _sum: { count: true },
      });
      const {
        _sum: { count: sumBetterScore },
      } = await ctx.prisma.scoreCount.aggregate({
        _sum: { count: true },
        where: { score: { gte: input.score } },
      });
      const position = (sumTotalPlayed || 0) - (sumBetterScore || 0);
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
});
