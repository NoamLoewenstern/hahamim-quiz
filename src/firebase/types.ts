import { z } from "zod";

export const DBKeys = {
  questions: "questions",
  records: "records",
  scores: "scores",
} as const;

export interface DB {
  questions: Questions;
  records: { [key: string]: RecordScore };
  scores: {
    scores: { [key: string]: number };
    countPlayed: number;
  };
}
export const DifficultiesTypes = {
  easy: "easy",
  medium: "medium",
  hard: "hard",
  0: "easy",
  1: "medium",
  2: "hard",
} as const;
export const DifficultyInHebrew = {
  [DifficultiesTypes.easy]: "קל",
  [DifficultiesTypes.medium]: "בינוני",
  [DifficultiesTypes.hard]: "קשה",
} as const;
export const Difficulties = [
  DifficultiesTypes.easy,
  DifficultiesTypes.medium,
  DifficultiesTypes.hard,
] as const;
export type IDifficulty = (typeof Difficulties)[number];
export type Questions = Record<IDifficulty, DifficultyTable>;

export interface DifficultyTable {
  [key: string]: IRabbiInfo;
}
export const RabbiTypeKeys = ["תנא", "אמורא", "ראשון", "אחרון"] as const;
export type IRabbiType = (typeof RabbiTypeKeys)[number];

export const RabbiInfo = z.object({
  name: z.string(),
  type: z.enum(RabbiTypeKeys),
});
export type IRabbiInfo = z.infer<typeof RabbiInfo>;

export const RabbiInfoWithDifficulty = RabbiInfo.extend({
  difficultyLevel: z.enum(Difficulties),
});
export type IRabbiInfoWithDifficulty = z.infer<typeof RabbiInfoWithDifficulty>;

export interface RecordScore {
  name: string;
  score: number;
}

export type AddQuestion = {
  question: string;
  answer: string;
  level: string;
};
