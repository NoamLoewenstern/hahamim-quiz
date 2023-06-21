import { createMachine, assign, raise, type InvokeConfig } from "xstate";
import { z } from "zod";
import { calculateScore } from "./utils";
import { type IAnswerType, type IQuestionEntry, QuestionEntry } from "~/lib/db/types";
import { useContext } from "react";
import { MachineContext } from "./machineContext";

interface QuizContext {
  tryTimes: number;
  nextQuestion: IQuestionEntry | null;
  currentQuestion: IQuestionEntry | null;
  answeredCorrectly: boolean;
  answered: IAnswerType | null;
  questionNumber: number;
  score: number;
  startTime: number;
  elapsedTime: number;
  interval: number;
  error: string | null;
}

const AnswerOption = z.object({
  value: QuestionEntry.shape.answer,
  label: z.string(),
});
export type IAnswerOption = z.infer<typeof AnswerOption>;

const enumQuizEventTypes = {
  START: "START",
  CHECK_QUESTION_VALID: "CHECK_QUESTION_VALID",
  ANSWER: "ANSWER",
  NEXT: "NEXT",
  RESET: "RESET",
  TICK: "TICK",
} as const;
type QuizEventTypes = (typeof enumQuizEventTypes)[keyof typeof enumQuizEventTypes];

type QuizAnswerEvent = {
  type: Extract<QuizEventTypes, "ANSWER">;
  answer: IAnswerType;
};
type QuizEvent =
  | {
      type: Exclude<QuizEventTypes, "ANSWER">;
    }
  | QuizAnswerEvent;

const QuizStates = {
  init: "init",
  readyForFirstQuestion: "readyForFirstQuestion",
  loadQuestion: "loadQuestion",
  checkQuestionValid: "checkQuestionValid",
  question: "question",
  feedback: "feedback",
  end: "end",
  reset: "reset",
  error: "error",
} as const;

type QuizStates = {
  value: (typeof QuizStates)[keyof typeof QuizStates];
  context: QuizContext;
};

const QuizActionTypes = {
  incrementElapsed: "incrementElapsed",
  resetElapsed: "resetElapsed",
  onAnswer: "onAnswer",
} as const;

type QuizService = {
  timerService: (context: QuizContext) => (callback: (event: QuizEvent) => void) => () => void;
} & { [key: string]: { data: unknown } };

const initContext: QuizContext = {
  tryTimes: 5,
  nextQuestion: null,
  currentQuestion: null,
  answeredCorrectly: false,
  answered: null,
  questionNumber: 0,
  score: 0,
  startTime: 0,
  elapsedTime: 0,
  interval: 51, // interval for sending TICK events (in seconds)
  error: null,
};
const quizMachineFactory = () =>
  createMachine<QuizContext, QuizEvent, QuizStates, QuizService>(
    {
      predictableActionArguments: true,
      id: "quiz",
      initial: QuizStates.init,
      context: initContext,
      states: {
        init: {
          entry: assign(initContext),
          invoke: invokeGetNextQuestion({ onDoneTarget: QuizStates.readyForFirstQuestion }),
        },
        readyForFirstQuestion: {
          on: {
            START: {
              target: QuizStates.loadQuestion,
            },
          },
        },

        loadQuestion: {
          entry: [
            assign({
              currentQuestion: (ctx) => ctx.nextQuestion,
              questionNumber: (ctx) => ctx.questionNumber + 1,
              nextQuestion: null,
            }),
            raise("CHECK_QUESTION_VALID"),
          ],
          on: {
            CHECK_QUESTION_VALID: [
              {
                target: QuizStates.end, // after last question
                cond: (ctx) => ctx.currentQuestion === null,
              },
              {
                target: QuizStates.question, // durring the quiz
                cond: (ctx) => QuestionEntry.safeParse(ctx.currentQuestion).success,
              },
              { target: QuizStates.error }, // default to error
            ],
          },
        },

        question: {
          entry: QuizActionTypes.resetElapsed,
          invoke: [{ src: "timerService" }, invokeGetNextQuestion()],
          on: {
            TICK: {
              internal: true,
              actions: QuizActionTypes.incrementElapsed,
            },
            ANSWER: {
              target: QuizStates.feedback,
              actions: [QuizActionTypes.incrementElapsed, QuizActionTypes.onAnswer],
            },
          },
        },

        feedback: {
          on: {
            NEXT: {
              target: QuizStates.loadQuestion,
            },
          },
        },

        end: {
          on: {
            RESET: {
              target: QuizStates.reset,
            },
          },
        },

        reset: {
          invoke: {
            src: "invalidateQuestions",
            onDone: {
              target: QuizStates.init,
            },
            onError: {
              target: QuizStates.error,
              actions: assign({ error: (_, event) => event.data as string }),
            },
          },
        },

        error: {
          // log the error
          entry: (context, event) => {
            console.error(`Error: ${context.error ?? "unknown"}`);
            console.error("Context", context);
            console.error("event", event);
          },
          type: "final",
        },
      },
    },
    {
      actions: {
        [QuizActionTypes.incrementElapsed]: assign({
          elapsedTime: (context) => Date.now() - context.startTime,
        }),
        [QuizActionTypes.resetElapsed]: assign({
          startTime: () => Date.now(),
          elapsedTime: 0,
        }),
        [QuizActionTypes.onAnswer]: assign({
          score: (context, { type, answer }: QuizAnswerEvent) => {
            if (type !== "ANSWER") throw new Error("Event type must come from ANSWER");
            if (answer === context.currentQuestion?.answer) {
              return context.score + calculateScore({ elapsedTime: context.elapsedTime });
            }
            return context.score;
          },
          answered: (_, event) => event.answer,
          answeredCorrectly: (ctx, event) => {
            return event.answer === ctx.currentQuestion?.answer;
          },
        }),
      },
      services: {
        timerService: (context) => (callback) => {
          const interval = setInterval(() => {
            callback("TICK");
          }, context.interval);
          return () => clearInterval(interval);
        },
        // eslint-disable-next-line @typescript-eslint/require-await
        getNextQuestion: async (_) => {
          throw new Error(
            "getNextQuestion is not implemented. Must be passed in as a service as deps injection"
          );
        },
        // eslint-disable-next-line @typescript-eslint/require-await
        invalidateQuestions: async (_) => {
          throw new Error(
            "invalidateQuestions is not implemented. Must be passed in as a service as deps injection"
          );
        },
      },
    }
  );

function invokeGetNextQuestion({ onDoneTarget }: { onDoneTarget?: string } = {}): InvokeConfig<
  QuizContext,
  QuizEvent
> {
  return {
    src: "getNextQuestion", // passed in as a deps service
    onDone: {
      target: onDoneTarget,
      actions: assign({
        nextQuestion: (_, event) => event.data as IQuestionEntry,
      }),
    },
    onError: {
      target: QuizStates.error,
      actions: assign({ error: (_, event) => event.data as string }),
    },
  };
}

export const quizMachine = quizMachineFactory();
export const useQuizMachine = () => useContext(MachineContext);
