import {
  ref,
  getDatabase,
  query,
  orderByChild,
  get,
  increment,
  update,
  push,
  limitToFirst,
} from "firebase/database";
import { DB, DBKeys, RecordScore } from "../types";

export async function getRecords() {
  const qRef = ref(getDatabase(), DBKeys.records);
  const qRecords = query(qRef, orderByChild("score"));

  const snapshot = await get(qRecords);
  const records = [] as RecordScore[];
  snapshot.forEach((child) => {
    const record = child.val();
    if (!record?.name || !record?.score) return;
    records.push(record);
  });
  return records;
}

export async function isRecordInTopRank(score: number) {
  const records = await getRecords();
  const lastHighestScore = records[0].score;
  return records.length < 10 || score > lastHighestScore;
}

export async function getRecordPosition(score: number) {
  const calculatedScore = Math.floor(score / 10);
  const scoresRef = ref(getDatabase(), DBKeys.scores);
  const scores = (await get(scoresRef)).val() as DB["scores"];
  const totalCountPlayed = scores.countPlayed;
  const scoresInDB = scores.scores as unknown as number[];

  const higherScores = Object.keys(scoresInDB).filter((key) => Number(key) >= calculatedScore);
  const countPlayedWhoHaveHigherScore = higherScores.reduce(
    (acc, key) => acc + scoresInDB[+key],
    0
  );

  const position = countPlayedWhoHaveHigherScore + 1;

  await update(scoresRef, {
    [`scores/${calculatedScore}`]: increment(1),
    countPlayed: increment(1),
  });
  return { position, totalCountPlayed: totalCountPlayed + 1 };
}

export async function addRecord(newRecord: RecordScore) {
  const qRef = ref(getDatabase(), DBKeys.records);
  const qRecords = query(qRef, orderByChild("score"));
  const snapshot = await get(qRecords);
  if (snapshot.size < 10) {
    await push(ref(getDatabase(), DBKeys.records), newRecord);
    return;
  }
  const lowestHighScoreSpanshot = await get(query(qRef, orderByChild("score"), limitToFirst(1)));
  const lowestHighScoreEntry = Object.entries(lowestHighScoreSpanshot.val())[0] as [
    string,
    RecordScore
  ];

  const lowestHighScoreRef = ref(getDatabase(), `${DBKeys.records}/${lowestHighScoreEntry[0]}`);
  await update(lowestHighScoreRef, newRecord);
}
