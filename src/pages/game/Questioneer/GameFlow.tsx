import { useEffect, useRef } from "react";
import { NUMBER_OF_QUESTIONS_TOTAL } from "~/config";
import { getFormatedTime } from "~/xstate-machines/quiz-machine/utils";
import {
  AnswerTypeInHebrew,
  AnswerTypes,
  DifficultyInHebrew,
  type IAnswerType,
} from "~/lib/db/types";
import { useQuizMachine } from "~/xstate-machines/quiz-machine";

export default function GameFlow() {
  const [state, send] = useQuizMachine();

  const { currentQuestion: question, elapsedTime, questionNumber, answered } = state.context;
  const answeredIndex = answered ? AnswerTypes.indexOf(answered) : null;
  if (question === null) {
    return <>Error Question is Null. Should Go To End Of The Game.</>;
  }

  const handleCheckAnswer = (answer: IAnswerType) => {
    if (!state.matches("question")) return;
    send({ type: "ANSWER", answer });
  };

  const answeredStyles = (index: number) => {
    if (!state.matches("feedback") || answeredIndex === null) return "";
    if (AnswerTypes[index] === question.answer) return "correct-answer";

    return answeredIndex === index ? "wrong-answer" : "";
  };
  const optionsDisabled = !state.matches("question");

  return (
    <div className="game-container">
      <h3 className="self-center text-lg font-bold">{`רמת קושי: ${
        DifficultyInHebrew[question.difficulty]
      }`}</h3>
      <h3 className="self-center text-lg font-bold">{question.question}</h3>
      <div className="answer-btn-group">
        {AnswerTypes.map((answerOption, index) => (
          <button
            key={answerOption}
            className={`answer-btn ${answeredStyles(index)}`}
            onClick={() => handleCheckAnswer(answerOption)}
            disabled={optionsDisabled}
          >
            {AnswerTypeInHebrew[answerOption]}
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
  const [state, send] = useQuizMachine();
  const { currentQuestion: question, score, answeredCorrectly } = state.context;
  const nextQuestionBtnRef = useRef<HTMLButtonElement>(null);

  const handleNextQuestion = () => {
    if (!state.matches("feedback")) {
      console.warn(`handleNextQuestion should be called only when state.matches("feedback")`);
      return;
    }
    send("NEXT");
  };
  const isFeedback = state.matches("feedback");
  useEffect(() => {
    if (isFeedback) {
      nextQuestionBtnRef.current?.focus();
    }
  }, [isFeedback]);

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
          <a href={`https://google.com/search?q=${question?.question || ""}`} target="_blank">
            תלמד עליו קצת
          </a>
        )}
      </div>
    </div>
  );
}
