import { useMachine } from "@xstate/react";
import { MachineContext } from "~/xstate-machines/quiz-machine/machineContext";
import { createQuizMachine } from "~/xstate-machines/quiz-machine/quiz-machine";
import { useGetQuizQuestions } from "./useGetNextQuestions";
import HeaderStartGame from "./HeaderStartGame";
import EndGame from "./EndGame";
import GameFlow from "./GameFlow";
import { NUMBER_OF_QUESTIONS_FOR_EACH_LEVEL } from "~/config";
import { LoadingSpinnerModal } from "~/hooks/useLoadingSpinner";

export default function Questioneer() {
  const { getNextQuestion, reset: resetQuestionsIters } = useGetQuizQuestions({
    countPerDifficulty: NUMBER_OF_QUESTIONS_FOR_EACH_LEVEL,
    difficulties: ["EASY", "MEDIUM", "HARD"],
  });
  const [state, send, service] = useMachine(() =>
    createQuizMachine({
      getNextQuizQuestion: getNextQuestion,
      invalidateQuestions: resetQuestionsIters,
    })
  );

  const initState = state.matches("init");
  const waitingForNextQuestionState = state.matches("waitBeforeNextQuestion");
  const endState = state.matches("end");
  const runningState = state.matches("question") || state.matches("feedback");

  return (
    <MachineContext.Provider value={[state, send, service]}>
      <div className="game-page-container">
        {initState && <HeaderStartGame />}
        {waitingForNextQuestionState && <LoadingSpinnerModal />}
        {runningState && <GameFlow />}
        {endState && <EndGame />}
      </div>
    </MachineContext.Provider>
  );
}
