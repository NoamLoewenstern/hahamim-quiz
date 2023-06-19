import ScoresChart from "~/Componenets/ScoresChart";
import { Record as IRecord, ScoreCount } from "@prisma/client";
import { GetStaticProps, InferGetStaticPropsType, type NextPage } from "next";
import { prisma } from "~/server/db";

export const getStaticProps: GetStaticProps<{
  records: Pick<IRecord, "name" | "score">[];
  scoresCount: Record<ScoreCount["score"], ScoreCount["count"]>;
  sumTotalPlayed: number;
}> = async () => {
  const records = await prisma.record.findMany({
    select: { name: true, score: true },
    orderBy: { score: "desc" },
  });
  const scoresCount = await prisma.scoreCount.findMany({
    select: { score: true, count: true },
    orderBy: { score: "asc" },
  });
  const scoresCountMap: Record<ScoreCount["score"], ScoreCount["count"]> = scoresCount.reduce(
    (acc, curr) => {
      acc[curr.score] = curr.count;
      return acc;
    },
    {}
  );

  const {
    _sum: { count: sumTotalPlayed },
  } = await prisma.scoreCount.aggregate({
    _sum: { count: true },
  });

  return {
    props: {
      records,
      scoresCount: scoresCountMap,
      sumTotalPlayed: sumTotalPlayed || 0,
    },
    // revalidate: 60,
  };
};

type Props = InferGetStaticPropsType<typeof getStaticProps>;
export const Records: NextPage<Props> = ({
  records = [],
  scoresCount = {},
  sumTotalPlayed = 0,
}) => {
  return (
    <div>
      <div className="records-page-container mt-6">
        <h2>רשימת השיאים (מתוך {sumTotalPlayed} משחקים)</h2>
        <div id="records">
          {records.map((record, i) => (
            <p key={i}>{`${record.score} - ${record.name}`}</p>
          ))}
        </div>
      </div>
      <div className="records-page-container mt-6">
        <h2>סטטיסטיקות</h2>
        <h3>(הניקוד מעוגל לעשרות)</h3>
        <ScoresChart data={scoresCount} />$
      </div>
    </div>
  );
};

export default Records;
