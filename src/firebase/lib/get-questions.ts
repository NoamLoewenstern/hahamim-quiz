import { child, get, getDatabase, ref } from "firebase/database";
import { IDifficulty, RabbiInfo } from "../types";
import { getRandomIntegers } from "~/utils/helpers";

export async function* getQuestionsByDifficulty({
  difficultyLevel,
  numberOfQuestions,
}: {
  difficultyLevel: IDifficulty;
  numberOfQuestions: number;
}) {
  const questionsRef = ref(getDatabase(), `questions/${difficultyLevel}`);
  const countSnapshot = await get(child(questionsRef, "count"));
  const countQuestionsInDB = countSnapshot.val();
  const qIds = getRandomIntegers(1, countQuestionsInDB, {
    unique: true,
    count: numberOfQuestions,
  });
  for (const id of qIds) {
    const snapshot = await get(child(questionsRef, id.toString()));
    yield snapshot.val() as RabbiInfo;
  }
  return null;
}
