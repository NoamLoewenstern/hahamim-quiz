import { useState, useCallback } from "react";
import { NUMBER_OF_QUESTIONS_FOR_EACH_LEVEL } from "~/config";
import { getQuestionsByDifficulty } from "~/firebase/lib/get-questions";
import { IRabbiInfoWithDifficulty } from "~/firebase/types";
import { asyncChain } from "~/utils/helpers";
import { IQuestion } from "./quiz-machine/quiz-machine";

export function getQuestionsIterators() {
  const iters = (["easy", "medium", "hard"] as const).map((level) =>
    getQuestionsByDifficulty({
      difficultyLevel: level,
      numberOfQuestions: NUMBER_OF_QUESTIONS_FOR_EACH_LEVEL,
    })
  );
  return asyncChain(...iters);
}

async function getNextQuestionFromIter(
  questionsIter: AsyncGenerator<IRabbiInfoWithDifficulty, void>
) {
  const { value, done } = await questionsIter.next();
  if (done || !value) {
    return null;
  }
  if (!value.name) {
    console.warn("Question without name", value);
  }
  const questionOptions = [
    { label: "תנא", value: "תנא" },
    { label: "אמורא", value: "אמורא" },
    { label: "ראשון", value: "ראשון" },
    { label: "אחרון", value: "אחרון" },
  ] satisfies IQuestion["options"];
  const question: IQuestion = {
    title: value.name,
    options: questionOptions,
    correctIndex: questionOptions.findIndex((option) => option.value === value.type),
    difficultyLevel: value.difficultyLevel,
  };
  return question;
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
