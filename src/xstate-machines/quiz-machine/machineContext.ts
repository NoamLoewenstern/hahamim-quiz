import { useMachine } from "@xstate/react";
import { createContext } from "react";
import { type IQuizMachine, createQuizMachine } from "./quiz-machine";

// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
const IMachineHookCB = () => useMachine<IQuizMachine>(createQuizMachine({} as any));
type IMachineContext = ReturnType<typeof IMachineHookCB>;
export const MachineContext = createContext<IMachineContext>([] as unknown as IMachineContext);
