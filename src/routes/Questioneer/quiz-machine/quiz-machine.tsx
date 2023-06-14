import { createMachine, assign, interpret } from "xstate";
import { z } from "zod";
import { calculateScore } from "./utils";
import { RabbiInfo } from "~/firebase/types";

interface QuizContext {
  currentQuestion: IQuestion | null;
  answeredCorrectly: boolean;
  answeredIndex: number | null;
  questionNumber: number;
  score: number;
  startTime: number;
  elapsedTime: number;
  interval: number;
  error: string | null;
}

const AnswerOption = z.object({
  value: RabbiInfo.shape.type,
  label: z.string(),
});
export type IAnswerOption = z.infer<typeof AnswerOption>;

export const Question = z.object({
  title: z.string(),
  options: z.array(AnswerOption),
  correctIndex: z.number(),
  difficultyLevel: z.enum(["easy", "medium", "hard"]),
});
export type IQuestion = z.infer<typeof Question>;

const enumQuizEventTypes = {
  START: "START",
  ANSWER: "ANSWER",
  NEXT: "NEXT",
  RESET: "RESET",
  TICK: "TICK",
} as const;
type QuizEventTypes = (typeof enumQuizEventTypes)[keyof typeof enumQuizEventTypes];

type QuizEvent = {
  type: QuizEventTypes;
  answerIndex?: number;
  questions?: IQuestion[];
};

const QuizStateTypes = {
  init: "init",
  loadQuestion: "loadQuestion",
  checkQuestionValid: "checkQuestionValid",
  question: "question",
  feedback: "feedback",
  end: "end",
  reset: "reset",
  error: "error",
} as const;

type QuizStateTypes = {
  value: (typeof QuizStateTypes)[keyof typeof QuizStateTypes];
  context: QuizContext;
};

const QuizActionTypes = {
  incrementElapsed: "incrementElapsed",
  resetElapsed: "resetElapsed",
  calculateScoreForQuestion: "calculateScoreForQuestion",
  assignAnsweredCorrectly: "assignAnsweredCorrectly",
} as const;

type QuizAction = {
  type: (typeof QuizActionTypes)[keyof typeof QuizActionTypes];
};
type QuizService = {
  timerService: (context: QuizContext) => (callback: (event: QuizEvent) => void) => () => void;
} & { [key: string]: { data: any } };

const initContext: QuizContext = {
  currentQuestion: null,
  answeredCorrectly: false,
  answeredIndex: null,
  questionNumber: 0,
  score: 0,
  startTime: 0,
  elapsedTime: 0,
  interval: 51, // interval for sending TICK events (in seconds)
  error: null,
};
export const quizMachine = createMachine<QuizContext, QuizEvent, QuizStateTypes, QuizService>(
  {
    predictableActionArguments: true,
    id: "quiz",
    initial: QuizStateTypes.init,
    context: initContext,
    states: {
      init: {
        entry: assign(initContext),
        on: {
          START: {
            target: QuizStateTypes.loadQuestion,
          },
        },
      },

      loadQuestion: {
        invoke: {
          src: "getNextQuestion", // passed in as a deps service
          onDone: {
            target: QuizStateTypes.checkQuestionValid,
            actions: assign({
              currentQuestion: (_, event) => event.data,
              questionNumber: (ctx) => ctx.questionNumber + 1,
            }),
          },
          onError: {
            target: QuizStateTypes.error,
            actions: assign({ error: (_, event) => event.data }),
          },
        },
      },

      checkQuestionValid: {
        always: [
          // always transition to the next state
          {
            target: QuizStateTypes.end, // after last question
            cond: (ctx) => ctx.currentQuestion === null,
          },
          {
            target: QuizStateTypes.question, // durring the quiz
            cond: (ctx) => Question.safeParse(ctx.currentQuestion).success,
          },
          { target: QuizStateTypes.error }, // default to error
        ],
      },

      question: {
        entry: QuizActionTypes.resetElapsed,
        invoke: { src: "timerService" },
        on: {
          TICK: {
            actions: QuizActionTypes.incrementElapsed,
          },
          ANSWER: {
            target: QuizStateTypes.feedback,
            actions: QuizActionTypes.incrementElapsed,
          },
        },
      },

      feedback: {
        entry: [QuizActionTypes.calculateScoreForQuestion, QuizActionTypes.assignAnsweredCorrectly],
        on: {
          NEXT: {
            target: QuizStateTypes.loadQuestion,
          },
        },
      },

      end: {
        on: {
          RESET: {
            target: QuizStateTypes.reset,
          },
        },
      },

      reset: {
        invoke: {
          src: "invalidateQuestions",
          onDone: {
            target: QuizStateTypes.init,
          },
          onError: {
            target: QuizStateTypes.error,
            actions: assign({ error: (_, event) => event.data }),
          },
        },
      },

      error: {
        // log the error
        entry: (context, event) => {
          console.error(`Error: ${context.error}`);
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
      [QuizActionTypes.calculateScoreForQuestion]: assign({
        score: (context, event) => {
          const { answerIndex: answer } = event;
          if (answer === undefined) throw new Error("Answer is undefined");
          if (!context.currentQuestion) throw new Error("Current question is null");
          if (answer === context.currentQuestion.correctIndex) {
            return context.score + calculateScore({ elapsedTime: context.elapsedTime });
          }
          return context.score;
        },
      }),
      [QuizActionTypes.assignAnsweredCorrectly]: assign({
        answeredIndex: (_, event) => {
          if (event.answerIndex === undefined) throw new Error("Answer is undefined");
          return event.answerIndex;
        },
        answeredCorrectly: (ctx, event) => {
          return event.answerIndex === ctx.currentQuestion?.correctIndex;
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
      getNextQuestion: async (context) => {
        throw new Error(
          "getNextQuestion is not implemented. Must be passed in as a service as deps injection"
        );
      },
      invalidateQuestions: async (context) => {
        throw new Error(
          "invalidateQuestions is not implemented. Must be passed in as a service as deps injection"
        );
      },
    },
  }
);
