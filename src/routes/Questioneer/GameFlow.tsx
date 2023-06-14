import { useContext, useEffect, useRef } from "react";
import { NUMBER_OF_QUESTIONS_TOTAL } from "~/config";
import { convertDifficultyLevelToHebrew } from "~/types/types";
import { MachineContext } from "./quiz-machine/machineContext";
import { getFormatedTime } from "./quiz-machine/utils";
import { IRabbiType, RabbiTypeKeys } from "~/firebase/types";

export default function GameFlow() {
  const [state, send] = useContext(MachineContext);

  const { currentQuestion: question, elapsedTime, questionNumber, answeredIndex } = state.context;
  if (question === null) {
    return <>Error Question is Null. Should Go To End Of The Game.</>;
  }

  const handleCheckAnswer = (rabbiType: IRabbiType) => {
    if (!state.matches("question")) return;
    const answerIndex = question.options.findIndex((option) => option.value === rabbiType);
    send({ type: "ANSWER", answerIndex });
  };

  const difficultyHebrewFormat = convertDifficultyLevelToHebrew(question.difficultyLevel);

  const answeredStyles = (index: number) => {
    if (!state.matches("feedback") || answeredIndex === null) return "";
    if (index === question.correctIndex) return "correct-answer";

    return answeredIndex === index ? "wrong-answer" : "";
  };
  const optionsDisabled = !state.matches("question");

  return (
    <div className="game-container">
      <h3 className="font-bold text-lg self-center">{`רמת קושי: ${difficultyHebrewFormat}`}</h3>
      <h3 className="font-bold text-lg self-center">{question.title}</h3>
      <div className="answer-btn-group">
        {question.options.map((option, index) => (
          <button
            key={option.value}
            className={`answer-btn ${answeredStyles(index)}`}
            onClick={() => handleCheckAnswer(option.value)}
            disabled={optionsDisabled}
          >
            {option.label}
          </button>
        ))}
      </div>
      <p>{getFormatedTime(elapsedTime)}</p>
      <p>
        שאלה {questionNumber} מתוך {NUMBER_OF_QUESTIONS_TOTAL}
      </p>
      {state.matches("feedback") && <FeedBack />}
    </div>
  );
}
function FeedBack() {
  const [state, send] = useContext(MachineContext);
  const { currentQuestion: question, score, answeredCorrectly } = state.context;
  const nextQuestionBtnRef = useRef<HTMLButtonElement>(null);

  const handleNextQuestion = () => {
    if (!state.matches("feedback")) {
      console.warn(`handleNextQuestion should be called only when state.matches("feedback")`);
      return;
    }
    send("NEXT");
  };
  useEffect(() => {
    if (state.matches("feedback")) {
      nextQuestionBtnRef.current?.focus();
    }
  }, [state.value]);

  return (
    <div className="game-footer" id="game-footer">
      <div className="game-footer-top">
        <span className="after-answer-text"></span>
        <button onClick={handleNextQuestion} className="btn" ref={nextQuestionBtnRef}>
          לשאלה הבאה
        </button>
      </div>
      <div className="game-footer-bottom">
        <span id="smaller-score">ניקוד: {score}</span>
        {!answeredCorrectly && (
          <a href={`https://google.com/search?q=${question?.title}`} target="_blank">
            תלמד עליו קצת
          </a>
        )}
      </div>
    </div>
  );
}
