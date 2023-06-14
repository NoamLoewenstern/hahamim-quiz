import useUser from "~/hooks/useUser";
import Login from "./Login";
import { LoadingSpinnerModal } from "~/hooks/useLoadingSpinner";
import { useQuery } from "@tanstack/react-query";
import {
  acceptWaitingQuestion,
  getWaitingNewQuestions,
  removeWaitingQuestion,
} from "~/firebase/lib/waiting-questions";
import { useState } from "react";
import { getScoresSum } from "~/firebase/lib/scores";

export default function Admin() {
  const { user, isAdmin, isLoadingUser } = useUser();
  const {
    data: waitingNewQuestions,
    isLoading,
    error: waitingQuestionsError,
    refetch: refetchWaitingQuestions,
  } = useQuery(["getWaitingNewQuestions"], getWaitingNewQuestions);
  const { data: scoresSum } = useQuery(["getScoresSum"], getScoresSum);
  const [error, setError] = useState<Error | null>(null);

  const handleAddQuestionToDB = async (questionKey: string) => {
    try {
      await acceptWaitingQuestion(questionKey);
      refetchWaitingQuestions();
    } catch (e) {
      console.error(e);
      setError(e as Error);
    }
  };
  const handleRemoveWaitingQuestion = async (questionKey: string) => {
    try {
      await removeWaitingQuestion(questionKey);
      refetchWaitingQuestions();
    } catch (e) {
      console.error(e);
      setError(e as Error);
    }
  };

  if (isLoadingUser) return <LoadingSpinnerModal />;
  if (!user || !isAdmin) return <Login />;
  if (isLoading)
    return (
      <>
        <p>Loading Waiting Questions...</p>
        <LoadingSpinnerModal />
      </>
    );
  if (error || waitingQuestionsError)
    return <p>Error: {(error || waitingQuestionsError)?.toString?.()}</p>;
  return (
    <div>
      <div className="m-8">
        <h1>שאלות חדשות שהועלו:</h1>
        {!waitingNewQuestions || Object.keys(waitingNewQuestions).length === 0 ? (
          <p>אין שאלות חדשות!</p>
        ) : (
          Object.entries(waitingNewQuestions).map((newQuestion) => {
            const [key, { question, answer, level }] = newQuestion;
            return (
              <div className="m-4 mb-8" key={key}>
                <h2>{question}</h2>
                <h2>{answer}</h2>
                <h2>{level}</h2>
                <button className="btn m-2" onClick={() => handleAddQuestionToDB(key)}>
                  אשר
                </button>
                <button className="btn" onClick={() => handleRemoveWaitingQuestion(key)}>
                  דחה
                </button>
                <a
                  className="btn m-4"
                  href={`https://google.com/search?q=${question}`}
                  target="_blank"
                >
                  חפש בגוגל
                </a>
              </div>
            );
          })
        )}
      </div>

      {scoresSum && <p>Played Game: {scoresSum}</p>}
    </div>
  );
}
