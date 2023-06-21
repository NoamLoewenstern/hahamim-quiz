import useTitle from "~/hooks/useTitle";
import { useGlobalLoadingSpinner } from "~/hooks/useLoadingSpinner";
import { waitFor } from "xstate/lib/waitFor";
import { useQuizMachine } from "~/xstate-machines/quiz-machine";

export default function HeaderStartGame() {
  const [, send, service] = useQuizMachine();
  const { open, close } = useGlobalLoadingSpinner();
  const { title, subtitle } = useTitle();

  const handlerStart = () => {
    send("START");
    open();
    void waitFor(service, (state) => state.matches("question"), { timeout: 2000 }).then(close);
  };

  return (
    <div className="start-container m-12 text-center">
      <h2>
        {title} - {subtitle}
      </h2>
      <p>{`לפניכם שעשועון שמטרתו להכיר יותר את חכמינו ז"ל.`}</p>
      <p>בכל שאלה יהיה שם של חכם ואתם תצטרכו לדעת מאיזה דור הוא.</p>
      <p>יש שלוש רמות קושי - קל, בינוני, כבד.</p>
      <p>{`בכל דרגת קושי יהיו 6 שאלות, בסה"כ 18 שאלות.`}</p>
      <p>השעשועון על זמן, ויש ניקוד לפי הזמן.</p> <p>בהצלחה !</p>
      <button onClick={handlerStart} className="btn">
        התחל משחק
      </button>
    </div>
  );
}
