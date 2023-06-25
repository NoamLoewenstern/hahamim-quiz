import { z } from "zod";
import { type ReverseKeyValue } from "~/utils/types";

export const DifficultyEnum = {
  EASY: "EASY",
  MEDIUM: "MEDIUM",
  HARD: "HARD",
  0: "EASY",
  1: "MEDIUM",
  2: "HARD",
} as const;

export const AnswerEnum = {
  TANA: "TANA",
  AMORA: "AMORA",
  RISHON: "RISHON",
  ACHARON: "ACHARON",
} as const;

export const AnswerTypeInHebrew = {
  [AnswerEnum.TANA]: "תנא",
  [AnswerEnum.AMORA]: "אמורא",
  [AnswerEnum.RISHON]: "ראשון",
  [AnswerEnum.ACHARON]: "אחרון",
} as const;
export const AnswerTypeFromHebrew: ReverseKeyValue<typeof AnswerTypeInHebrew> = {
  ["תנא"]: AnswerEnum.TANA,
  ["אמורא"]: AnswerEnum.AMORA,
  ["ראשון"]: AnswerEnum.RISHON,
  ["אחרון"]: AnswerEnum.ACHARON,
};

export const AnswerTypes = [
  AnswerEnum.TANA,
  AnswerEnum.AMORA,
  AnswerEnum.RISHON,
  AnswerEnum.ACHARON,
] as const;
export type IAnswerType = (typeof AnswerTypes)[number];
export type IAnswerTypeInHebrew = keyof typeof AnswerTypeFromHebrew;

export const Difficulties = [
  DifficultyEnum.EASY,
  DifficultyEnum.MEDIUM,
  DifficultyEnum.HARD,
] as const;
export const DifficultyInHebrew = {
  [DifficultyEnum.EASY]: "קל",
  [DifficultyEnum.MEDIUM]: "בינוני",
  [DifficultyEnum.HARD]: "קשה",
} as const;
export const DifficultyFromHebrew: ReverseKeyValue<typeof DifficultyInHebrew> = {
  ["קל"]: DifficultyEnum.EASY,
  ["בינוני"]: DifficultyEnum.MEDIUM,
  ["קשה"]: DifficultyEnum.HARD,
};

export type IDifficulty = keyof typeof DifficultyInHebrew;
export type IDifficultyInHebrew = keyof typeof DifficultyFromHebrew;

export const QuestionEntry = z.object({
  question: z.string().min(1).max(255),
  answer: z.enum(AnswerTypes),
  approved: z.boolean().optional().default(false),
  difficulty: z.enum(Difficulties),
});
export type IQuestionEntry = z.infer<typeof QuestionEntry>;

export const ScoreEntry = z.object({
  score: z.number().int().min(0),
  count: z.number().int().min(0),
});
export type IScoreEntry = z.infer<typeof ScoreEntry>;

export const RecordEntry = z.object({
  name: z.string().min(1).max(255),
  score: z.number().int().min(0),
});
export type IRecordEntry = z.infer<typeof RecordEntry>;
