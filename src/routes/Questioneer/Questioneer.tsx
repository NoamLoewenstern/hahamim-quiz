import "./Questioneer.scss";
import { useMachine } from "@xstate/react";
import { quizMachine } from "./quiz-machine/quiz-machine";
import { useGetNextQuestions } from "./useGetNextQuestions";
import { useGlobalLoadingSpinner } from "~/hooks/useLoadingSpinner";
import { MachineContext } from "./quiz-machine/machineContext";
import HeaderStartGame from "./HeaderStartGame";
import EndGame from "./EndGame";
import GameFlow from "./GameFlow";

export default function Questioneer() {
  const { open: openLoadingSpinner, close: closeLoadingSpinner } = useGlobalLoadingSpinner();
  const onLoadingQuestion = () => () => {
    openLoadingSpinner();
    return () => {
      closeLoadingSpinner();
    };
  };
  const { getNextQuestion, reset: resetQuestionsIters } = useGetNextQuestions();
  const [state, send, service] = useMachine(quizMachine, {
    services: {
      getNextQuestion: async () => getNextQuestion(),
      onLoadingQuestion,
      invalidateQuestions: async () => resetQuestionsIters(),
    },
  });

  const initState = state.matches("init");
  const endState = state.matches("end");
  const runningState = state.matches("question") || state.matches("feedback");

  return (
    <MachineContext.Provider value={[state, send, service]}>
      <div className="game-page-container">
        {initState && <HeaderStartGame />}
        {runningState && <GameFlow />}
        {endState && <EndGame />}
      </div>
    </MachineContext.Provider>
  );
}
