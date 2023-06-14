import { IDifficulty, RabbiInfoWithDifficulty } from "~/firebase/types";
import { get, getDatabase, ref } from "firebase/database";
import { getRandomIntegers } from "~/utils/helpers";

export async function* getQuestionsByDifficulty({
  difficultyLevel,
  numberOfQuestions,
}: {
  difficultyLevel: IDifficulty;
  numberOfQuestions: number;
}) {
  const questionsRef = ref(getDatabase(), `questions/${difficultyLevel}`);
  const snap = await get(questionsRef);
  const countQuestionsInDB = snap.size;
  const randomIndexesUpToMaxCount = getRandomIntegers(0, countQuestionsInDB - 1, {
    unique: true,
    count: numberOfQuestions,
  });
  for (const index of randomIndexesUpToMaxCount) {
    const question = snap.child(index.toString()).val();
    const qInfo = RabbiInfoWithDifficulty.parse({ ...question, difficultyLevel });
    yield qInfo;
  }
  return null;
}
