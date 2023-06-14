import { DB, DBKeys } from "./../types";
import { ref, getDatabase, query, get } from "firebase/database";

export async function getScores({ includeSum = false } = {}) {
  const qRef = ref(getDatabase(), DBKeys.scores + "/scores");
  const qScores = query(qRef);

  const snapshot = await get(qScores);
  const scores = [] as DB["scores"]["scores"][];
  snapshot.forEach((child) => {
    scores.push(child.val());
  });
  const sum = includeSum ? await getScoresSum() : null;
  return { sum, scores };
}
export async function getScoresSum() {
  const qRef = ref(getDatabase(), DBKeys.scores + "/sum");
  const qScores = query(qRef);

  const snapshot = await get(qScores);
  return snapshot.val() as number;
}
