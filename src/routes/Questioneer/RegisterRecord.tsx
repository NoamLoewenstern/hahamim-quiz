import { useState, useEffect } from "react";
import { addRecord, isRecordInTopRank } from "~/firebase/lib/records";

export default function RegisterRecord({ score }: { score: number }) {
  const [isInTopRank, setIsInTopRank] = useState(false);
  const [name, setName] = useState("");
  const [addedRecord, setAddedRecord] = useState(false);
  const [error, setError] = useState("");

  const handleAddRecord = async () => {
    try {
      await addRecord({ score, name });
      setAddedRecord(true);
      setError("");
      setName("");
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : (error as any).toString();
      setError(msg);
    }
  };
  useEffect(() => {
    isRecordInTopRank(score).then((isTopRank) => {
      if (isTopRank) {
        setIsInTopRank(isTopRank);
      }
    });
  }, [score]);

  if (!isInTopRank) return null;
  if (error) return <div className="m-6 error-place">{error}</div>;
  return (
    <div className="m-6">
      {addedRecord && <p>השיא נרשם בהצלחה!</p>}
      {!addedRecord && (
        <>
          <label>כתוב את שמך בשביל לרשום את השיא בטבלה:</label>
          <input className="text-box" value={name} onChange={(e) => setName(e.target.value)} />
          <div className="error-place"></div>
          <button className="btn" onClick={handleAddRecord}>
            הוסף שיא
          </button>
        </>
      )}
    </div>
  );
}
