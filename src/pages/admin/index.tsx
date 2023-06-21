import { LoadingSpinnerModal } from "~/hooks/useLoadingSpinner";
import { useEffect } from "react";
import { type GetServerSideProps, type NextPage, type InferGetServerSidePropsType } from "next";
import { api } from "~/utils/api";
import { AnswerTypeInHebrew, DifficultyInHebrew } from "~/lib/db/types";
import { getServerAuthSession } from "~/server/auth";
import { type Session } from "next-auth";

export const getServerSideProps: GetServerSideProps<{
  adminUser: Session["user"];
}> = async ({ req, res }) => {
  const session = await getServerAuthSession({ req, res });
  const isAdmin = session?.user.role === "ADMIN";
  if (!session || !isAdmin) {
    return {
      redirect: {
        destination: !session ? "/api/auth/signin" : "/",
        // destination: !session ? "/about" : "/",
        permanent: false,
      },
    };
  }
  return {
    props: {
      adminUser: session.user,
    },
  };
};

type Props = InferGetServerSidePropsType<typeof getServerSideProps>;

export const Admin: NextPage<Props> = () => {
  const {
    data: pendingQuestions,
    isLoading: isLoadingPendingQuestions,
    error: waitingQuestionsError,
    refetch: refetchWaitingQuestions,
  } = api.admin.getPendingQuestions.useQuery();
  const { data: sumTotalPlayed } = api.records.getSumTotalPlayed.useQuery();
  const approveQuestion = api.admin.approveQuestion.useMutation({
    onSuccess: () => {
      void refetchWaitingQuestions();
    },
  });
  const deleteQuestion = api.admin.deleteQuestion.useMutation({
    onSuccess: () => {
      void refetchWaitingQuestions();
    },
  });
  const error = waitingQuestionsError || approveQuestion.error || deleteQuestion.error || null;

  useEffect(() => {
    if (error) console.error(error);
  }, [error]);

  const handleAddQuestionToDB = (questionKey: string) => {
    approveQuestion.mutate(questionKey);
  };
  const handleRemoveWaitingQuestion = (questionKey: string) => {
    deleteQuestion.mutate(questionKey);
  };

  if (isLoadingPendingQuestions)
    return (
      <>
        <p>Loading Waiting Questions...</p>
        <LoadingSpinnerModal />
      </>
    );
  if (error || waitingQuestionsError)
    return <p>Error: {(error || waitingQuestionsError)?.toString?.()}</p>;
  return (
    <div>
      <div className="m-8">
        <h1>שאלות חדשות שהועלו:</h1>
        {!pendingQuestions || pendingQuestions.length === 0 ? (
          <p>אין שאלות חדשות!</p>
        ) : (
          pendingQuestions.map((newQuestion) => {
            const { id, question, answer, difficulty } = newQuestion;
            return (
              <div className="m-4 mb-8" key={id}>
                <h2>{question}</h2>
                <h2>{AnswerTypeInHebrew[answer]}</h2>
                <h2>{DifficultyInHebrew[difficulty]}</h2>
                <button className="btn m-2" onClick={() => handleAddQuestionToDB(id)}>
                  אשר
                </button>
                <button className="btn" onClick={() => handleRemoveWaitingQuestion(id)}>
                  דחה
                </button>
                <a
                  className="btn m-4"
                  href={`https://google.com/search?q=${question}`}
                  target="_blank"
                >
                  חפש בגוגל
                </a>
              </div>
            );
          })
        )}
      </div>

      {sumTotalPlayed && <p>Played Game: {sumTotalPlayed}</p>}
    </div>
  );
};
export default Admin;
