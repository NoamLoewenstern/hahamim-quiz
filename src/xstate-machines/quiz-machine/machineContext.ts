import { useMachine } from "@xstate/react";
import { createContext } from "react";
import { quizMachine } from ".";

const IMachineHookCB = () => useMachine(quizMachine);
type IMachineContext = ReturnType<typeof IMachineHookCB>;
export const MachineContext = createContext<IMachineContext>([] as unknown as IMachineContext);
