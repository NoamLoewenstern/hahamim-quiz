import { Question } from "@prisma/client";
import { IQuestionEntry } from "~/lib/db/types";
import { prisma } from "~/server/db";

export async function* getQuestionsByDifficulty({
  difficultyLevel,
  numberOfQuestions,
}: {
  difficultyLevel: IQuestionEntry["difficulty"];
  numberOfQuestions: number;
}) {
  // random select query with fileter only approved, and limit to number of questions
  const questions: Question[] =
    await prisma.$queryRaw`SELECT * FROM "Question" WHERE "difficulty" = ${difficultyLevel} AND "approved" = true ORDER BY RANDOM() LIMIT ${numberOfQuestions}`;
  for (const question of questions) {
    yield question;
  }
  return null;
}
