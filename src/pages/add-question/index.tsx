import { useForm } from "react-hook-form";

import { isMobile } from "react-device-detect";
import { useGlobalLoadingSpinner } from "~/hooks/useLoadingSpinner";
import { useState } from "react";
import { type NextPage } from "next";
import Link from "next/link";
import { api } from "~/utils/api";
import {
  AnswerEnum,
  AnswerTypeInHebrew,
  AnswerTypes,
  Difficulties,
  DifficultyEnum,
  DifficultyInHebrew,
  type IAnswerType,
  type IDifficulty,
} from "~/lib/db/types";

const FormFields = {
  question: "" as string,
  answer: "" as IAnswerType,
  difficulty: "" as IDifficulty & string,
};
export const AddQuestion: NextPage = () => {
  const [addedQuestion, setAddedQuestion] = useState(false);
  const { open: openLoadingSpinner, close: closeLoadingSpinner } = useGlobalLoadingSpinner();
  const addNewQuestion = api.game.requestAddNewQuestion.useMutation({
    onMutate: () => {
      openLoadingSpinner();
    },
    onSuccess: (data) => {
      if (data.success) {
        setAddedQuestion(true);
        reset();
        return;
      }
      if (data.error === "Duplicate question") {
        alert("שאלה קיימת!");
      }
      return;
    },
    onError: (error) => {
      console.error(error);
      alert("שגיאה בשמירה!");
    },
    onSettled: () => {
      closeLoadingSpinner();
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, dirtyFields },
    trigger,
    reset,
  } = useForm<typeof FormFields>({
    mode: "onBlur",
  });

  return (
    <>
      {!addedQuestion && (
        <form
          className="flex flex-col items-center justify-start p-4"
          autoComplete="off"
          onSubmit={() =>
            handleSubmit((values) => {
              addNewQuestion.mutate(values);
            })
          }
        >
          <h2>הוסף שאלה</h2>
          <div className={`flex w-4/5 items-center justify-around ${isMobile ? "flex-col" : ""}`}>
            <div className={`flex w-2/5 flex-col items-start ${isMobile ? "w-full" : ""}`}>
              <label>השאלה</label>
              <input
                className="text-box"
                placeholder="שם הדמות"
                {...register("question", {
                  required: true,
                  validate: (value) => /^[^A-Za-z]+$/.test(value),
                  onChange: () => void trigger("question"),
                })}
              />
              {errors.question && <div className="error-place">מותר רק שמות בעברית</div>}
              {!errors?.question && dirtyFields["question"] && (
                <>
                  <label>מה התשובה?</label>
                  <select
                    defaultValue={""}
                    className="text-box"
                    {...register("answer", {
                      required: true,
                      validate: (value) => AnswerTypes.includes(value),
                      disabled: !!errors?.question,
                    })}
                  >
                    <option value="" disabled hidden>
                      בחר תשובה
                    </option>
                    <option value={AnswerEnum.TANA}>{AnswerTypeInHebrew[AnswerEnum.TANA]}</option>
                    <option value={AnswerEnum.AMORA}>{AnswerTypeInHebrew[AnswerEnum.AMORA]}</option>
                    <option value={AnswerEnum.RISHON}>
                      {AnswerTypeInHebrew[AnswerEnum.RISHON]}
                    </option>
                    <option value={AnswerEnum.ACHARON}>
                      {AnswerTypeInHebrew[AnswerEnum.ACHARON]}
                    </option>
                  </select>
                  {errors.answer && <div className="error-place">תשובה לא אפשרית</div>}
                </>
              )}
              {!errors.question && !errors.answer && dirtyFields["answer"] && (
                <>
                  <label>דרגת קושי</label>
                  <select
                    defaultValue={""}
                    className="text-box"
                    {...register("difficulty", {
                      required: true,
                      validate: (value) => Difficulties.includes(value),
                      disabled: !!errors?.question || !!errors?.answer,
                    })}
                  >
                    <option value="" disabled hidden>
                      בחר דרגת קושי
                    </option>
                    <option value={DifficultyEnum.EASY}>
                      {DifficultyInHebrew[DifficultyEnum.EASY]}
                    </option>
                    <option value={DifficultyEnum.MEDIUM}>
                      {DifficultyInHebrew[DifficultyEnum.MEDIUM]}
                    </option>
                    <option value={DifficultyEnum.HARD}>
                      {DifficultyInHebrew[DifficultyEnum.HARD]}
                    </option>
                  </select>
                  {errors.difficulty && <div className="error-place">תשובה לא אפשרית</div>}
                </>
              )}
            </div>
          </div>
          {isValid && dirtyFields["difficulty"] && (
            <input type="submit" className="btn mt-4" value="הוסף שאלה" />
          )}
        </form>
      )}
      {addedQuestion && (
        <div className="question-added-container">
          <h2>השאלה שלך נוספה בהצלחה!</h2>
          <br />
          <Link href="/">שחק</Link>
          <Link href="#" onClick={() => setAddedQuestion(false)}>
            הוסף עוד שאלה
          </Link>
        </div>
      )}
    </>
  );
};

export default AddQuestion;
