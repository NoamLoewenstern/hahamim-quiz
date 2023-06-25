import { type Question } from "@prisma/client";
import { DifficultyEnum, type IDifficulty } from "~/lib/db/types";
import { prisma } from "~/server/db";
import memCache from "memory-cache";
import { getRandomIntegers } from "~/utils/helpers";
export type QuestionsCache = {
  [DifficultyEnum.EASY]: Question[];
  [DifficultyEnum.MEDIUM]: Question[];
  [DifficultyEnum.HARD]: Question[];
  count: number;
};
async function setupQuestionsCache() {
  const allQuestions = await prisma.question.findMany({
    where: { approved: true },
  });
  const cachedQuestions: QuestionsCache = {
    [DifficultyEnum.EASY]: [] as Question[],
    [DifficultyEnum.MEDIUM]: [] as Question[],
    [DifficultyEnum.HARD]: [] as Question[],
    count: allQuestions.length,
  };
  for (const question of allQuestions) {
    cachedQuestions[question.difficulty].push(question);
  }

  memCache.put("questions", cachedQuestions);
  return cachedQuestions;
}

function getRandomByDifficulty({ difficulty, count }: { difficulty: IDifficulty; count: number }) {
  const cachedQuestions = memCache.get("questions") as QuestionsCache;
  const questions = cachedQuestions[difficulty];
  if (questions.length === 0) throw new Error("No questions found");
  if (count === 1) {
    const randomIndex = Math.floor(Math.random() * questions.length);
    return [questions[randomIndex]].filter(Boolean);
  }
  const randomIndexes = getRandomIntegers(0, questions.length, { unique: true, count });
  console.log(`difficulty,randomIndexes`, difficulty, randomIndexes);

  const randomQuestions = randomIndexes.map((index) => questions[index]).filter(Boolean);
  return randomQuestions;
}

export const questionsCache = {
  getRandomByDifficulty,
  get: () => memCache.get("questions") as QuestionsCache,
  initHydrate: setupQuestionsCache,
  rehydrate: setupQuestionsCache,
};
