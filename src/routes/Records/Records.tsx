import { useQuery } from "@tanstack/react-query";
import useUser from "~/hooks/useUser";
import { getRecords } from "~/firebase/lib/records";
import { getScores } from "~/firebase/lib/scores";
import ScoresChart from "./ScoresChart";

export default function Records() {
  const { user } = useUser();
  const { data: records, isLoading: isRecordsLoading } = useQuery(["records"], getRecords, {
    enabled: !!user,
  });
  const { data: scores, isLoading: isScoresLoading } = useQuery(
    ["scores"],
    () => getScores({ includeSum: true }),
    { enabled: !!user }
  );

  return (
    <div>
      <div className="records-page-container mt-6">
        <h2>רשימת השיאים</h2>
        <div id="records">
          {isRecordsLoading && <p>טוען...</p>}
          {records?.reverse()?.map((record, i) => (
            <p key={i}>{`${record.score} - ${record.name}`}</p>
          ))}
        </div>
      </div>
      <div className="records-page-container mt-6">
        <h2>סטטיסטיקות</h2>
        <h3>(הניקוד מעוגל לעשרות)</h3>
        {isScoresLoading && <p>טוען...</p>}
        {scores && <ScoresChart data={scores.scores} />}
      </div>
    </div>
  );
}
