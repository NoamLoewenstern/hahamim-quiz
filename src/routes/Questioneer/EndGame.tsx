import { useContext, useState, useEffect } from "react";
import { getRecordPosition } from "~/firebase/lib/records";
import RegisterRecord from "./RegisterRecord";
import { MachineContext } from "./quiz-machine/machineContext";
import { Link } from "react-router-dom";

export default function EndGame() {
  const [state] = useContext(MachineContext);
  const [recordLocation, setRecordLocation] = useState("");
  const score = state.context.score;

  useEffect(() => {
    if (recordLocation !== "") return;
    getRecordPosition(score).then(({ position, totalCountPlayed }) => {
      setRecordLocation(`${position} מתוך ${totalCountPlayed}`);
    });
  }, []);

  return (
    <div className="mt-12 w-3/5 text-center" id="end-game-container">
      <p>הניקוד שלך הוא: {score}</p>
      <p>המיקום שלך בציבור הוא: {recordLocation} שכוייח!</p>
      <RegisterRecord score={score} />
      <EndGameLinks />
    </div>
  );
}

function EndGameLinks() {
  const [, send] = useContext(MachineContext);

  return (
    <div className="game-page-container">
      <button onClick={() => send("RESET")} className="btn">
        משחק חוזר
      </button>
      <p>(השאלות נבחרות רנדומלית מתוך מאגר גדול)</p>
      <Link to="/add-question" className="btn">
        להוספת שאלה למאגר השאלות
      </Link>
      <Link to="/records" className="btn">
        לרשימת השיאים
      </Link>
    </div>
  );
}
