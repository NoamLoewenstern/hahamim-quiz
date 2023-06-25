import { MAX_SCORE_PER_QUESTION } from "~/config";

export function calculateScore({
  elapsedTime,
  maxScorePerQuestion = MAX_SCORE_PER_QUESTION,
}: {
  elapsedTime: number;
  maxScorePerQuestion?: number;
}) {
  return Math.floor(maxScorePerQuestion * Math.pow(Math.E, -0.15 * (elapsedTime / 1000)));
}

export function getFormatedTime(elapsedTime: number) {
  const seconds = Math.floor(elapsedTime / 1000)
    .toFixed()
    .toString();
  const milliseconds = Math.floor((elapsedTime % 1000) / 10).toString();
  const formatedTime = `${seconds}:${milliseconds.padStart(2, "0")}`;
  return formatedTime;
}
