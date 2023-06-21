import { useState, useCallback } from "react";
import { NUMBER_OF_QUESTIONS_FOR_EACH_LEVEL } from "~/config";
import { Difficulties } from "~/lib/db/types";
import { api } from "~/utils/api";

export function useGetNextQuestions() {
  const { mutateAsync: getRandomQuestion } = api.game.getRandomQuestionsByDifficulty.useMutation();

  async function* getQuestionsIterator() {
    for (const difficulty of Difficulties) {
      for (let i = 0; i < NUMBER_OF_QUESTIONS_FOR_EACH_LEVEL; i++) {
        const questions = await getRandomQuestion({ count: 1, difficulty });
        yield questions[0];
      }
    }
    yield null;
  }

  const [questionsIter, setQuestionsIter] = useState(() => getQuestionsIterator());

  const resetIterQuestions = () => setQuestionsIter(getQuestionsIterator());

  const getNextQuestion = useCallback(() => {
    try {
      return questionsIter.next().then((result) => result.value);
    } catch (error) {
      console.error(error);
    }
  }, [questionsIter]);

  return { getNextQuestion, reset: resetIterQuestions };
}
