import { useState, useCallback } from "react";
import { NUMBER_OF_QUESTIONS_FOR_EACH_LEVEL } from "~/config";
import { asyncChain } from "~/utils/helpers";
import { Difficulties, IQuestionEntry } from "~/lib/db/types";
import { getQuestionsByDifficulty } from "~/lib/db/get-questions";

export function getQuestionsIterators() {
  const iters = Difficulties.map((level) =>
    getQuestionsByDifficulty({
      difficultyLevel: level,
      numberOfQuestions: NUMBER_OF_QUESTIONS_FOR_EACH_LEVEL,
    })
  );
  return asyncChain(...iters);
}

async function getNextQuestionFromIter(questionsIter: AsyncGenerator<IQuestionEntry, void>) {
  const { value, done } = await questionsIter.next();
  if (done || !value) {
    return null;
  }
  return value;
}

export function useGetNextQuestions() {
  const [questionsIter, setQuestionsIter] = useState(() => getQuestionsIterators());

  const reset = useCallback(() => {
    setQuestionsIter(getQuestionsIterators());
  }, []);

  const getNextQuestion = useCallback(() => {
    try {
      return getNextQuestionFromIter(questionsIter);
    } catch (error) {
      console.error(error);
    }
  }, [questionsIter]);

  return { getNextQuestion, reset };
}
