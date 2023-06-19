import { useMachine } from "@xstate/react";
import { MachineContext } from "~/xstate-machines/quiz-machine/machineContext";
import { quizMachine } from "~/xstate-machines/quiz-machine";
import { useGetNextQuestions } from "./useGetNextQuestions";
import HeaderStartGame from "./HeaderStartGame";
import EndGame from "./EndGame";
import GameFlow from "./GameFlow";

export default function Questioneer() {
  const { getNextQuestion, reset: resetQuestionsIters } = useGetNextQuestions();
  const [state, send, service] = useMachine(quizMachine, {
    services: {
      getNextQuestion: async () => getNextQuestion(),
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
