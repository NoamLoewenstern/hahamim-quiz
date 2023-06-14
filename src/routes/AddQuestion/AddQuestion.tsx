import { useForm } from "react-hook-form";

import useIsMobile from "~/hooks/useIsMobile";
import { addQuestion } from "~/firebase/lib/add-question";
import { useGlobalLoadingSpinner } from "~/hooks/useLoadingSpinner";
import { Link, useNavigate } from "react-router-dom";
import "./AddQuestion.scss";
import { useState } from "react";
import { IRabbiType, RabbiTypeKeys } from "~/firebase/types";

const FormFields = {
  question: "",
  answer: "" as IRabbiType,
  level: "" as "easy" | "medium" | "hard",
};
export default function AddQuestion() {
  const isMobile = useIsMobile();
  const [addedQuestion, setAddedQuestion] = useState(false);
  const { open: openLoadingSpinner, close: closeLoadingSpinner } = useGlobalLoadingSpinner();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, dirtyFields },
    trigger,
    reset,
  } = useForm<typeof FormFields>({
    mode: "onBlur",
  });

  const handleAddQuestionSubmit = async (values: typeof FormFields) => {
    try {
      openLoadingSpinner();
      await addQuestion(values);
      setAddedQuestion(true);
      reset();
    } catch (e) {
      alert("שגיאה בשמירה!");
    } finally {
      closeLoadingSpinner();
    }
  };

  return (
    <>
      {!addedQuestion && (
        <form
          className="flex flex-col items-center justify-start p-4"
          autoComplete="off"
          onSubmit={handleSubmit((data) => handleAddQuestionSubmit(data))}
        >
          <h2>הוסף שאלה</h2>
          <div className={`flex items-center justify-around w-4/5 ${isMobile ? "flex-col" : ""}`}>
            <div className={`w-2/5 flex flex-col items-start ${isMobile ? "w-full" : ""}`}>
              <label>השאלה</label>
              <input
                className="text-box"
                placeholder="שם הדמות"
                {...register("question", {
                  required: true,
                  validate: (value) => /^[^A-Za-z]+$/.test(value),
                  onChange: () => trigger("question"),
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
                      validate: (value) => RabbiTypeKeys.includes(value),
                      disabled: !!errors?.question,
                    })}
                  >
                    <option value="" disabled hidden>
                      בחר תשובה
                    </option>
                    <option value="תנא">תנא</option>
                    <option value="אמורא">אמורא</option>
                    <option value="ראשון">ראשון</option>
                    <option value="אחרון">אחרון</option>
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
                    {...register("level", {
                      required: true,
                      validate: (value) => ["easy", "medium", "hard"].includes(value),
                      disabled: !!errors?.question || !!errors?.answer,
                    })}
                  >
                    <option value="" disabled hidden>
                      בחר דרגת קושי
                    </option>
                    <option value="easy">קל</option>
                    <option value="medium">בינוני</option>
                    <option value="hard">כבד</option>
                  </select>
                  {errors.level && <div className="error-place">תשובה לא אפשרית</div>}
                </>
              )}
            </div>
          </div>
          {isValid && dirtyFields["level"] && (
            <input type="submit" className="btn mt-4" value="הוסף שאלה" />
          )}
        </form>
      )}
      {addedQuestion && (
        <div className="question-added-container">
          <h2>השאלה שלך נוספה בהצלחה!</h2>
          <br />
          <Link to="/">שחק</Link>
          <Link to="#" onClick={() => setAddedQuestion(false)}>
            הוסף עוד שאלה
          </Link>
        </div>
      )}
    </>
  );
}
