import {
  createMachine,
  assign,
  raise,
  type InvokeConfig,
  spawn,
  type Sender,
  type Spawnable,
} from "xstate";
import { z } from "zod";
import { calculateScore } from "./utils";
import { type IAnswerType, type IQuestionEntry, QuestionEntry } from "~/lib/db/types";
import { pure } from "xstate/lib/actions";

interface QuizContext {
  nextQuestions: IQuestionEntry[];
  currentQuestion: IQuestionEntry | null;
  answeredCorrectly: boolean;
  answered: IAnswerType | null;
  questionNumber: number;
  score: number;
  startTime: number;
  elapsedTime: number;
  interval: number;
  error: string | null;
  fetcherActorRef: Spawnable | null;
}

const AnswerOption = z.object({
  value: QuestionEntry.shape.answer,
  label: z.string(),
});
export type IAnswerOption = z.infer<typeof AnswerOption>;

const QuizEvent = {
  START: "START",
  WAIT_BEFORE_NEXT_QUESTION: "WAIT_BEFORE_NEXT_QUESTION",
  CHECK_QUESTION_VALID: "CHECK_QUESTION_VALID",
  NEXT: "NEXT",
  RESET: "RESET",
  TICK: "TICK",
} as const;
type IQuizEvent = (typeof QuizEvent)[keyof typeof QuizEvent];

type QuizEvent =
  | {
      type: IQuizEvent;
    }
  | QuizAnswerEvent
  | {
      type: "GOT_NEXT_QUESTION";
      data: IQuestionEntry | null;
    }
  | {
      type: "GOT_NEXT_QUESTION_ERROR";
      data: string;
    };
type QuizAnswerEvent = {
  type: "ANSWER";
  answer: IAnswerType;
};
const QuizStates = {
  init: "init",
  waitBeforeNextQuestion: "waitBeforeNextQuestion",
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
  nextQuestions: [],
  currentQuestion: null,
  answeredCorrectly: false,
  answered: null,
  questionNumber: 0,
  score: 0,
  startTime: 0,
  elapsedTime: 0,
  interval: 51, // interval for sending TICK events (in seconds)
  error: null,
  fetcherActorRef: null,
};
type TInvokeConfig<E extends QuizEvent = QuizEvent> = InvokeConfig<QuizContext, E>;

/*
THE MACHINE
*/
export const createQuizMachine = ({
  getNextQuizQuestion,
  invalidateQuestions,
}: {
  getNextQuizQuestion: () => Promise<IQuestionEntry | null>;
  invalidateQuestions: () => void | Promise<void>;
}) => {
  function invokeGetNextQuestion({ onDoneTarget }: { onDoneTarget?: string } = {}): TInvokeConfig {
    return {
      src: getNextQuizQuestion, // passed in as a deps service
      onDone: {
        target: onDoneTarget,

        actions: [
          assign((ctx, event) => ({
            nextQuestions: [...ctx.nextQuestions, event.data as IQuestionEntry],
          })),
        ],
      },
      onError: {
        target: QuizStates.error,
        actions: assign({ error: (_, event) => event.data as string }),
      },
    };
  }
  const getNextQuizQuestionCB = async (callback: Sender<QuizEvent>) => {
    try {
      const question = await getNextQuizQuestion();
      callback({ type: "GOT_NEXT_QUESTION", data: question });
    } catch (error) {
      console.error(error);

      callback({
        type: "GOT_NEXT_QUESTION_ERROR",
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        data: `Error Get Next Question: ${error as any}`,
      });
    }
  };
  const spawnGetNextQuestionActorAction = assign<QuizContext>({
    fetcherActorRef: () => spawn(getNextQuizQuestionCB, `getNextQuizQuestion.${Date.now()}`),
  });

  return createMachine<QuizContext, QuizEvent, QuizStates, QuizService>(
    {
      type: "compound",
      predictableActionArguments: true,
      id: "quizMachine",
      strict: true,
      initial: QuizStates.init,
      context: initContext,
      on: {
        GOT_NEXT_QUESTION: {
          actions: assign({
            nextQuestions: (ctx, event) =>
              !event.data ? ctx.nextQuestions : [...ctx.nextQuestions, event.data],
          }),
        },
        GOT_NEXT_QUESTION_ERROR: {
          actions: assign({ error: (ctx, event) => event.data as unknown as string }),
          target: QuizStates.error,
        },
      },
      states: {
        init: {
          entry: [
            assign(initContext),
            spawnGetNextQuestionActorAction,
            spawnGetNextQuestionActorAction,
            spawnGetNextQuestionActorAction,
            spawnGetNextQuestionActorAction,
          ],
          on: {
            [QuizEvent.START]: QuizStates.waitBeforeNextQuestion,
          },
        },

        waitBeforeNextQuestion: {
          entry: pure((ctx) => {
            if (ctx.nextQuestions.length > 0) {
              return raise(QuizEvent.NEXT);
            }
            return;
          }),
          after: {
            300: {
              target: QuizStates.loadQuestion,
              cond: (ctx) => ctx.nextQuestions.length > 0,
            },
            800: {
              target: QuizStates.loadQuestion,
              cond: (ctx) => ctx.nextQuestions.length > 0,
            },
            1400: {
              target: QuizStates.loadQuestion,
              cond: (ctx) => ctx.nextQuestions.length > 0,
            },
            7500: {
              target: QuizStates.error,
              actions: assign({ error: "TIME OUT Waiting for next question" }),
            },
          },
          on: {
            [QuizEvent.NEXT]: QuizStates.loadQuestion,
          },
        },

        loadQuestion: {
          entry: pure((ctx) => {
            if (ctx.nextQuestions.length === 0) {
              return raise(QuizEvent.WAIT_BEFORE_NEXT_QUESTION);
            }
            return [
              assign((ctx) => ({
                currentQuestion: ctx.nextQuestions[0] ?? null,
                questionNumber: ctx.questionNumber + 1,
                nextQuestions: ctx.nextQuestions.slice(1),
              })),
              raise(QuizEvent.CHECK_QUESTION_VALID),
            ];
          }),
          on: {
            WAIT_BEFORE_NEXT_QUESTION: QuizStates.waitBeforeNextQuestion,
            CHECK_QUESTION_VALID: [
              {
                target: QuizStates.question, // durring the quiz
                cond: (ctx) => QuestionEntry.safeParse(ctx.currentQuestion).success,
              },
              {
                target: QuizStates.question, // durring the quiz
                cond: (ctx) => ctx.nextQuestions.length > 0, // has another question
              },
              {
                // default to error
                target: QuizStates.error,
                actions: assign({ error: "Invalid Question" }),
              },
            ],
          },
        },

        question: {
          entry: [QuizActionTypes.resetElapsed, spawnGetNextQuestionActorAction],
          // invoke: [{ src: "timerService" }, invokeGetNextQuestion()],
          invoke: [{ src: "timerService" }],
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
            NEXT: [
              {
                target: QuizStates.loadQuestion,
                cond: (ctx) => {
                  console.log(`ctx.nextQuestions.length`, ctx.nextQuestions.length);
                  console.log(ctx.nextQuestions);

                  return ctx.nextQuestions.length > 0;
                }, // has another question
              },
              {
                target: QuizStates.end, // after last question
              },
            ],
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
            src: async () => invalidateQuestions(),
            onDone: QuizStates.init,
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
      },
    }
  );
};
export type IQuizMachine = ReturnType<typeof createQuizMachine>;
