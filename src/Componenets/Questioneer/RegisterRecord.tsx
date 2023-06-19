import { useState } from "react";
import { api } from "~/utils/api";

export default function RegisterRecord({ score }: { score: number }) {
  const [name, setName] = useState("");
  const [addedRecord, setAddedRecord] = useState(false);
  const [error, setError] = useState("");
  const scoreDevidedByTen = Math.floor(score / 10);

  const { data: isRecordInTopRank } = api.records.isTopRank.useQuery({ score });
  const addNewTopRecord = api.records.addNewTopRecord.useMutation({
    onSuccess: () => {
      setAddedRecord(true);
      setError("");
      setName("");
    },
    onError: (error) => {
      const msg = error instanceof Error ? error.message : (error as any).toString();
      setError(msg);
    },
  });
  const { error: addPlayerError } = api.records.addAnotherPlayed.useQuery({
    score: scoreDevidedByTen,
  });

  const handleAddTopRecord = () => {
    addNewTopRecord.mutate({ score, name });
  };

  if (error) return <div className="error-place m-6">{error}</div>;
  if (addPlayerError)
    return (
      <div className="error-place m-6">
        <p>הייתה בעיה בהוספת הניקוד שלך למאגר השחקנים</p>
      </div>
    );
  if (!isRecordInTopRank) return null;
  return (
    <div className="m-6">
      {addedRecord && <p>השיא נרשם בהצלחה!</p>}
      {!addedRecord && (
        <>
          <label>כתוב את שמך בשביל לרשום את השיא בטבלה:</label>
          <input className="text-box" value={name} onChange={(e) => setName(e.target.value)} />
          <div className="error-place"></div>
          <button className="btn" onClick={handleAddTopRecord}>
            הוסף שיא
          </button>
        </>
      )}
    </div>
  );
}
