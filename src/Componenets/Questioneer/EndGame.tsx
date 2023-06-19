import RegisterRecord from "./RegisterRecord";
import { api } from "~/utils/api";
import Link from "next/link";
import { useQuizMachine } from "~/xstate-machines/quiz-machine";

export default function EndGame() {
  const [state] = useQuizMachine();
  const score = state.context.score;

  const { data: { position, totalPlayed } = {} } = api.records.getRecordPosition.useQuery({
    score,
  });
  const recordLocationText = !position ? "" : `${position} מתוך ${totalPlayed}`;

  return (
    <div className="mt-12 w-3/5 text-center" id="end-game-container">
      <p>הניקוד שלך הוא: {score}</p>
      <p>המיקום שלך בציבור הוא: {recordLocationText} שכוייח!</p>
      <RegisterRecord score={score} />
      <EndGameLinks />
    </div>
  );
}

function EndGameLinks() {
  const [, send] = useQuizMachine();

  return (
    <div className="game-page-container">
      <button onClick={() => send("RESET")} className="btn">
        משחק חוזר
      </button>
      <p>(השאלות נבחרות רנדומלית מתוך מאגר גדול)</p>
      <Link href="/add-question" className="btn">
        להוספת שאלה למאגר השאלות
      </Link>
      <Link href="/records" className="btn">
        לרשימת השיאים
      </Link>
    </div>
  );
}
