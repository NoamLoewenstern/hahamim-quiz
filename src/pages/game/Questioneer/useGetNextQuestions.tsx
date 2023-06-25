import { Difficulty } from "@prisma/client";
import { useState, useCallback } from "react";
import { type IDifficulty } from "~/lib/db/types";
import { api } from "~/utils/api";

export function useGetQuizQuestions({
  countPerDifficulty = 1,
  difficulties = [Difficulty.EASY, Difficulty.MEDIUM, Difficulty.HARD] as IDifficulty[],
} = {}) {
  const { mutateAsync: getRandomQuestion } = api.game.getRandomQuestionsByDifficulty.useMutation();

  const countPerDiff = countPerDifficulty;
  const difficultiesToIter = difficulties;

  async function* getQuestionsIterator({
    countPerDifficulty = countPerDiff,
    difficulties = difficultiesToIter,
  } = {}) {
    for (const difficulty of difficulties) {
      const questions = await getRandomQuestion({ count: countPerDifficulty, difficulty });
      for (const question of questions) {
        yield question;
      }
    }
    return null;
  }

  const [questionsIter, setQuestionsIter] = useState(() => getQuestionsIterator());

  const resetIterQuestions = () => setQuestionsIter(getQuestionsIterator());

  const getNextQuestion = useCallback(async () => {
    try {
      const result = await questionsIter.next();
      return result.value;
    } catch (error) {
      console.error(error);
      return null;
    }
  }, [questionsIter]);

  return { getNextQuestion, reset: resetIterQuestions };
}
