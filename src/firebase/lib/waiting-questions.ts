import { ref, getDatabase, get, child, remove, set } from "firebase/database";
import { AddQuestion } from "../types";

export async function getWaitingNewQuestions() {
  const waitingRef = ref(getDatabase(), "waiting");
  const waitingQuestions = (await get(waitingRef)).val();
  if (!waitingQuestions) {
    return {};
  }
  return waitingQuestions as Record<string, AddQuestion>;
}

export async function acceptWaitingQuestion(id: string) {
  const waitingQuestion = (
    await get(ref(getDatabase(), `waiting/${id}`))
  ).val() as AddQuestion | null;
  if (!waitingQuestion) {
    throw new Error(`Waiting Question ${id} not found`);
  }

  const questionLevelRef = ref(getDatabase(), `questions/${waitingQuestion.level}`);
  const levelQuestionsCount = (await get(questionLevelRef)).size;
  const newId = levelQuestionsCount; // since keys start from 0
  const newQuestionRef = ref(getDatabase(), `questions/${waitingQuestion.level}/${newId}`);
  await set(newQuestionRef, { name: waitingQuestion.question, type: waitingQuestion.answer });

  await removeWaitingQuestion(id);
}

export async function removeWaitingQuestion(id: string) {
  const waitingRef = ref(getDatabase(), "waiting");
  await remove(child(waitingRef, id));
}
