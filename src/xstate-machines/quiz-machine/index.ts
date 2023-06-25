import { useContext } from "react";
import { MachineContext } from "./machineContext";

export const useQuizMachine = () => useContext(MachineContext);
